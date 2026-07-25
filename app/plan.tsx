import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { ArtSlot } from '@/components/ArtSlot';
import { PillButton } from '@/components/PillButton';
import { planArt } from '@/assets/registry';
import { plans } from '@/data/plans';
import { useBibleStore } from '@/state/useBibleStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';

export default function PlanDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = plans.find((item) => item.id === id) ?? plans[0];
  const t = useTheme();
  const { t: tr } = useT();
  const progress = useBibleStore((state) => state.planProgress[plan.id] ?? 0);
  const isPlus = useEntitlementStore((state) => state.isPlus);
  const startPlan = useBibleStore((state) => state.startPlan);
  const completePlanDay = useBibleStore((state) => state.completePlanDay);
  const completed = progress >= plan.days;
  const locked = plan.plus && !isPlus;

  return (
    <Screen>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={tr('common.close')}
        style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
      >
        <Ionicons name="chevron-back" size={24} color={t.ink} />
      </Pressable>
      <ArtSlot id={planArt(plan.id)} height={220} radius={radius.hero} />
      <Text style={[ty.title, { color: t.ink, marginTop: spacing.xl }]}>{plan.title}</Text>
      <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.sm }]}>{plan.tagline}</Text>
      {locked ? (
        <View
          style={{
            backgroundColor: t.surface,
            borderRadius: radius.inner,
            padding: spacing.lg,
            marginTop: spacing.lg,
          }}
        >
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 15, color: t.ink }}>
            {tr('plan.previewTitle')}
          </Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: t.inkSoft, marginTop: spacing.xs }}>
            {tr('plan.previewBody')}
          </Text>
        </View>
      ) : null}
      <View
        style={{
          height: 6,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: t.surfaceAlt,
          marginTop: spacing.xl,
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${Math.min(100, (progress / plan.days) * 100)}%`,
            backgroundColor: t.gold,
          }}
        />
      </View>
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.inkSoft, marginTop: spacing.sm }}>
        {progress} / {plan.days} {tr('bible.days')}
      </Text>
      <PillButton
        label={
          locked
            ? tr('plan.unlock')
            : completed
            ? tr('plan.completed')
            : progress === 0
              ? tr('plan.start')
              : tr('plan.completeToday')
        }
        disabled={!locked && completed}
        onPress={() =>
          locked
            ? router.push(`/paywall?from=plan-${plan.id}`)
            : progress === 0
              ? startPlan(plan.id)
              : completePlanDay(plan.id, plan.days)
        }
        style={{ marginTop: spacing.xl }}
      />
    </Screen>
  );
}
