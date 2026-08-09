import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { ArtSlot } from '@/components/ArtSlot';
import { OnboardingBackdrop } from '@/components/OnboardingBackdrop';
import { useTheme } from '@/hooks/useTheme';
import { type as ty, fonts } from '@/theme/typography';
import { spacing } from '@/theme/tokens';
import { useT } from '@/i18n';

/** "Building your plan" interstitial , a checklist completing line by line. */
export default function Building() {
  const t = useTheme();
  const { t: tr } = useT();
  const STEPS = [
    tr('building.step1'),
    tr('building.step2'),
    tr('building.step3'),
    tr('building.step4'),
  ];
  const [done, setDone] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDone((d) => {
        if (d >= 4) {
          clearInterval(timer);
          setTimeout(() => router.replace('/onboarding/reveal'), 600);
          return d;
        }
        return d + 1;
      });
    }, 950);
    return () => clearInterval(timer);
  }, []);

  return (
    <Screen scroll={false} style={{ justifyContent: 'center' }}>
      <OnboardingBackdrop />
      <ArtSlot
        id="A15-building-candle"
        height={140}
        fit="contain"
        style={{ marginBottom: spacing.xxl, alignSelf: 'center', width: 140 }}
      />
      <Text style={[ty.title, { color: t.ink, textAlign: 'center', marginBottom: spacing.xxl }]}>
        {tr('building.title')}
      </Text>
      <View style={{ gap: spacing.lg, alignSelf: 'center' }}>
        {STEPS.map((s, i) => {
          const complete = i < done;
          return (
            <View
              key={s}
              style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
            >
              <Ionicons
                name={complete ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={complete ? t.gold : t.inkFaint}
              />
              <Text
                style={{
                  fontFamily: complete ? fonts.sansMedium : fonts.sans,
                  fontSize: 16,
                  color: complete ? t.ink : t.inkSoft,
                }}
              >
                {s}
              </Text>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
