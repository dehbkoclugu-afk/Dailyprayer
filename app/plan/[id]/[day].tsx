import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/tokens';
import { usePlans, planDayVerse } from '@/data/plans';
import { usePlanStore } from '@/state/usePlanStore';
import { useT } from '@/i18n';

export default function PlanDay() {
  const t = useTheme();
  const { t: tr } = useT();
  const { id, day } = useLocalSearchParams<{ id: string; day: string }>();
  const plan = usePlans().find((p) => p.id === id);
  const dayIdx = Number(day) || 0;
  const { progress, toggleDay } = usePlanStore();

  if (!plan) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  const verse = planDayVerse(plan.id, dayIdx);
  const done = (progress[plan.id] ?? []).includes(dayIdx);

  const complete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (!done) toggleDay(plan.id, dayIdx);
    router.back();
  };

  return (
    <Screen style={{ justifyContent: 'space-between' }}>
      <View>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={tr('a11y.back')}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Ionicons name="chevron-back" size={24} color={t.inkSoft} />
        </Pressable>

        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: t.gold,
            marginTop: spacing.xl,
          }}
        >
          {plan.title} · {tr('plan.dayLabel')} {dayIdx + 1}
        </Text>

        {/* the passage, given room to breathe — a reading, not a checklist item */}
        <View style={{ flexDirection: 'row', marginTop: spacing.xl }}>
          <Text
            style={{
              fontFamily: fonts.serif,
              fontSize: 60,
              lineHeight: 60,
              color: t.gold,
              marginRight: spacing.sm,
              marginTop: 4,
            }}
          >
            {'“'}
          </Text>
          <Text
            style={{
              fontFamily: fonts.serifLight,
              fontSize: 23,
              lineHeight: 36,
              color: t.ink,
              flex: 1,
            }}
          >
            {verse.text}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 15,
            color: t.gold,
            marginTop: spacing.xl,
            marginLeft: spacing.xl,
          }}
        >
          — {verse.reference}
        </Text>
      </View>

      {done ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: 16,
          }}
        >
          <Ionicons name="checkmark-circle" size={20} color={t.gold} />
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.gold }}>
            {tr('plan.done')}
          </Text>
        </View>
      ) : (
        <PillButton label={tr('plan.complete')} onPress={complete} />
      )}
    </Screen>
  );
}
