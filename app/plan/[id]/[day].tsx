import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { PlanDayArtwork } from '@/components/PlanDayArtwork';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { usePlans } from '@/data/plans';
import { planReading, formatReadingRef } from '@/data/planReadings';
import { getBible } from '@/data/bibleFull';
import { bookMeta } from '@/data/bibleMeta';
import { usePlanStore } from '@/state/usePlanStore';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import { useScriptureLocale } from '@/i18n/scripture';
import { InvalidRouteState } from '@/components/InvalidRouteState';
import { singleParam, validPlanDay } from '@/lib/routeValidation';
import { localeUpperCase } from '@/i18n/localeText';
import { toast } from '@/state/useToastStore';

export default function PlanDay() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const { id, day } = useLocalSearchParams<{ id: string | string[]; day: string | string[] }>();
  const planId = singleParam(id);
  const plan = usePlans().find((p) => p.id === planId);
  const dayIdx = plan ? validPlanDay(day, plan.days) : null;
  const { progress, toggleDay } = usePlanStore();

  if (!plan || dayIdx == null) return <InvalidRouteState />;

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
    if (!done) {
      toggleDay(plan.id, dayIdx);
      toast(`${plan.title}: ${tr('plan.done')}`);
    }
    router.back();
  };

  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={tr('a11y.back')}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={24} color={t.inkSoft} />
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
            ...ty.overline,
            color: t.gold,
            marginTop: spacing.lg,
          }}
        >
          {localeUpperCase(`${plan.title} · ${tr('plan.dayLabel')} ${dayIdx + 1}`, locale)}
        </Text>

        {/* the day's reading , a real passage in the bundled Bible */}
        <Text style={{ fontFamily: fonts.serif, fontSize: 34, color: t.ink, marginTop: spacing.md }}>
          {ref}
        </Text>
        <Text
          style={{
            ...ty.labelSmall,
            letterSpacing: 1,
            color: t.inkFaint,
            marginTop: spacing.sm,
          }}
        >
          {localeUpperCase(tr('plan.todaysReading'), locale)}
        </Text>

        {teaser ? (
          <View
            style={{
              flex: 1,
              minHeight: 150,
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: spacing.xl,
              marginBottom: spacing.xl,
              padding: spacing.lg,
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.border,
              borderRadius: radius.card,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.serif,
                fontSize: 46,
                lineHeight: 46,
                color: t.gold,
                marginRight: spacing.sm,
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
