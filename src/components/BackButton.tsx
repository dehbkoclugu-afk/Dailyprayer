import React from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import { goBack } from '@/lib/navigation';

/**
 * The bordered round back chip shared by every pushed screen: always a visible
 * 44pt target, mirrored for RTL, and safe when the screen was deep-linked.
 */
export function BackButton({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  const { t: tr, locale } = useT();
  return (
    <Pressable
      onPress={() => goBack()}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={tr('a11y.back')}
      style={({ pressed }) => [
        {
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: t.surface,
          borderWidth: 1,
          borderColor: t.border,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={24} color={t.inkSoft} />
    </Pressable>
  );
}
