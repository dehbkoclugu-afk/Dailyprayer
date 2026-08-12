import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

export function InvalidRouteState({ destination = '/(tabs)/bible' }: { destination?: '/(tabs)/bible' | '/(tabs)/today' }) {
  const t = useTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const leave = () => (router.canGoBack() ? router.back() : router.replace(destination));

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl, paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
        <Ionicons name="compass-outline" size={30} color={t.gold} />
      </View>
      <Text accessibilityRole="header" style={{ fontFamily: fonts.serif, fontSize: 28, color: t.ink, textAlign: 'center', marginTop: spacing.lg }}>
        {tr('bible.title')}
      </Text>
      <Text accessibilityRole="alert" style={{ fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: t.inkSoft, textAlign: 'center', marginTop: spacing.sm }}>
        {tr('read.searchEmpty')}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel={tr('a11y.back')} onPress={leave} style={({ pressed }) => ({ minWidth: 180, minHeight: 48, marginTop: spacing.xl, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: t.gold, opacity: pressed ? 0.75 : 1 })}>
        <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.onGold }}>{tr('a11y.back')}</Text>
      </Pressable>
    </View>
  );
}
