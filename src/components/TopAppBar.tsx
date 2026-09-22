import React from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import { type as ty } from '@/theme/typography';
import { spacing } from '@/theme/tokens';

export function TopAppBar({ title, trailing, style }: { title: string; trailing?: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  const { t: tr, locale } = useT();
  return (
    <View style={[{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: spacing.md }, style]}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={tr('a11y.back')}
        style={({ pressed }) => ({
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed ? t.surfaceAlt : t.surface,
          borderWidth: 1,
          borderColor: t.border,
        })}
      >
        <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={24} color={t.inkSoft} />
      </Pressable>
      <Text accessibilityRole="header" numberOfLines={1} style={[ty.titleSmall, { flex: 1, color: t.ink }]}>
        {title}
      </Text>
      {trailing}
    </View>
  );
}
