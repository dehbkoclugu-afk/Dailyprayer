import React from 'react';
import { Text, View } from 'react-native';
import Animated, { ZoomIn, useReducedMotion } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { type as ty } from '@/theme/typography';
import { useT } from '@/i18n';

interface Props {
  done: number;
  total: number;
  size?: number;
}

/**
 * Daily completion indicator. Rendered as a segmented dot ring ,
 * avoids an SVG dependency while reading clearly at small sizes.
 */
export function ProgressRing({ done, total, size = 56 }: Props) {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const reduceMotion = useReducedMotion();
  const number = new Intl.NumberFormat(locale);
  const dots = Array.from({ length: total }, (_, i) => i < done);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${tr('today.completed')}: ${number.format(done)}/${number.format(total)}`}
      accessibilityValue={{ min: 0, max: total, now: done }}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{ position: 'absolute', width: size, height: size }}>
        {dots.map((filled, i) => {
          const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
          const r = size / 2 - 5;
          return (
            // key includes fill state so a newly-earned dot pops in with a spring
            <Animated.View
              key={`${i}-${filled}`}
              entering={filled && !reduceMotion ? ZoomIn.springify().damping(12) : undefined}
              style={{
                position: 'absolute',
                left: size / 2 + r * Math.cos(angle) - 4,
                top: size / 2 + r * Math.sin(angle) - 4,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: filled ? t.gold : t.border,
              }}
            />
          );
        })}
      </View>
      <Text
        style={{ ...ty.secondaryStrong, color: t.ink, fontVariant: ['tabular-nums'] }}
      >
        {done}/{total}
      </Text>
    </View>
  );
}
