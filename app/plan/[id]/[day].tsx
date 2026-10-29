import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { PlanDayArtwork } from '@/components/PlanDayArtwork';
import { useTheme } from '@/hooks/useTheme';
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { usePlans } from '@/data/plans';
import { planChapters, planReading, formatReadingRef } from '@/data/planReadings';
import { getBookName } from '@/data/bibleFull';
import { findBookIndex } from '@/data/bibleNav';
import { useBible } from '@/hooks/useBible';
import { useRequirePlus } from '@/hooks/useRequirePlus';
import { goBack } from '@/lib/navigation';
import { truncate } from '@/lib/text';
import { bookMeta } from '@/data/bibleMeta';
import { usePlanStore } from '@/state/usePlanStore';
import { useT } from '@/i18n';
import { useScriptureLocale } from '@/i18n/scripture';
import { InvalidRouteState } from '@/components/InvalidRouteState';
import { singleParam, validPlanDay } from '@/lib/routeValidation';
import { localeUpperCase } from '@/i18n/localeText';
import { toast } from '@/state/useToastStore';
import { TopAppBar } from '@/components/TopAppBar';

export default function PlanDay() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const { id, day } = useLocalSearchParams<{ id: string | string[]; day: string | string[] }>();
  const planId = singleParam(id);
  const plan = usePlans().find((p) => p.id === planId);
  const dayIdx = plan ? validPlanDay(day, plan.days) : null;
  const progress = usePlanStore((s) => s.progress);
  const toggleDay = usePlanStore((s) => s.toggleDay);
  // Deep links can open a Plus plan directly; send those to the paywall.
  const allowed = useRequirePlus(Boolean(plan?.plus), 'plan');
  const bible = useBible(scriptureLocale);

  if (!plan || dayIdx == null) return <InvalidRouteState />;
  if (!allowed) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  const reading = planReading(plan.id, dayIdx);
  const ref = formatReadingRef(reading, locale);
  // Multi-chapter days (e.g. Bible in a Year) list every chapter of the reading.
  const chapters = planChapters(reading).map(([book, chapter]) => ({
    code: bookMeta[book]?.code ?? '',
    chapter,
  }));
  const first = chapters[0];
  const firstVerse = bible
    ? bible[findBookIndex(bible, first.code)]?.chapters[first.chapter]?.[0]?.[1] ?? ''
    : '';
  const teaser = truncate(firstVerse, 170);
  const done = (progress[plan.id] ?? []).includes(dayIdx);

  const openChapter = (code: string, chapter: number) =>
    router.push({ pathname: '/read', params: { b: code, c: chapter } });
  const openReader = () => openChapter(first.code, first.chapter);

  const complete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (!done) {
      toggleDay(plan.id, dayIdx);
      toast(`${plan.title}: ${tr('plan.done')}`);
    }
  };
  const hasNextDay = dayIdx + 1 < plan.days;
  const openNextDay = () => router.replace({ pathname: '/plan/[id]/[day]', params: { id: plan.id, day: dayIdx + 1 } });

  return (
    <Screen style={{ justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <TopAppBar title={`${plan.title} · ${tr('plan.dayLabel')} ${dayIdx + 1}`} />

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

        {/* the day's reading — a real passage in the bundled Bible */}
        <Text style={{ ...ty.displaySmall, color: t.ink, marginTop: spacing.md }}>
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
                ...ty.displayNumeral,
                color: t.gold,
                marginRight: spacing.sm,
              }}
            >
              {'“'}
            </Text>
            <Text
              style={{
                ...ty.editorialQuote,
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
        {chapters.length > 1 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' }}>
            {chapters.map((item) => {
              const label = `${getBookName(scriptureLocale, item.code)} ${item.chapter + 1}`;
              return (
                <Pressable
                  key={`${item.code}-${item.chapter}`}
                  onPress={() => openChapter(item.code, item.chapter)}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  style={({ pressed }) => ({
                    minHeight: 48,
                    paddingHorizontal: spacing.lg,
                    justifyContent: 'center',
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: t.border,
                    backgroundColor: t.surface,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ ...ty.label, color: t.ink }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        {done ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 14 }}>
              <Ionicons name="checkmark-circle" size={20} color={t.gold} />
              <Text style={{ ...ty.bodyCompactStrong, color: t.gold }}>{tr('plan.done')}</Text>
            </View>
            {hasNextDay ? (
              <PillButton label={`${tr('read.next')}: ${tr('plan.dayLabel')} ${dayIdx + 2}`} onPress={openNextDay} variant="secondary" />
            ) : (
              <PillButton label={tr('a11y.back')} onPress={() => goBack()} variant="secondary" />
            )}
          </>
        ) : (
          <PillButton label={tr('plan.complete')} onPress={complete} variant="secondary" />
        )}
      </View>
    </Screen>
  );
}
