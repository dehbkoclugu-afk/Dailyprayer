import React from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { type, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useDailyContent } from '@/hooks/useDailyContent';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';
import { TopAppBar } from '@/components/TopAppBar';

export default function DevotionalScreen() {
  const t = useTheme();
  const { t: tr, tu } = useT();
  const { verse, devotional } = useDailyContent();
  const completeStep = useStreakStore((s) => s.completeStep);
  const [amened, setAmened] = React.useState(false);

  const finish = () => {
    if (amened) return;
    setAmened(true);
    completeStep('devotional');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toast(translate('toast.devotional'));
  };

  return (
    <Screen>
      <TopAppBar title={tr('devotional.label')} />

      <Text style={{ ...type.labelSemi, letterSpacing: 2, color: t.goldText, marginTop: spacing.lg }}>
{tu(tr('devotional.label'))}
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
        <Text style={{ ...type.quoteSmall, lineHeight: 28, color: t.ink }}>
          “{verse.text}”
        </Text>
        <Text style={{ ...type.calloutMedium, color: t.goldText, marginTop: spacing.sm }}>
          {verse.reference}
        </Text>
      </View>

      {/* editorial drop cap on the opening letter */}
      <View style={{ flexDirection: 'row', marginTop: spacing.xl }}>
        <Text
          style={{ ...type.dropCap, lineHeight: 64,
                        // Ornament, not copy: at this size WCAG's 3:1 large-text
            // threshold applies and the luminous brand gold clears it.
            color: t.gold,
            marginRight: spacing.sm,
            marginTop: 2 }}
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
        <Text style={{ ...type.quoteSmall, lineHeight: 26, color: t.inkSoft, fontStyle: 'italic' }}>
          {devotional.prayer}
        </Text>
      </View>

      {amened ? (
        <View accessibilityRole="summary" style={{ backgroundColor: t.surface, borderRadius: radius.card, borderWidth: 1, borderColor: t.gold, padding: spacing.xl, marginTop: spacing.xxl, gap: spacing.md }}>
          <Ionicons name="checkmark-circle-outline" size={32} color={t.success} />
          <Text style={[ty.heading, { color: t.ink }]}>{tr('toast.devotional')}</Text>
          <PillButton label={tr('tab.journal')} onPress={() => router.push({ pathname: '/(tabs)/journal', params: { prompt: devotional.prayer } })} />
          <PillButton label={tr('a11y.back')} variant="secondary" onPress={() => router.back()} />
        </View>
      ) : (
        <PillButton label={tr('devotional.amen')} onPress={finish} style={{ marginTop: spacing.xxl }} />
      )}
    </Screen>
  );
}
