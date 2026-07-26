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
  const { message, actionLabel, action, seq, clear } = useToastStore();

  const hasAction = Boolean(actionLabel && action);

  useEffect(() => {
    if (!message) return;
    // Announce the action too, or a screen-reader user is told something happened
    // without being told it can be undone.
    AccessibilityInfo.announceForAccessibility(
      hasAction ? `${message}. ${actionLabel}` : message,
    );
    // An undo needs time to read, decide and reach; a plain confirmation does not.
    const timer = setTimeout(clear, hasAction ? 6000 : 2200);
    return () => clearTimeout(timer);
  }, [message, seq, clear, hasAction, actionLabel]);

  if (!message) return null;

  return (
    <View
      // "box-none" and not "none": the container must stay transparent to touches
      // so it never blocks the screen underneath, but the action button inside has
      // to be tappable. With "none" the undo affordance rendered and did nothing.
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
        // Only an actionable toast captures touches. A plain confirmation stays
        // transparent, so it cannot swallow a tap on whatever is underneath it.
        pointerEvents={hasAction ? 'auto' : 'none'}
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
