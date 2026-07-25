import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, useReducedMotion } from 'react-native-reanimated';
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
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { greetingFor, dayKey } from '@/lib/dates';
import { prayers } from '@/data/prayers';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';

export default function Today() {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const { t: tr, locale } = useT();
  const { verse, devotional } = useDailyContent();
  const name = useUserStore((s) => s.quiz.name);
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const { count, lastTickDay, doneDay, doneSteps } = useStreakStore();
  const litToday = lastTickDay === dayKey();
  const doneCount = doneDay === dayKey() ? doneSteps.length : 0;

  const now = new Date();
  const dateLine = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now);
  const greeting = greetingFor(now.getHours());
  const greetText =
    greeting === 'morning' ? tr('today.morning') : greeting === 'afternoon' ? tr('today.afternoon') : tr('today.evening');

  const isDone = (s: 'verse' | 'devotional' | 'prayer' | 'gratitude') =>
    doneDay === dayKey() && doneSteps.includes(s);

  const morningPrayer = prayers.find((p) => p.category === 'morning')!;
  const sleepPrayer = prayers.find((p) => p.category === 'sleep')!;
  const completeStep = useStreakStore((s) => s.completeStep);
  const uncompleteStep = useStreakStore((s) => s.uncompleteStep);
  const rituals = [
    {
      step: 'devotional' as const,
      icon: 'book-outline' as const,
      title: tr('today.devotional'),
      subtitle: `${devotional.title} · 2 ${tr('today.minRead')}`,
      onPress: () => router.push('/devotional'),
    },
    {
      step: 'prayer' as const,
      icon: 'flame-outline' as const,
      title: tr('today.guidedPrayer'),
      subtitle: `${morningPrayer.title} · ${morningPrayer.minutes} ${tr('pray.min')}`,
      onPress: () => router.push({ pathname: '/player', params: { id: morningPrayer.id } }),
    },
    {
      step: 'gratitude' as const,
      icon: 'heart-outline' as const,
      title: tr('today.gratitude'),
      subtitle: tr('today.gratitudeSub'),
      onPress: () => router.push('/(tabs)/journal'),
    },
  ];
  const nextRitual = rituals.find((ritual) => !isDone(ritual.step));
  const allDone = doneCount >= 4;

  return (
    <Screen tabbed>
      {/* candle-glow halo behind the header */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -120,
          alignSelf: 'center',
          width: 340,
          height: 340,
          borderRadius: 170,
          backgroundColor: t.gold,
          opacity: 0.07,
        }}
      />

      {/* Header */}
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
          {/* streak chip */}
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-start',
              alignItems: 'center',
              backgroundColor: t.surface,
              borderColor: litToday ? t.gold : t.border,
              borderWidth: 1,
              borderRadius: radius.pill,
              paddingHorizontal: spacing.md,
              paddingVertical: 6,
              marginTop: spacing.md,
              gap: 4,
            }}
          >
            <StreakFlame count={count} litToday={litToday} />
            <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft }}> {tr('today.dayStreak')}</Text>
          </View>
        </View>
        <ProgressRing done={doneCount} total={4} size={56} />
      </View>

      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.springify().damping(20)}
        style={{ marginTop: spacing.xl }}
      >
        <VerseCard
          verse={verse}
          onRead={() => {
            if (!isDone('verse')) {
              completeStep('verse');
              toast(translate('toast.verse'));
            }
          }}
        />
      </Animated.View>

      <SectionHeader title={allDone ? tr('today.rhythmComplete') : tr('today.nextStep')} />
      {allDone ? (
        <View
          style={{
            backgroundColor: t.surface,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: t.gold,
            padding: spacing.xl,
            alignItems: 'center',
          }}
        >
          <Ionicons name="sunny-outline" size={32} color={t.gold} />
          <Text style={[ty.title, { color: t.ink, textAlign: 'center', marginTop: spacing.md }]}>
            {tr('today.completionTitle')}
          </Text>
          <Text style={[ty.secondary, { color: t.inkSoft, textAlign: 'center', marginTop: spacing.sm }]}>
            {tr('today.completionBody')}
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/journal')}
            accessibilityRole="button"
            style={{ minHeight: 48, justifyContent: 'center', marginTop: spacing.md }}
          >
            <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 15, color: t.blue }}>
              {tr('today.reflect')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const lastStep = doneSteps[doneSteps.length - 1];
              if (lastStep) uncompleteStep(lastStep);
            }}
            accessibilityRole="button"
            accessibilityLabel={tr('today.undoLastCompletion')}
            style={{ minHeight: 48, justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.inkSoft }}>
              {tr('today.undoLastCompletion')}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {rituals
            .filter((ritual) => !isDone(ritual.step))
            .map((ritual, i) => (
              <Animated.View
                key={ritual.step}
                entering={
                  reduceMotion
                    ? undefined
                    : FadeInDown.delay(120 + i * 60).springify().damping(20)
                }
              >
                <RitualCard
                  icon={ritual.icon}
                  title={ritual.title}
                  subtitle={ritual.subtitle}
                  done={false}
                  primary={ritual.step === nextRitual?.step}
                  onPress={ritual.onPress}
                />
              </Animated.View>
            ))}
          {rituals.some((ritual) => isDone(ritual.step)) ? (
            <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
              <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: t.inkSoft }}>
                {tr('today.completed')}
              </Text>
              {rituals
                .filter((ritual) => isDone(ritual.step))
                .map((ritual) => (
                  <RitualCard
                    key={ritual.step}
                    icon={ritual.icon}
                    title={ritual.title}
                    subtitle={ritual.subtitle}
                    done
                    onPress={() => uncompleteStep(ritual.step)}
                  />
                ))}
            </View>
          ) : null}
        </View>
      )}

      <SectionHeader title={tr('today.tonight')} />
      {/* Night shifts the palette: indigo art card, not a standard row */}
      <Animated.View
        entering={reduceMotion ? undefined : FadeInDown.delay(300).springify().damping(20)}
      >
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
                  {sleepPrayer.title} · {sleepPrayer.minutes} min
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
                  sleepPrayer.plus && !isPlus ? tr('today.unlockSleep') : tr('today.playPrayer')
                }
                style={{
                  backgroundColor: '#D9A441',
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.lg,
                  minHeight: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, color: '#1A1206' }}>
                  {sleepPrayer.plus && !isPlus ? tr('today.unlock') : tr('today.play')}
                </Text>
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
      </Animated.View>
    </Screen>
  );
}
