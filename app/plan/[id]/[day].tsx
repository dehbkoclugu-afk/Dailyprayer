import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { PlanDayArtwork } from '@/components/PlanDayArtwork';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { usePlans } from '@/data/plans';
import { planReading, formatReadingRef } from '@/data/planReadings';
import { getBible } from '@/data/bibleFull';
import { bookMeta } from '@/data/bibleMeta';
import { usePlanStore } from '@/state/usePlanStore';
import { useT } from '@/i18n';
import { useScriptureLocale } from '@/i18n/scripture';

export default function PlanDay() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const { id, day } = useLocalSearchParams<{ id: string; day: string }>();
  const plan = usePlans().find((p) => p.id === id);
  const dayIdx = Number(day) || 0;
  const { progress, toggleDay } = usePlanStore();

  if (!plan) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  const reading = planReading(plan.id, dayIdx);
  const ref = formatReadingRef(reading, locale);
  const bible = getBible(scriptureLocale);
  const readingCode = bookMeta[reading.book]?.code;
  const matchingBookIndex = readingCode ? bible.findIndex((book) => book.code === readingCode) : -1;
  const readerBookIndex = matchingBookIndex >= 0 ? matchingBookIndex : reading.book;
  const firstVerse = bible[readerBookIndex]?.chapters[reading.chapter]?.[0]?.[1] ?? '';
  const teaser = firstVerse.length > 170 ? `${firstVerse.slice(0, 170).trimEnd()}…` : firstVerse;
  const done = (progress[plan.id] ?? []).includes(dayIdx);

  const openReader = () =>
    router.push({ pathname: '/read', params: { b: readerBookIndex, c: reading.chapter } });

  const complete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (!done) toggleDay(plan.id, dayIdx);
    router.back();
  };

  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
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

        <PlanDayArtwork
          planId={plan.id}
          dayIndex={dayIdx}
          height={138}
          radius={radius.card}
          variant="hero"
          style={{ marginTop: spacing.lg, borderWidth: 1, borderColor: t.border }}
        />

        <Text
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: 12,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: t.gold,
            marginTop: spacing.lg,
          }}
        >
          {plan.title} · {tr('plan.dayLabel')} {dayIdx + 1}
        </Text>

        {/* the day's reading , a real passage in the bundled Bible */}
        <Text style={{ fontFamily: fonts.serif, fontSize: 34, color: t.ink, marginTop: spacing.md }}>
          {ref}
        </Text>
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 13,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: t.inkFaint,
            marginTop: spacing.sm,
          }}
        >
          {tr('plan.todaysReading')}
        </Text>

        {teaser ? (
          <View style={{ flexDirection: 'row', marginTop: spacing.xl }}>
            <Text
              style={{
                fontFamily: fonts.serif,
                fontSize: 46,
                lineHeight: 46,
                color: t.gold,
                marginRight: spacing.sm,
                marginTop: 2,
              }}
            >
              {'“'}
            </Text>
            <Text
              style={{
                fontFamily: fonts.serifLight,
                fontSize: 19,
                lineHeight: 30,
                color: t.inkSoft,
                flex: 1,
                fontStyle: 'italic',
              }}
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
            <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.gold }}>
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
