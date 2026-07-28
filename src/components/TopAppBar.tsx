import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { type } from '@/theme/typography';
import { spacing, TAP_MIN } from '@/theme/tokens';

export function TopAppBar({ title, right }: { title: string; right?: React.ReactNode }) {
  const t = useTheme();
  const { t: tr } = useT();
  return (
    <View style={{ minHeight: TAP_MIN, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel={tr('a11y.back')}
        style={({ pressed }) => ({
          width: TAP_MIN,
          height: TAP_MIN,
          borderRadius: TAP_MIN / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Ionicons name="chevron-back" size={24} color={t.inkSoft} />
      </Pressable>
      <Text accessibilityRole="header" numberOfLines={2} style={{ ...type.subtitle, color: t.ink, flex: 1 }}>
        {title}
      </Text>
      {right}
    </View>
  );
}
