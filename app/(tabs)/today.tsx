import React, { useEffect, useState } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
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
import { type as ty } from '@/theme/typography';
import { interaction, radius, spacing } from '@/theme/tokens';
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
import { localeUpperCase } from '@/i18n/localeText';
import { getDirectionalIconName } from '@/i18n/direction';
import { foldablePaneGap, isExpandedLayout } from '@/lib/adaptiveLayout';
import { nextDailyStep, shouldExpandTonight } from '@/lib/dailyExperience';
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
  const { width } = useWindowDimensions();
  const expanded = isExpandedLayout(width);
  const scriptureLocale = useScriptureLocale();
  const { verse, devotional } = useDailyContent();
  // The verse of the day is fixed by date, but let people browse the pool , a
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
  const { count, lastTickDay, doneDay, doneSteps } = useStreakStore();
  const litToday = lastTickDay === dayKey();
  const doneCount = doneDay === dayKey() ? doneSteps.length : 0;

  const now = new Date();
  const todaySteps = doneDay === dayKey() ? doneSteps : [];
  const nextStep = nextDailyStep(todaySteps);
  const tonightExpanded = shouldExpandTonight(now.getHours());
  const dateLine = formatDateLine(now, locale);
  const greeting = greetingFor(now.getHours());
  const greetText =
    greeting === 'morning' ? tr('today.morning') : greeting === 'afternoon' ? tr('today.afternoon') : tr('today.evening');

  const isDone = (s: 'verse' | 'devotional' | 'prayer' | 'gratitude') =>
    doneDay === dayKey() && doneSteps.includes(s);

  const morningPrayer = prayers.find((p) => p.category === 'morning')!;
  const sleepPrayer = prayers.find((p) => p.category === 'sleep')!;
  const completeStep = useStreakStore((s) => s.completeStep);
  const uncompleteStep = useStreakStore((s) => s.uncompleteStep);
  const undoStep = (step: 'verse' | 'devotional' | 'prayer' | 'gratitude', title: string) => {
    uncompleteStep(step);
    toast(`${title}: ${tr('today.undo')}`);
  };
  const stepTitle = (step: RitualStep) => ({
    verse: tr('today.verseOfDay'),
    devotional: tr('today.devotional'),
    prayer: tr('today.guidedPrayer'),
    gratitude: tr('today.gratitude'),
  })[step];
  const openStep = (step: RitualStep) => {
    if (step === 'verse') {
      completeStep('verse');
      toast(translate('toast.verse'));
    } else if (step === 'devotional') {
      router.push('/devotional');
    } else if (step === 'prayer') {
      router.push({ pathname: '/player', params: { id: morningPrayer.id } });
    } else {
      router.push('/(tabs)/journal');
    }
  };

  return (
    <Screen tabbed>
      {/* candle-glow wash behind the header , a soft top-down fade, not a hard
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
          <Text
            style={{
              ...ty.overline,
              color: t.gold,
              opacity: 0.85,
            }}
          >
            {localeUpperCase(dateLine, locale)}
          </Text>
          <Text style={[ty.displaySmall, { color: t.ink, marginTop: spacing.xs }]}>
            {greetText}{name ? `, ${name}` : ''}
          </Text>
        </View>
        <View
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

      <View style={{ flexDirection: expanded ? 'row' : 'column', alignItems: 'flex-start', gap: expanded ? foldablePaneGap(width) : spacing.xl }}>
      <View style={{ flex: expanded ? 1 : undefined, width: expanded ? undefined : '100%' }}>
      {nextStep ? (
        <Pressable
          onPress={() => openStep(nextStep)}
          accessibilityRole="button"
          accessibilityLabel={`${tr('read.next')}: ${stepTitle(nextStep)}`}
          style={({ pressed }) => ({
            marginTop: spacing.xl,
            minHeight: 64,
            borderRadius: radius.inner,
            borderWidth: 1,
            borderColor: t.gold,
            backgroundColor: t.goldSoft,
            paddingHorizontal: spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            opacity: pressed ? interaction.pressedOpacity : 1,
          })}
        >
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.gold, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={getDirectionalIconName('arrow-forward', locale)} size={19} color={t.onGold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...ty.labelSmall, color: t.gold }}>{localeUpperCase(tr('read.next'), locale)}</Text>
            <Text style={{ ...ty.bodyStrong, color: t.ink, marginTop: 2 }}>{stepTitle(nextStep)}</Text>
          </View>
        </Pressable>
      ) : null}
      <View style={{ marginTop: spacing.xl }}>
        <VerseCard
          verse={shownVerse}
          onShuffle={shuffleVerse}
          onRead={() => {
            if (!isDone('verse')) {
              completeStep('verse');
              toast(translate('toast.verse'));
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
          featured={nextStep === 'devotional'}
          onPress={() => isDone('devotional') ? undoStep('devotional', tr('today.devotional')) : router.push('/devotional')}
        />
        <RitualCard
          icon="flame-outline"
          art={prayerArt(morningPrayer.id)}
          title={tr('today.guidedPrayer')}
          subtitle={`${morningPrayer.title} · ${morningPrayer.minutes} ${tr('pray.min')}`}
          done={isDone('prayer')}
          featured={nextStep === 'prayer'}
          onPress={() => isDone('prayer') ? undoStep('prayer', tr('today.guidedPrayer')) : router.push({ pathname: '/player', params: { id: morningPrayer.id } })}
        />
        <RitualCard
          icon="heart-outline"
          art="A20-ritual-gratitude"
          title={tr('today.gratitude')}
          subtitle={tr('today.gratitudeSub')}
          done={isDone('gratitude')}
          featured={nextStep === 'gratitude'}
          onPress={() => isDone('gratitude') ? undoStep('gratitude', tr('today.gratitude')) : router.push('/(tabs)/journal')}
        />
      </View>
      </View>

      <View style={{ flex: expanded ? 1 : undefined, width: expanded ? undefined : '100%' }}>
      <SectionHeader
        title={tr('today.tonight')}
      />
      {/* Night shifts the palette: indigo art card, not a standard row */}
      <View>
        <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
          <ArtSlot
            id={prayerArt(sleepPrayer.id)}
            radius={radius.card}
            scrim="soft"
            style={{ minHeight: tonightExpanded ? 150 : 96 }}
          >
            <LinearGradient
              colors={dawn
                ? ['rgba(10,12,24,0.06)', 'rgba(10,12,24,0.66)']
                : ['rgba(30,26,58,0.24)', 'rgba(10,12,24,0.82)']}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            <View
              style={{
                flex: 1,
                padding: tonightExpanded ? spacing.xl : spacing.lg,
                justifyContent: tonightExpanded ? 'space-between' : 'center',
                gap: tonightExpanded ? spacing.lg : spacing.sm,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    ...ty.overline,
                    color: t.onArtwork,
                  }}
                >
{localeUpperCase(tr('today.sleepPrayer'), locale)}
                </Text>
                <Text
                  style={{
                    ...ty.titleCompact,
                    color: t.onArtwork,
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
                onPress={() =>
                  sleepPrayer.plus && !isPlus
                    ? router.push('/paywall?from=sleep')
                    : router.push({ pathname: '/player', params: { id: sleepPrayer.id } })
                }
                accessibilityRole="button"
                accessibilityLabel={
                  sleepPrayer.plus && !isPlus
                    ? tr('a11y.unlockSleep')
                    : `${tr('a11y.play')} ${sleepPrayer.title}`
                }
                style={({ pressed }) => ({
                  position: tonightExpanded ? 'relative' : 'absolute',
                  right: tonightExpanded ? undefined : spacing.lg,
                  bottom: tonightExpanded ? undefined : spacing.lg,
                  alignSelf: tonightExpanded ? 'flex-start' : 'flex-end',
                  backgroundColor: tonightExpanded ? t.gold : 'rgba(14,18,32,0.48)',
                  borderRadius: radius.pill,
                  width: tonightExpanded ? undefined : 48,
                  paddingHorizontal: tonightExpanded ? spacing.lg : 0,
                  minHeight: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  opacity: pressed ? interaction.pressedOpacity : 1,
                })}
              >
                {tonightExpanded ? (
                  <Text style={[ty.label, { color: t.onGold }]}>
                    {sleepPrayer.plus && !isPlus ? tr('today.unlock') : tr('today.play')}
                  </Text>
                ) : (
                  <Ionicons name={sleepPrayer.plus && !isPlus ? 'lock-closed' : 'play'} size={18} color={t.onArtwork} />
                )}
              </Pressable>
            </View>
            {sleepPrayer.plus && !isPlus ? (
              <View
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
                <Text style={[ty.labelSmall, { color: t.gold }]}>PLUS</Text>
              </View>
            ) : null}
          </ArtSlot>
        </View>
      </View>
      </View>
      </View>
    </Screen>
  );
}
