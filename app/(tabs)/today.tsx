import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
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
import { radius, spacing } from '@/theme/tokens';
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

const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const DAYS_TR = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];

/** Locale-aware date line: "Wednesday, July 22" (en) · "22 Temmuz Çarşamba" (tr) */
function formatDateLine(now: Date, locale: string): string {
  if (locale === 'tr') {
    return `${now.getDate()} ${MONTHS_TR[now.getMonth()]} ${DAYS_TR[now.getDay()]}`;
  }
  return `${DAYS_EN[now.getDay()]}, ${MONTHS_EN[now.getMonth()]} ${now.getDate()}`;
}

export default function Today() {
  const t = useTheme();
  const artwork = useArtwork();
  const dawn = artwork.scheme === 'dawn';
  const { t: tr, locale } = useT();
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
          <Text style={[ty.display, { color: t.ink, fontSize: 34, lineHeight: 40, marginTop: spacing.xs }]}>
            {greetText}{name ? `, ${name}` : ''}
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
          onPress={() => isDone('devotional') ? uncompleteStep('devotional') : router.push('/devotional')}
        />
        <RitualCard
          icon="flame-outline"
          art={prayerArt(morningPrayer.id)}
          title={tr('today.guidedPrayer')}
          subtitle={`${morningPrayer.title} · ${morningPrayer.minutes} ${tr('pray.min')}`}
          done={isDone('prayer')}
          onPress={() => isDone('prayer') ? uncompleteStep('prayer') : router.push({ pathname: '/player', params: { id: morningPrayer.id } })}
        />
        <RitualCard
          icon="heart-outline"
          art="A20-ritual-gratitude"
          title={tr('today.gratitude')}
          subtitle={tr('today.gratitudeSub')}
          done={isDone('gratitude')}
          onPress={() => isDone('gratitude') ? uncompleteStep('gratitude') : router.push('/(tabs)/journal')}
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
                <Text
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
                <Text
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: 21,
                    color: '#F2EEE6',
                    marginTop: 4,
                    textShadowColor: 'rgba(0,0,0,0.72)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 7,
                  }}
                >
                  {sleepPrayer.title} · {sleepPrayer.minutes} {tr('pray.min')}
                </Text>
              </View>
              <Text
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
                style={{
                  position: 'absolute',
                  right: dawn ? 24 : spacing.xl,
                  bottom: spacing.xl,
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 14,
                  color: t.onGold,
                  backgroundColor: t.gold,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: 10,
                  overflow: 'hidden',
                }}
              >
                {sleepPrayer.plus && !isPlus ? tr('today.unlock') : tr('today.play')}
              </Text>
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
                <Text style={{ fontFamily: fonts.sansBold, fontSize: 10, color: t.gold }}>PLUS</Text>
              </View>
            ) : null}
          </ArtSlot>
        </View>
      </View>
    </Screen>
  );
}
