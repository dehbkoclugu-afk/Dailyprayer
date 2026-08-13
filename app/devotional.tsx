import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useDailyContent } from '@/hooks/useDailyContent';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';
import { localeUpperCase } from '@/i18n/localeText';
import { TopAppBar } from '@/components/TopAppBar';

export default function DevotionalScreen() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const { verse, devotional } = useDailyContent();
  const completeStep = useStreakStore((s) => s.completeStep);
  const [amened, setAmened] = React.useState(false);

  // Amen morphs to a checkmark for a beat before returning (design-100 #64).
  const finish = () => {
    if (amened) return;
    setAmened(true);
    completeStep('devotional');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toast(translate('toast.devotional'));
    setTimeout(() => router.back(), 600);
  };

  return (
    <Screen>
      <TopAppBar title={tr('today.devotional')} />

      <Text style={[ty.overline, { color: t.gold, marginTop: spacing.lg }]}>
{localeUpperCase(tr('devotional.label'), locale)}
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
        <Text style={{ ...ty.editorialBody, color: t.ink }}>
          “{verse.text}”
        </Text>
        <Text style={{ ...ty.labelMedium, color: t.gold, marginTop: spacing.sm }}>
          {verse.reference}
        </Text>
      </View>

      {/* editorial drop cap on the opening letter */}
      <View style={{ flexDirection: 'row', marginTop: spacing.xl }}>
        <Text
          style={{
            ...ty.displayHero,
            color: t.gold,
            marginRight: spacing.sm,
            marginTop: 2,
          }}
        >
          {devotional.body.charAt(0)}
        </Text>
        <Text style={[ty.body, { color: t.ink, flex: 1 }]}>{devotional.body.slice(1)}</Text>
      </View>

      <View
        style={{
          borderLeftWidth: 3,
          borderLeftColor: t.gold,
          paddingLeft: spacing.lg,
          marginTop: spacing.xl,
        }}
      >
        <Text style={{ ...ty.editorialCompact, color: t.inkSoft, fontStyle: 'italic' }}>
          {devotional.prayer}
        </Text>
      </View>

      <PillButton label={amened ? '✓' : tr('devotional.amen')} onPress={finish} style={{ marginTop: spacing.xxl }} />
    </Screen>
  );
}
