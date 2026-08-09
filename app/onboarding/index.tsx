import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { Wordmark } from '@/components/Wordmark';
import { OnboardingBackdrop } from '@/components/OnboardingBackdrop';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';

export default function Welcome() {
  const t = useTheme();
  const { t: tr } = useT();
  return (
    <Screen scroll={false} style={{ justifyContent: 'space-between' }}>
      <OnboardingBackdrop />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <ArtSlot id="A1-logomark" height={44} fit="contain" radius={12} style={{ width: 44 }} />
        <Wordmark size={24} />
      </View>

      <View>
        <ArtSlot
          id="A4-welcome-hero"
          height={300}
          radius={radius.hero}
          style={{ marginBottom: spacing.xxl, borderWidth: 1, borderColor: 'rgba(184,134,11,0.18)' }}
        />
        <Text style={[ty.display, { color: t.ink }]}>{tr('welcome.headline')}</Text>
        <Text style={[ty.body, { color: t.inkSoft, marginTop: spacing.lg }]}>
{tr('welcome.sub')}
        </Text>
      </View>

      <View style={{ gap: spacing.lg }}>
        <PillButton label={tr('welcome.begin')} onPress={() => router.push('/onboarding/quiz')} />
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
            {tr('welcome.trust')}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
