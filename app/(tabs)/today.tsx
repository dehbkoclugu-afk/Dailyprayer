import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { VerseCard } from '@/components/VerseCard';
import { RitualCard } from '@/components/RitualCard';
import { StreakFlame } from '@/components/StreakFlame';
import { ProgressRing } from '@/components/ProgressRing';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { spacing } from '@/theme/tokens';
import { useDailyContent } from '@/hooks/useDailyContent';
import { useStreakStore } from '@/state/useStreakStore';
import { useUserStore } from '@/state/useUserStore';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { greetingFor, dayKey } from '@/lib/dates';
import { prayers } from '@/data/prayers';

export default function Today() {
  const t = useTheme();
  const { verse, devotional } = useDailyContent();
  const name = useUserStore((s) => s.quiz.name);
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const { count, lastTickDay, doneDay, doneSteps, completeStep } = useStreakStore();
  const litToday = lastTickDay === dayKey();
  const doneCount = doneDay === dayKey() ? doneSteps.length : 0;

  const greeting = greetingFor(new Date().getHours());
  const greetText =
    greeting === 'morning' ? 'Good morning' : greeting === 'afternoon' ? 'Good afternoon' : 'Good evening';

  const isDone = (s: 'verse' | 'devotional' | 'prayer' | 'gratitude') =>
    doneDay === dayKey() && doneSteps.includes(s);

  const morningPrayer = prayers.find((p) => p.category === 'morning')!;
  const sleepPrayer = prayers.find((p) => p.category === 'sleep')!;

  return (
    <Screen tabbed>
      {/* Header: greeting + streak + ring */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: t.inkSoft }}>
            {greetText}{name ? `, ${name}` : ''}
          </Text>
          <Text style={[ty.title, { color: t.ink, marginTop: 2 }]}>Walk with Him today</Text>
        </View>
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <StreakFlame count={count} litToday={litToday} />
          <ProgressRing done={doneCount} total={4} size={48} />
        </View>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <VerseCard verse={verse} onRead={() => completeStep('verse')} />
      </View>

      <SectionHeader title="Your daily rhythm" />
      <View style={{ gap: spacing.md }}>
        <RitualCard
          icon="book-outline"
          title="Daily devotional"
          subtitle={`${devotional.title} · 2 min read`}
          done={isDone('devotional')}
          onPress={() => router.push('/devotional')}
        />
        <RitualCard
          icon="flame-outline"
          title="Guided prayer"
          subtitle={`${morningPrayer.title} · ${morningPrayer.minutes} min`}
          done={isDone('prayer')}
          onPress={() => router.push({ pathname: '/player', params: { id: morningPrayer.id } })}
        />
        <RitualCard
          icon="heart-outline"
          title="Gratitude"
          subtitle="Write one thing you’re thankful for"
          done={isDone('gratitude')}
          onPress={() => router.push('/(tabs)/journal')}
        />
      </View>

      <SectionHeader title="Tonight" />
      <RitualCard
        icon="moon-outline"
        title={sleepPrayer.title}
        subtitle={`Sleep prayer · ${sleepPrayer.minutes} min`}
        done={false}
        locked={sleepPrayer.plus && !isPlus}
        onPress={() =>
          sleepPrayer.plus && !isPlus
            ? router.push('/paywall')
            : router.push({ pathname: '/player', params: { id: sleepPrayer.id } })
        }
      />
    </Screen>
  );
}
