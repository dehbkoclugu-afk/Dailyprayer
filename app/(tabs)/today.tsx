import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
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

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function Today() {
  const t = useTheme();
  const { verse, devotional } = useDailyContent();
  const name = useUserStore((s) => s.quiz.name);
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const { count, lastTickDay, doneDay, doneSteps } = useStreakStore();
  const litToday = lastTickDay === dayKey();
  const doneCount = doneDay === dayKey() ? doneSteps.length : 0;

  const now = new Date();
  const dateLine = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  const greeting = greetingFor(now.getHours());
  const greetText =
    greeting === 'morning' ? 'Good morning' : greeting === 'afternoon' ? 'Good afternoon' : 'Good evening';

  const isDone = (s: 'verse' | 'devotional' | 'prayer' | 'gratitude') =>
    doneDay === dayKey() && doneSteps.includes(s);

  const morningPrayer = prayers.find((p) => p.category === 'morning')!;
  const sleepPrayer = prayers.find((p) => p.category === 'sleep')!;
  const completeStep = useStreakStore((s) => s.completeStep);

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
            <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft }}> day streak</Text>
          </View>
        </View>
        <ProgressRing done={doneCount} total={4} size={56} />
      </View>

      <Animated.View entering={FadeInDown.springify().damping(20)} style={{ marginTop: spacing.xl }}>
        <VerseCard
          verse={verse}
          onRead={() => {
            if (!isDone('verse')) {
              completeStep('verse');
              toast('Verse kept in your heart — 1 of 4');
            }
          }}
        />
      </Animated.View>

      <SectionHeader title="Your daily rhythm" />
      <View style={{ gap: spacing.md }}>
        {[
          <RitualCard
            key="devotional"
            icon="book-outline"
            title="Daily devotional"
            subtitle={`${devotional.title} · 2 min read`}
            done={isDone('devotional')}
            onPress={() => router.push('/devotional')}
          />,
          <RitualCard
            key="prayer"
            icon="flame-outline"
            title="Guided prayer"
            subtitle={`${morningPrayer.title} · ${morningPrayer.minutes} min`}
            done={isDone('prayer')}
            onPress={() => router.push({ pathname: '/player', params: { id: morningPrayer.id } })}
          />,
          <RitualCard
            key="gratitude"
            icon="heart-outline"
            title="Gratitude"
            subtitle="Write one thing you’re thankful for"
            done={isDone('gratitude')}
            onPress={() => router.push('/(tabs)/journal')}
          />,
        ].map((card, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(120 + i * 60).springify().damping(20)}>
            {card}
          </Animated.View>
        ))}
      </View>

      <SectionHeader title="Tonight" />
      {/* Night shifts the palette: indigo art card, not a standard row */}
      <Animated.View entering={FadeInDown.delay(300).springify().damping(20)}>
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
                  Sleep prayer
                </Text>
                <Text style={{ fontFamily: fonts.serif, fontSize: 21, color: '#F2EEE6', marginTop: 4 }}>
                  {sleepPrayer.title} · {sleepPrayer.minutes} min
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
                  sleepPrayer.plus && !isPlus ? 'Unlock sleep prayers' : `Play ${sleepPrayer.title}`
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
                {sleepPrayer.plus && !isPlus ? 'Unlock' : 'Play'}
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
      </Animated.View>
    </Screen>
  );
}
