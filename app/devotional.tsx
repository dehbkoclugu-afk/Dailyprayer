import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
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

  const finish = () => {
    if (amened) return;
    setAmened(true);
    completeStep('devotional');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toast(translate('toast.devotional'));
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

      {amened ? (
        <View
          accessibilityRole="summary"
          style={{
            backgroundColor: t.surface,
            borderRadius: radius.card,
            borderWidth: 1,
            borderColor: t.gold,
            padding: spacing.xl,
            marginTop: spacing.xxl,
            alignItems: 'center',
          }}
        >
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: t.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="checkmark" size={28} color={t.gold} />
          </View>
          <Text style={{ ...ty.titleCompact, color: t.ink, textAlign: 'center', marginTop: spacing.md }}>
            {tr('toast.devotional')}
          </Text>
          <Text style={{ ...ty.secondary, color: t.inkSoft, textAlign: 'center', marginTop: spacing.sm }}>
            {tr('journal.promptGratitude')}
          </Text>
          <PillButton
            label={tr('journal.title')}
            onPress={() => router.push({ pathname: '/(tabs)/journal', params: { prompt: 'devotional' } })}
            style={{ width: '100%', marginTop: spacing.lg }}
          />
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={tr('a11y.back')}
            style={({ pressed }) => ({ minHeight: 48, paddingHorizontal: spacing.lg, justifyContent: 'center', marginTop: spacing.sm, opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={{ ...ty.label, color: t.blue }}>{tr('a11y.back')}</Text>
          </Pressable>
        </View>
      ) : (
        <PillButton label={tr('devotional.amen')} onPress={finish} style={{ marginTop: spacing.xxl }} />
      )}
    </Screen>
  );
}
