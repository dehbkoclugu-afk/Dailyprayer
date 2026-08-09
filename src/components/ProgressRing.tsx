import React from 'react';
import { Text, View } from 'react-native';
import Animated, { useReducedMotion, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { useT } from '@/i18n';

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
  const { t: tr } = useT();
  // roadmap item 36: Reanimated's ZoomIn already defaults to
  // ReduceMotion.System (it snaps to its end state with zero animated frames
  // when the system setting is on — confirmed empirically for the same
  // mechanism via ToastHost's entering/exiting), so this was never actually
  // broken. Made explicit anyway: a reader of this file had no way to know it
  // was covered, and an implicit dependency on a third-party default is a
  // fragile thing to leave undocumented next to `player.tsx`'s and
  // `StreakFlame.tsx`'s explicit versions of the same check.
  const reduceMotion = useReducedMotion();
  const dots = Array.from({ length: total }, (_, i) => i < done);
  return (
    <View
      // roadmap item 34/35: was a hardcoded English sentence
      // ("3 of 4 completed today") with no path to any of the other five
      // languages. The numbers stay language-invariant digits; only the
      // surrounding words are translated, the same convention every other
      // counted label in the app already follows (`${count} ${tr(key)}`).
      accessibilityLabel={`${done}/${total} ${tr('today.completedToday')}`}
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
        style={{ fontFamily: fonts.sansBold, fontSize: 15, color: t.ink, fontVariant: ['tabular-nums'] }}
      >
        {done}/{total}
      </Text>
    </View>
  );
}
