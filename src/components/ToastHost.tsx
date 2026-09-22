import React, { useEffect } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useToastStore } from '@/state/useToastStore';
import { useTheme } from '@/hooks/useTheme';
import { type as ty } from '@/theme/typography';
import { elevation, interaction, radius, spacing } from '@/theme/tokens';

/** Minimal gold-trimmed toast. Mount once in the root layout. */
export function ToastHost() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const { message, actionLabel, action, seq, clear } = useToastStore();

  useEffect(() => {
    if (!message) return;
    AccessibilityInfo.announceForAccessibility(message);
    const timer = setTimeout(clear, 2200);
    return () => clearTimeout(timer);
  }, [message, seq, clear]);

  if (!message) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: insets.top + spacing.md,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
      }}
    >
      <Animated.View
        key={seq}
        entering={reduceMotion ? undefined : FadeInDown.springify().damping(20)}
        exiting={reduceMotion ? undefined : FadeOutUp.duration(150)}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: t.surface,
            borderColor: t.sacredGold,
            borderWidth: 1,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            maxWidth: 320,
          },
          elevation.floating,
        ]}
      >
        <Ionicons name="sparkles" size={15} color={t.sacredGold} />
        <Text style={{ flexShrink: 1, ...ty.labelMedium, color: t.ink }}>
          {message}
        </Text>
        {actionLabel && action ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            onPress={() => {
              action();
              clear();
            }}
            style={({ pressed }) => ({
              minWidth: 48,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? interaction.pressedOpacity : 1,
            })}
          >
            <Text style={{ ...ty.label, color: t.sacredGold }}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}
