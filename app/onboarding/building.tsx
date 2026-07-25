import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { ArtSlot } from '@/components/ArtSlot';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { type as ty, fonts } from '@/theme/typography';
import { spacing } from '@/theme/tokens';
import { useUserStore } from '@/state/useUserStore';
import { useT } from '@/i18n';

/** "Building your plan" interstitial — a checklist completing line by line. */
export default function Building() {
  const t = useTheme();
  const quiz = useUserStore((state) => state.quiz);
  const { t: tr } = useT();
  const rows = [
    { icon: 'heart-outline' as const, text: tr('building.preference') },
    { icon: 'sparkles-outline' as const, text: `${quiz.goals.length} ${tr('building.goals')}` },
    {
      icon: 'notifications-outline' as const,
      text:
        quiz.prayerTime && quiz.prayerTime !== 'none'
          ? `${tr('building.reminder')} · ${quiz.prayerTime}`
          : tr('building.noReminder'),
    },
  ];

  return (
    <Screen scroll={false} style={{ justifyContent: 'center' }}>
      <ArtSlot
        id="A15-building-candle"
        height={140}
        fit="contain"
        style={{ marginBottom: spacing.xxl, alignSelf: 'center', width: 140 }}
      />
      <Text style={[ty.title, { color: t.ink, textAlign: 'center', marginBottom: spacing.xxl }]}>
        {tr('building.title')}
      </Text>
      <Text style={[ty.secondary, { color: t.inkSoft, textAlign: 'center', marginBottom: spacing.xl }]}>
        {tr('building.body')}
      </Text>
      <View style={{ gap: spacing.lg, alignSelf: 'center' }}>
        {rows.map((row) => (
            <View
              key={row.text}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
            >
              <Ionicons
                name={row.icon}
                size={20}
                color={t.gold}
              />
              <Text
                style={{
                  fontFamily: fonts.sansMedium,
                  fontSize: 16,
                  color: t.ink,
                }}
              >
                {row.text}
              </Text>
            </View>
        ))}
      </View>
      <PillButton
        label={tr('building.continue')}
        onPress={() => router.replace('/onboarding/reveal')}
        style={{ marginTop: spacing.xxl }}
      />
    </Screen>
  );
}
