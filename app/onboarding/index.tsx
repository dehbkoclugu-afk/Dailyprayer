import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export default function Welcome() {
  const t = useTheme();
  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <ArtSlot id="A1-logomark" height={44} fit="contain" radius={12} style={{ width: 44 }} />
        <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: t.ink }}>Lumen</Text>
      </View>

      <View>
        <ArtSlot
          id="A4-welcome-hero"
          height={280}
          radius={radius.hero}
          style={{ marginBottom: spacing.xxl }}
        />
        <Text style={[ty.display, { color: t.ink }]}>
          Peace begins{'\n'}with a moment.
        </Text>
        <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.lg }]}>
          A daily rhythm of scripture and prayer, shaped around your life —
          two quiet minutes at a time.
        </Text>
      </View>

      <View style={{ gap: spacing.lg }}>
        <PillButton label="Begin" onPress={() => router.push('/onboarding/quiz')} />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Ionicons name="lock-closed-outline" size={13} color={t.inkFaint} />
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkFaint }}>
            Takes about a minute · No account needed
          </Text>
        </View>
      </View>
    </Screen>
  );
}
