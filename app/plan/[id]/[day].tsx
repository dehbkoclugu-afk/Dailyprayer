import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { type } from '@/theme/typography';
import { spacing, TAP_MIN } from '@/theme/tokens';
import { usePlans } from '@/data/plans';
import { planReading, formatReadingRef } from '@/data/planReadings';
import { getBible } from '@/data/bibleFull';
import { usePlanStore } from '@/state/usePlanStore';
import { useT } from '@/i18n';
import { NotFoundState } from '@/components/NotFoundState';

export default function PlanDay() {
  const t = useTheme();
  const { t: tr, locale, tu } = useT();
  const { id, day } = useLocalSearchParams<{ id: string; day: string }>();
  const plan = usePlans().find((p) => p.id === id);
  // `Number(day) || 0` quietly turned "abc" into day 1 and let day 9999 render a
  // clamped reading under a "Day 10000" heading. Parse strictly instead.
  const parsedDay = Number(day);
  const dayIdx = Number.isInteger(parsedDay) ? parsedDay : NaN;
  const { progress, toggleDay } = usePlanStore();

  if (!plan) {
    return (
      <NotFoundState
        icon="book-outline"
        title={tr('notFound.planTitle')}
        body={tr('notFound.planBody')}
        actionLabel={tr('notFound.planAction')}
        onAction={() => router.replace('/(tabs)/bible')}
      />
    );
  }

  if (!Number.isInteger(dayIdx) || dayIdx < 0 || dayIdx >= plan.days) {
    return (
      <NotFoundState
        icon="calendar-outline"
        title={tr('notFound.dayTitle')}
        body={tr('notFound.dayBody')}
        actionLabel={tr('notFound.dayAction')}
        onAction={() => router.replace({ pathname: '/plan/[id]', params: { id: plan.id } })}
      />
    );
  }

  const reading = planReading(plan.id, dayIdx, locale);
  const ref = formatReadingRef(reading, locale);
  const firstVerse = getBible(locale)[reading.book]?.chapters[reading.chapter]?.[0]?.[1] ?? '';
  const teaser = firstVerse.length > 170 ? `${firstVerse.slice(0, 170).trimEnd()}…` : firstVerse;
  const done = (progress[plan.id] ?? []).includes(dayIdx);

  const openReader = () =>
    router.push({ pathname: '/read', params: { b: reading.book, c: reading.chapter } });

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
            width: TAP_MIN,
            height: TAP_MIN,
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
          style={{ ...type.labelSemi, letterSpacing: 2,
            color: t.goldText,
            marginTop: spacing.xl }}
        >
          {tu(`${plan.title} · ${tr('plan.dayLabel')} ${dayIdx + 1}`)}
        </Text>

        {/* the day's reading — a real passage in the bundled Bible */}
        <Text style={{ ...type.display, color: t.ink, marginTop: spacing.md }}>
          {ref}
        </Text>
        <Text
          style={{ ...type.labelMedium, letterSpacing: 1,
            color: t.inkFaint,
            marginTop: spacing.sm }}
        >
          {tu(tr('plan.todaysReading'))}
        </Text>

        {teaser ? (
          <View style={{ flexDirection: 'row', marginTop: spacing.xl }}>
            <Text
              style={{ ...type.pullQuote, lineHeight: 46,
                                // Ornament, not copy: at this size WCAG's 3:1 large-text
                // threshold applies and the luminous brand gold clears it.
                color: t.gold,
                marginRight: spacing.sm,
                marginTop: 2 }}
            >
              {'“'}
            </Text>
            <Text
              style={{ ...type.quote, lineHeight: 30,
                color: t.inkSoft,
                flex: 1,
                fontStyle: 'italic' }}
            >
              {teaser}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ gap: spacing.md }}>
        <PillButton label={tr('plan.read')} onPress={openReader} />
        {done ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              paddingVertical: 14,
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color={t.gold} />
            <Text style={{ ...type.bodySemi, color: t.goldText }}>
              {tr('plan.done')}
            </Text>
          </View>
        ) : (
          <PillButton label={tr('plan.complete')} onPress={complete} variant="secondary" />
        )}
      </View>
    </Screen>
  );
}
