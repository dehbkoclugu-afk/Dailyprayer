import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { type as ty, fonts } from '@/theme/typography';
import { spacing } from '@/theme/tokens';

const LINES = [
  'Reading your answers…',
  'Choosing scriptures for your season…',
  'Shaping your daily rhythm…',
  'Your plan is ready.',
];

/** "Building your plan" interstitial — investment beat before the reveal. */
export default function Building() {
  const t = useTheme();
  const [line, setLine] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLine((l) => {
        if (l >= LINES.length - 1) {
          clearInterval(timer);
          setTimeout(() => router.replace('/onboarding/reveal'), 700);
          return l;
        }
        return l + 1;
      });
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  return (
    <Screen scroll={false} style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Ionicons name="sparkles" size={40} color={t.gold} style={{ marginBottom: spacing.xl }} />
      <Animated.Text
        key={line}
        entering={FadeIn.duration(400)}
        style={[ty.heading, { color: t.ink, textAlign: 'center' }]}
      >
        {LINES[line]}
      </Animated.Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.xxl }}>
        {LINES.map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i <= line ? t.gold : t.border,
            }}
          />
        ))}
      </View>
      <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkFaint, marginTop: spacing.xl }}>
        Personalizing from your answers
      </Text>
    </Screen>
  );
}
