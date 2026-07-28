import React from 'react';
import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { type } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  busy?: boolean;
  style?: ViewStyle;
}

export function PillButton({ label, onPress, variant = 'primary', disabled, busy = false, style }: Props) {
  const t = useTheme();
  const inactive = Boolean(disabled || busy);
  // Disabled reads as a flat, clearly-inactive neutral chip — dimming the gold
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
      {busy ? (
        <ActivityIndicator color={color} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
      ) : (
        <Text style={{ ...type.bodySemi, color, opacity: pressed ? 0.9 : 1 }}>
          {label}
        </Text>
      )}
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy }}
      disabled={inactive}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        {
          borderRadius: radius.pill,
          overflow: 'hidden',
          transform: [{ scale: pressed ? 0.97 : 1 }],
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
                shadowColor: t.gold,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
                elevation: 6,
              }
            : null),
        },
        style,
      ]}
    >
      {({ pressed }) =>
        variant === 'primary' && !inactive ? (
          <LinearGradient
            colors={['#E2B04A', '#C99534']}
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
