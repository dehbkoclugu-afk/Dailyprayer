import React, { useEffect } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore } from '@/state/useToastStore';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, shadow, spacing } from '@/theme/tokens';

/** Minimal gold-trimmed toast. Mount once in the root layout. */
export function ToastHost() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const message = useToastStore((s) => s.message);
  const actionLabel = useToastStore((s) => s.actionLabel);
  const action = useToastStore((s) => s.action);
  const seq = useToastStore((s) => s.seq);
  const clear = useToastStore((s) => s.clear);

  useEffect(() => {
    if (!message) return;
    AccessibilityInfo.announceForAccessibility(message);
    // Toasts with an action (Undo) stay long enough to actually be tapped.
    const timer = setTimeout(clear, action ? 5000 : 2200);
    return () => clearTimeout(timer);
  }, [message, seq, clear, action]);

  if (!message) return null;

  return (
    <View
      // box-none: the full-width wrapper never blocks the screen beneath, but
      // the toast's own Undo button still receives touches.
      pointerEvents="box-none"
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
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        entering={FadeInDown.springify().damping(20)}
        exiting={FadeOutUp.duration(150)}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            backgroundColor: t.surface,
            borderColor: t.gold,
            borderWidth: 1,
            borderRadius: radius.pill,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            maxWidth: 320,
          },
          shadow.card,
        ]}
      >
        <Ionicons name="sparkles" size={15} color={t.gold} />
        <Text style={{ flexShrink: 1, fontFamily: fonts.sansMedium, fontSize: 14, color: t.ink }}>
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
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 14, color: t.gold }}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}
