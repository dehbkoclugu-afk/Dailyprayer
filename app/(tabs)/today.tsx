import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { VerseCard } from '@/components/VerseCard';
import { RitualCard } from '@/components/RitualCard';
import { StreakFlame } from '@/components/StreakFlame';
import { ProgressRing } from '@/components/ProgressRing';
import { SectionHeader } from '@/components/SectionHeader';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing, art, FIXED_CARD_TEXT_SCALE } from '@/theme/tokens';
import { useDailyContent } from '@/hooks/useDailyContent';
import { getVerses, type DailyVerse } from '@/data/verses';
import { useScriptureLocale } from '@/i18n/scripture';
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { greetingFor, dayKey } from '@/lib/dates';
import { usePrayers } from '@/data/prayers';
import { prayerArt } from '@/assets/registry';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';
import { useNow } from '@/hooks/useNow';
import type { RitualStep } from '@/state/useStreakStore';

/** Locale-aware date line using the locale's native order, month, and weekday. */
function formatDateLine(now: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(now);
  } catch {
    return new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(now);
  }
}

export default function Today() {
  const t = useTheme();
  const artwork = useArtwork();
  const dawn = artwork.scheme === 'dawn';
  const { t: tr, locale } = useT();
  const scriptureLocale = useScriptureLocale();
  const { verse, devotional } = useDailyContent();
  // The verse of the day is fixed by date, but let people browse the pool — a
  // shuffle swaps in another verse without touching the day's read-streak.
  const [otherVerse, setOtherVerse] = useState<DailyVerse | null>(null);
  const shownVerse = otherVerse ?? verse;
  const shuffleVerse = () => {
    const pool = getVerses(scriptureLocale);
    if (pool.length < 2) return;
    let next = shownVerse;
    while (next.reference === shownVerse.reference) {
      next = pool[Math.floor(Math.random() * pool.length)];
    }
    setOtherVerse(next);
  };
  // Drop a shuffled pick when the language changes so it doesn't show stale text.
  useEffect(() => setOtherVerse(null), [scriptureLocale]);
  const prayers = usePrayers();
  const name = useUserStore((s) => s.quiz.name);
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const count = useStreakStore((s) => s.count);
  const lastTickDay = useStreakStore((s) => s.lastTickDay);
  const doneDay = useStreakStore((s) => s.doneDay);
  const doneSteps = useStreakStore((s) => s.doneSteps);
  const completeStep = useStreakStore((s) => s.completeStep);

  // Re-renders at midnight / each hour / on foreground so the date, greeting
  // and "done today" state never go stale while the app stays in memory.
  const now = useNow();
  const today = dayKey(now);
  const litToday = lastTickDay === today;
  const doneCount = doneDay === today ? doneSteps.length : 0;
  const dateLine = formatDateLine(now, locale);
  const greeting = greetingFor(now.getHours());
  const greetText =
    greeting === 'morning' ? tr('today.morning') : greeting === 'afternoon' ? tr('today.afternoon') : tr('today.evening');

  const isDone = (s: RitualStep) => doneDay === today && doneSteps.includes(s);

  // Content packs are validated to include these categories, but never crash
  // the home screen if one is missing — fall back to any prayer.
  const morningPrayer = prayers.find((p) => p.category === 'morning') ?? prayers[0];
  const sleepPrayer = prayers.find((p) => p.category === 'sleep') ?? prayers[prayers.length - 1];
  const sleepLocked = Boolean(sleepPrayer?.plus && !isPlus);
  const openSleep = () =>
    sleepLocked
      ? router.push('/paywall?from=sleep')
      : router.push({ pathname: '/player', params: { id: sleepPrayer.id } });

  return (
    <Screen tabbed>
      {/* candle-glow wash behind the header — a soft top-down fade, not a hard
          disc. The old 340px circle read as an unintentional dark dome; a
          vertical gradient bleeds warmth in without a visible shape edge. */}
      {!dawn ? (
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(217,164,65,0.10)', 'rgba(217,164,65,0.0)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ position: 'absolute', top: -60, left: -40, right: -40, height: 300 }}
        />
      ) : null}

      {/* A calm editorial masthead: the date and greeting lead; streak stays a
          compact ritual marker instead of looking like a settings tile. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: spacing.lg }}>
          <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE}
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 11,
              letterSpacing: 2.5,
              textTransform: 'uppercase',
              color: t.gold,
              opacity: 0.85,
            }}
          >
            {dateLine}
          </Text>
          <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE} accessibilityRole="header" style={[ty.display, { color: t.ink, fontSize: 34, lineHeight: 40, marginTop: spacing.xs }]}>
            {name ? tr('format.nameLast', { text: greetText, name }) : greetText}
          </Text>
        </View>
        <View
          accessibilityLabel={`${count} ${tr('today.dayStreak')}`}
          style={{
            width: 68,
            height: 68,
            borderRadius: 34,
            backgroundColor: litToday ? t.goldSoft : t.surface,
            borderColor: litToday ? t.gold : t.border,
            borderWidth: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StreakFlame count={count} litToday={litToday} />
        </View>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <VerseCard
          verse={shownVerse}
          onShuffle={shuffleVerse}
          // Only the verse of the day counts toward today's rhythm, not a shuffled pick.
          onRead={otherVerse ? undefined : () => {
            if (!isDone('verse')) {
              completeStep('verse');
              toast(translate('toast.verse', { done: doneCount + 1, total: 4 }));
            }
          }}
        />
      </View>

      <SectionHeader
        title={tr('today.rhythm')}
        right={<ProgressRing done={doneCount} total={4} size={46} />}
      />
      <View style={{ gap: spacing.md }}>
        <RitualCard
          icon="book-outline"
          art="A18-ritual-reading"
          title={tr('today.devotional')}
          subtitle={`${devotional.title} · ${tr('today.twoMinuteRead')}`}
          done={isDone('devotional')}
          onPress={() => router.push('/devotional')}
        />
        <RitualCard
          icon="flame-outline"
          art={prayerArt(morningPrayer.id)}
          title={tr('today.guidedPrayer')}
          subtitle={`${morningPrayer.title} · ${morningPrayer.minutes} ${tr('pray.min')}`}
          done={isDone('prayer')}
          onPress={() => router.push({ pathname: '/player', params: { id: morningPrayer.id } })}
        />
        <RitualCard
          icon="heart-outline"
          art="A20-ritual-gratitude"
          title={tr('today.gratitude')}
          subtitle={tr('today.gratitudeSub')}
          done={isDone('gratitude')}
          onPress={() => router.push('/(tabs)/journal')}
        />
      </View>

      <SectionHeader
        title={tr('today.tonight')}
      />
      {/* Night shifts the palette: indigo art card, not a standard row */}
      <View>
        <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
          <ArtSlot id={prayerArt(sleepPrayer.id)} height={150} radius={radius.card} variant={dawn ? 'card' : 'bare'}>
            {!dawn ? (
              <LinearGradient
                colors={['rgba(30,26,58,0.35)', 'rgba(10,12,24,0.92)']}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
            ) : null}
            <View
              style={{
                flex: 1,
                padding: spacing.xl,
                paddingRight: 96,
                justifyContent: 'flex-end',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE}
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 11,
                    letterSpacing: 2.5,
                    textTransform: 'uppercase',
                    color: t.gold,
                  }}
                >
{tr('today.sleepPrayer')}
                </Text>
                <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE}
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: 21,
                    color: art.ink,
                    marginTop: 4,
                    textShadowColor: 'rgba(0,0,0,0.72)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 7,
                  }}
                >
                  {sleepPrayer.title} · {sleepPrayer.minutes} {tr('pray.min')}
                </Text>
              </View>
              <Pressable
                onPress={openSleep}
                accessibilityRole="button"
                accessibilityLabel={
                  sleepLocked ? tr('a11y.unlockSleep') : `${tr('a11y.play')} ${sleepPrayer.title}`
                }
                style={({ pressed }) => ({
                  position: 'absolute',
                  right: dawn ? 24 : spacing.xl,
                  bottom: spacing.xl,
                  minHeight: 44,
                  justifyContent: 'center',
                  backgroundColor: t.gold,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.lg,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE} style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, color: t.onGold }}>
                  {sleepLocked ? tr('today.unlock') : tr('today.play')}
                </Text>
              </Pressable>
            </View>
            {sleepLocked ? (
              <View
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                style={{
                  position: 'absolute',
                  top: spacing.lg,
                  right: spacing.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: dawn ? t.goldSoft : 'rgba(14,18,32,0.7)',
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                }}
              >
                <Ionicons name="lock-closed" size={11} color={t.gold} />
                <Text maxFontSizeMultiplier={FIXED_CARD_TEXT_SCALE} style={{ fontFamily: fonts.sansBold, fontSize: 10, color: t.gold }}>PLUS</Text>
              </View>
            ) : null}
          </ArtSlot>
        </View>
      </View>
    </Screen>
  );
}
