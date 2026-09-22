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
  useReducedMotion,
} from 'react-native-reanimated';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/hooks/useTheme';
import { type as ty } from '@/theme/typography';
import { useT } from '@/i18n';

interface Props {
  count: number;
  litToday: boolean;
}

/** Streak flame , breathes gently when lit today (disabled under Reduce Motion). */
export function StreakFlame({ count, litToday }: Props) {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const prevCount = useRef(count);

  // one-shot pop when the streak ticks up (design-100 #58)
  useEffect(() => {
    if (!reduceMotion && count > prevCount.current) {
      scale.value = withSequence(withSpring(1.25, { damping: 12 }), withSpring(1, { damping: 16 }));
    }
    prevCount.current = count;
  }, [count, reduceMotion, scale]);

  useEffect(() => {
    if (!reduceMotion && litToday) {
      scale.value = withRepeat(
        withTiming(1.06, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    }
    return () => {
      cancelAnimation(scale);
      scale.value = 1;
    };
  }, [litToday, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View
      accessible
      accessibilityLabel={`${new Intl.NumberFormat(locale).format(count)} ${tr('today.dayStreak')}${litToday ? `, ${tr('today.completed')}` : ''}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
      <Animated.View style={style}>
        <Ionicons name="flame" size={22} color={litToday ? t.gold : t.inkFaint} />
      </Animated.View>
      <Text
        style={{
          ...ty.metricSmall,
          color: litToday ? t.gold : t.inkSoft,
          fontVariant: ['tabular-nums'],
        }}
      >
        {count}
      </Text>
    </View>
  );
}
