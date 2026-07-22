import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { usePlans, planDayVerse } from '@/data/plans';
import { usePlanStore } from '@/state/usePlanStore';
import { useT } from '@/i18n';

export default function PlanScreen() {
  const t = useTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = usePlans().find((p) => p.id === id);
  const progress = usePlanStore((s) => s.progress);

  if (!plan) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  const done = progress[plan.id] ?? [];
  const days = Array.from({ length: plan.days }, (_, i) => i);

  const header = (
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
          marginBottom: spacing.lg,
        }}
      >
        <Ionicons name="chevron-back" size={24} color={t.inkSoft} />
      </Pressable>

      <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
        <ArtSlot id={plan.art} height={170} radius={radius.card}>
          <LinearGradient
            colors={[`${plan.gradient[0]}CC`, `${plan.gradient[1]}F2`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          />
          <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'flex-end' }}>
            <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: '#F2EEE6' }}>{plan.title}</Text>
            <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: 'rgba(242,238,230,0.8)', marginTop: spacing.xs }}>
              {plan.tagline}
            </Text>
          </View>
        </ArtSlot>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
        <View style={{ height: 6, backgroundColor: t.surfaceAlt, borderRadius: 3, overflow: 'hidden' }}>
          <View
            style={{
              width: `${(done.length / plan.days) * 100}%`,
              height: '100%',
              backgroundColor: t.gold,
              borderRadius: 3,
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 13,
            color: t.inkSoft,
            marginTop: spacing.sm,
            fontVariant: ['tabular-nums'],
          }}
        >
          {done.length} / {plan.days} {tr('bible.days')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        data={days}
        keyExtractor={(d) => String(d)}
        ListHeaderComponent={header}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + spacing.xl,
          paddingHorizontal: spacing.xl,
          paddingBottom: insets.bottom + spacing.xxl,
          maxWidth: 480,
          width: '100%',
          alignSelf: 'center',
        }}
        renderItem={({ item: dayIdx }) => {
          const verse = planDayVerse(plan.id, dayIdx);
          const isDone = done.includes(dayIdx);
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/plan/[id]/[day]', params: { id: plan.id, day: dayIdx } })}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                backgroundColor: t.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: isDone ? t.gold : t.border,
                padding: spacing.lg,
                marginBottom: spacing.md,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: isDone ? t.gold : t.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={18} color={t.onGold} />
                ) : (
                  <Text style={{ fontFamily: fonts.sansBold, fontSize: 13, color: t.inkSoft, fontVariant: ['tabular-nums'] }}>
                    {dayIdx + 1}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 15, color: t.ink }}>
                  {tr('plan.dayLabel')} {dayIdx + 1}
                </Text>
                <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: isDone ? t.gold : t.inkSoft, marginTop: 2 }}>
                  {verse.reference}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={t.inkFaint} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}
