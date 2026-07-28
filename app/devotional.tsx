import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { type, type as ty } from '@/theme/typography';
import { radius, spacing, TAP_MIN } from '@/theme/tokens';
import { useDailyContent } from '@/hooks/useDailyContent';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { useT, translate } from '@/i18n';

export default function DevotionalScreen() {
  const t = useTheme();
  const { t: tr } = useT();
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
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={tr('a11y.back')}
        // Bordered chip so there's always a visible tap target to leave the
        // reader — a bare icon becomes an invisible dead corner if the glyph
        // ever fails to render.
        style={{
          width: TAP_MIN,
          height: TAP_MIN,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
        }}
      >
        <Ionicons name="chevron-back" size={24} color={t.inkSoft} />
      </Pressable>

      <Text style={{ ...type.labelSemi, letterSpacing: 2, textTransform: 'uppercase', color: t.gold, marginTop: spacing.lg }}>
{tr('devotional.label')}
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
        <Text style={{ ...type.calloutMedium, color: t.gold, marginTop: spacing.sm }}>
          {verse.reference}
        </Text>
      </View>

      {/* editorial drop cap on the opening letter */}
      <View style={{ flexDirection: 'row', marginTop: spacing.xl }}>
        <Text
          style={{ ...type.dropCap, lineHeight: 64,
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

      <PillButton label={amened ? '✓' : tr('devotional.amen')} onPress={finish} style={{ marginTop: spacing.xxl }} />
    </Screen>
  );
}
