import React from 'react';
import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { type as ty } from '@/theme/typography';
import { elevation, radius, spacing } from '@/theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  busy?: boolean;
  style?: ViewStyle;
}

export function PillButton({ label, onPress, variant = 'primary', disabled = false, busy = false, style }: Props) {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const inactive = disabled || busy;
  // Disabled reads as a flat, clearly-inactive neutral chip , dimming the gold
  // gradient to 40% instead looks like a muddy/broken button, not "not yet".
  const color = inactive
    ? t.inkFaint
    : variant === 'primary'
      ? t.onGold
      : variant === 'secondary'
        ? t.ink
        : t.inkSoft;

  const inner = (pressed: boolean) => (
    <View
      style={{
        paddingVertical: 16,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 54,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }}>
        {busy ? <ActivityIndicator color={color} /> : null}
        <Text style={{ ...ty.bodyStrong, color, opacity: pressed ? 0.9 : 1 }}>
          {label}
        </Text>
      </View>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy }}
      disabled={inactive}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        {
          borderRadius: radius.pill,
          overflow: 'hidden',
          transform: [{ scale: pressed && !reduceMotion ? 0.97 : 1 }],
          backgroundColor: inactive
            ? t.surfaceAlt
            : variant === 'secondary'
              ? t.surfaceAlt
              : variant === 'ghost'
                ? 'transparent'
                : undefined,
          // candlelight glow under the primary action
          ...(variant === 'primary' && !inactive
            ? {
                ...elevation.hero,
                shadowColor: t.sacredGold,
              }
            : null),
        },
        style,
      ]}
    >
      {({ pressed }) =>
        variant === 'primary' && !inactive ? (
          <LinearGradient
            colors={[t.sacredGold, t.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.35)' }}
          >
            {inner(pressed)}
          </LinearGradient>
        ) : (
          inner(pressed)
        )
      }
    </Pressable>
  );
}
