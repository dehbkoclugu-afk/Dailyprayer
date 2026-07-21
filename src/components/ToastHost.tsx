import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
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
  const { message, seq, clear } = useToastStore();

  useEffect(() => {
    if (!message) return;
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
        <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: t.ink }}>{message}</Text>
      </Animated.View>
    </View>
  );
}
