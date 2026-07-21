import React from 'react';
import { Pressable, Text, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function PillButton({ label, onPress, variant = 'primary', disabled, style }: Props) {
  const t = useTheme();
  const bg =
    variant === 'primary' ? t.gold : variant === 'secondary' ? t.surfaceAlt : 'transparent';
  const color = variant === 'primary' ? t.onGold : variant === 'secondary' ? t.ink : t.inkSoft;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingVertical: 16,
          paddingHorizontal: spacing.xl,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 52,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 17, color }}>{label}</Text>
    </Pressable>
  );
}
