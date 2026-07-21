import React, { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';

interface Props {
  count: number;
  litToday: boolean;
}

/** Streak flame — breathes gently when lit today (disabled under Reduce Motion). */
export function StreakFlame({ count, litToday }: Props) {
  const t = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced || !litToday) return;
      scale.value = withRepeat(
        withTiming(1.06, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [litToday, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View
      accessibilityLabel={`${count} day streak${litToday ? ', completed today' : ''}`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
    >
      <Animated.View style={style}>
        <Ionicons name="flame" size={22} color={litToday ? t.gold : t.inkFaint} />
      </Animated.View>
      <Text
        style={{
          fontFamily: fonts.sansBold,
          fontSize: 18,
          color: litToday ? t.gold : t.inkSoft,
          fontVariant: ['tabular-nums'],
        }}
      >
        {count}
      </Text>
    </View>
  );
}
