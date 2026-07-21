import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useDailyContent } from '@/hooks/useDailyContent';
import { useStreakStore } from '@/state/useStreakStore';

export default function DevotionalScreen() {
  const t = useTheme();
  const { verse, devotional } = useDailyContent();
  const completeStep = useStreakStore((s) => s.completeStep);

  const finish = () => {
    completeStep('devotional');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  return (
    <Screen>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={{ width: 44, height: 44, justifyContent: 'center' }}
      >
        <Ionicons name="chevron-back" size={26} color={t.inkSoft} />
      </Pressable>

      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: t.gold, marginTop: spacing.lg }}>
        Today’s devotional
      </Text>
      <Text style={[ty.display, { color: t.ink, marginTop: spacing.sm }]}>{devotional.title}</Text>

      <View
        style={{
          backgroundColor: t.surfaceAlt,
          borderRadius: radius.inner,
          padding: spacing.lg,
          marginTop: spacing.xl,
        }}
      >
        <Text style={{ fontFamily: fonts.serifLight, fontSize: 18, lineHeight: 28, color: t.ink }}>
          “{verse.text}”
        </Text>
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.gold, marginTop: spacing.sm }}>
          {verse.reference}
        </Text>
      </View>

      <Text style={[ty.body, { color: t.ink, marginTop: spacing.xl }]}>{devotional.body}</Text>

      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor: t.gold,
          paddingLeft: spacing.lg,
          marginTop: spacing.xl,
        }}
      >
        <Text style={{ fontFamily: fonts.serifLight, fontSize: 17, lineHeight: 26, color: t.inkSoft, fontStyle: 'italic' }}>
          {devotional.prayer}
        </Text>
      </View>

      <PillButton label="Amen" onPress={finish} style={{ marginTop: spacing.xxl }} />
    </Screen>
  );
}
