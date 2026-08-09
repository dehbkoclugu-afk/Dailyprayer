import React from 'react';
import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  /**
   * In progress right now (a purchase in flight, a save pending) — distinct
   * from `disabled`, which is "not ready yet" with no work happening
   * (roadmap item 39). Every caller used to fold both into the same
   * `disabled` boolean, so `accessibilityState.busy` was true whenever a form
   * was merely incomplete — TalkBack said "busy" while nothing was loading.
   * Shows a spinner alongside the label and forces the button non-interactive,
   * on top of whatever `disabled` already says.
   */
  busy?: boolean;
  style?: ViewStyle;
}

export function PillButton({ label, onPress, variant = 'primary', disabled, busy, style }: Props) {
  const t = useTheme();
  const inactive = Boolean(disabled) || Boolean(busy);
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
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        minHeight: 54,
      }}
    >
      {busy ? <ActivityIndicator color={color} /> : null}
      <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 17, color, opacity: pressed ? 0.9 : 1 }}>
        {label}
      </Text>
    </View>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: Boolean(busy) }}
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
