import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { useReduceMotion } from '@/a11y/reduceMotion';
import { type } from '@/theme/typography';
interface Props {
  count: number;
  litToday: boolean;
}

/** Streak flame — breathes gently when lit today (disabled under Reduce Motion). */
export function StreakFlame({ count, litToday }: Props) {
  const t = useTheme();
  const { tfn } = useT();
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const prevCount = useRef(count);

  // One-shot pop when the streak ticks up (design-100 #58). This was never gated
  // at all — the pulse below was, so reduce motion silenced the ambient breathing
  // and left the sharper of the two animations running (roadmap item 36).
  useEffect(() => {
    if (!reduceMotion && count > prevCount.current) {
      scale.value = withSequence(withSpring(1.25, { damping: 12 }), withSpring(1, { damping: 16 }));
    }
    prevCount.current = count;
  }, [count, reduceMotion, scale]);

  useEffect(() => {
    if (reduceMotion || !litToday) return undefined;
    scale.value = withRepeat(
      withTiming(1.06, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    // Depending on reduceMotion is what stops the loop mid-session: turning the
    // setting on re-runs this effect, and the cleanup cancels the repeat that is
    // already running. The promise this replaced resolved once and never again.
    return () => {
      cancelAnimation(scale);
      scale.value = 1;
    };
  }, [litToday, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View
      accessibilityLabel={tfn(count, litToday ? 'a11y.streakLitToday' : 'a11y.streak', {})}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
      <Animated.View style={style}>
        <Ionicons name="flame" size={22} color={litToday ? t.gold : t.inkFaint} />
      </Animated.View>
      <Text
        style={{
          ...type.bodyBold,
          color: litToday ? t.gold : t.inkSoft,
          fontVariant: ['tabular-nums'],
        }}
      >
        {count}
      </Text>
    </View>
  );
}
