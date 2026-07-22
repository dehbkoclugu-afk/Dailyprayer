import React, { useState } from 'react';
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
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useDailyContent } from '@/hooks/useDailyContent';
import { verses, type DailyVerse } from '@/data/verses';
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { greetingFor, dayKey } from '@/lib/dates';
import { usePrayers } from '@/data/prayers';
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
  const { t: tr, locale } = useT();
  const { verse, devotional } = useDailyContent();
  // The verse of the day is fixed by date, but let people browse the pool — a
  // shuffle swaps in another verse without touching the day's read-streak.
  const [otherVerse, setOtherVerse] = useState<DailyVerse | null>(null);
  const shownVerse = otherVerse ?? verse;
  const shuffleVerse = () => {
    if (verses.length < 2) return;
    let next = shownVerse;
    while (next.reference === shownVerse.reference) {
      next = verses[Math.floor(Math.random() * verses.length)];
    }
    setOtherVerse(next);
  };
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

  return (
    <Screen tabbed>
      {/* candle-glow wash behind the header — a soft top-down fade, not a hard
          disc. The old 340px circle read as an unintentional dark dome; a
          vertical gradient bleeds warmth in without a visible shape edge. */}
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(217,164,65,0.10)', 'rgba(217,164,65,0.0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: -60, left: -40, right: -40, height: 300 }}
      />

      {/* Header — greeting on the left, a square streak badge on the right */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
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
          <Text style={[ty.title, { color: t.ink, marginTop: spacing.xs }]}>
            {greetText}{name ? `, ${name}` : ''}
          </Text>
        </View>
        <View
          accessibilityLabel={`${count} ${tr('today.dayStreak')}`}
          style={{
            width: 64,
            height: 64,
            borderRadius: radius.inner,
            backgroundColor: t.surface,
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

      <SectionHeader title={tr('today.rhythm')} />
      <View style={{ gap: spacing.md }}>
        {[
          <RitualCard
            key="devotional"
            icon="book-outline"
            art="A18-ritual-reading"
            title={tr('today.devotional')}
            subtitle={`${devotional.title} · 2 ${tr('today.minRead')}`}
            done={isDone('devotional')}
            onPress={() => router.push('/devotional')}
          />,
          <RitualCard
            key="prayer"
            icon="flame-outline"
            art="A19-ritual-prayer"
            title={tr('today.guidedPrayer')}
            subtitle={`${morningPrayer.title} · ${morningPrayer.minutes} ${tr('pray.min')}`}
            done={isDone('prayer')}
            onPress={() => router.push({ pathname: '/player', params: { id: morningPrayer.id } })}
          />,
          <RitualCard
            key="gratitude"
            icon="heart-outline"
            art="A20-ritual-gratitude"
            title={tr('today.gratitude')}
            subtitle={tr('today.gratitudeSub')}
            done={isDone('gratitude')}
            onPress={() => router.push('/(tabs)/journal')}
          />,
        ].map((card, i) => (
          <View key={i}>{card}</View>
        ))}
      </View>

      <SectionHeader
        title={tr('today.tonight')}
        style={{ paddingLeft: spacing.sm }}
        right={<ProgressRing done={doneCount} total={4} size={52} />}
      />
      {/* Night shifts the palette: indigo art card, not a standard row */}
      <View>
        <View style={{ borderRadius: radius.card, overflow: 'hidden' }}>
          <ArtSlot id="A10-tonight-night" height={150} radius={radius.card}>
            <LinearGradient
              colors={['rgba(30,26,58,0.35)', 'rgba(10,12,24,0.92)']}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            />
            <View
              style={{
                flex: 1,
                padding: spacing.xl,
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemiBold,
                    fontSize: 11,
                    letterSpacing: 2.5,
                    textTransform: 'uppercase',
                    color: 'rgba(217,164,65,0.85)',
                  }}
                >
{tr('today.sleepPrayer')}
                </Text>
                <Text style={{ fontFamily: fonts.serif, fontSize: 21, color: '#F2EEE6', marginTop: 4 }}>
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
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 14,
                  color: '#1A1206',
                  backgroundColor: '#D9A441',
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
                  backgroundColor: 'rgba(14,18,32,0.7)',
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                }}
              >
                <Ionicons name="lock-closed" size={11} color="#D9A441" />
                <Text style={{ fontFamily: fonts.sansBold, fontSize: 10, color: '#D9A441' }}>PLUS</Text>
              </View>
            ) : null}
          </ArtSlot>
        </View>
      </View>
    </Screen>
  );
}
