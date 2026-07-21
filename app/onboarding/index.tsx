import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Welcome() {
  const t = useTheme();
  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
      <View />
      <View>
        <LinearGradient
          colors={[t.duskFrom, t.duskTo]}
          style={{
            width: 88,
            height: 88,
            borderRadius: radius.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.xxl,
          }}
        >
          <Text style={{ fontSize: 40 }}>🕊</Text>
        </LinearGradient>
        <Text style={[ty.display, { color: t.ink }]}>
          Peace begins{'\n'}with a moment.
        </Text>
        <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.lg }]}>
          Lumen builds a daily rhythm of scripture and prayer around your life —
          two quiet minutes at a time.
        </Text>
      </View>
      <View style={{ gap: spacing.md }}>
        <PillButton label="Begin" onPress={() => router.push('/onboarding/quiz')} />
        <Text
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            color: t.inkFaint,
            textAlign: 'center',
          }}
        >
          Takes about a minute · No account needed
        </Text>
      </View>
    </Screen>
  );
}
