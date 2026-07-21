import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';

interface Props {
  done: number;
  total: number;
  size?: number;
}

/**
 * Daily completion indicator. Rendered as a segmented dot ring —
 * avoids an SVG dependency while reading clearly at small sizes.
 */
export function ProgressRing({ done, total, size = 56 }: Props) {
  const t = useTheme();
  const dots = Array.from({ length: total }, (_, i) => i < done);
  return (
    <View
      accessibilityLabel={`${done} of ${total} completed today`}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{ position: 'absolute', width: size, height: size }}>
        {dots.map((filled, i) => {
          const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
          const r = size / 2 - 5;
          return (
            <View
              key={i}
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
      <Text style={{ fontFamily: fonts.sansBold, fontSize: 15, color: t.ink }}>
        {done}/{total}
      </Text>
    </View>
  );
}
