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
import { planChapters, planReading, formatReadingRef } from '@/data/planReadings';
import { getBookName } from '@/data/bibleFull';
import { bookMeta } from '@/data/bibleMeta';
import { findBookIndex } from '@/data/bibleNav';
import { truncate } from '@/lib/text';
import { useBible } from '@/hooks/useBible';
import { useRequirePlus } from '@/hooks/useRequirePlus';
import { usePlanStore } from '@/state/usePlanStore';
import { useT } from '@/i18n';
import { useScriptureLocale } from '@/i18n/scripture';
import { BackButton } from '@/components/BackButton';

export default function PlanDay() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const { id, day } = useLocalSearchParams<{ id: string; day: string }>();
  const plan = usePlans().find((p) => p.id === id);
  const parsedDay = /^\d+$/.test(day ?? '') ? Number(day) : NaN;
  const dayIdx = plan && Number.isInteger(parsedDay) && parsedDay < plan.days ? parsedDay : 0;
  const progress = usePlanStore((s) => s.progress);
  const toggleDay = usePlanStore((s) => s.toggleDay);
  const allowed = useRequirePlus(Boolean(plan?.plus), 'plan');
  const bible = useBible(scriptureLocale);

  if (!plan || !allowed) return <View style={{ flex: 1, backgroundColor: t.bg }} />;

  const reading = planReading(plan.id, dayIdx);
  const ref = formatReadingRef(reading, locale);
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

  const openReader = (code: string, chapter: number) =>
    router.push({ pathname: '/read', params: { b: code, c: chapter } });

  const complete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (!done) toggleDay(plan.id, dayIdx);
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/plan/[id]', params: { id: plan.id } });
  };

  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <BackButton />

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

        {/* the day's reading — a real passage in the bundled Bible */}
        <Text accessibilityRole="header" style={{ fontFamily: fonts.serif, fontSize: 34, color: t.ink, marginTop: spacing.md }}>
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
        <PillButton label={tr('plan.read')} onPress={() => openReader(first.code, first.chapter)} />
        {chapters.length > 1 ? (
          // Multi-chapter days: every chapter of the reading is one tap away.
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' }}>
            {chapters.map((item) => {
              const label = `${getBookName(scriptureLocale, item.code)} ${item.chapter + 1}`;
              return (
                <Pressable
                  key={`${item.code}-${item.chapter}`}
                  onPress={() => openReader(item.code, item.chapter)}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  style={({ pressed }) => ({
                    minHeight: 44,
                    paddingHorizontal: spacing.lg,
                    justifyContent: 'center',
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: t.border,
                    backgroundColor: t.surface,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.ink }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
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
