import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { scaledType } from '@/theme/typography';

interface Props {
  size?: number;
  /** override text color; defaults to theme ink (ivory on dark, near-black on light) */
  color?: string;
}

/**
 * "Lumen" wordmark , Fraunces serif with a gold tittle over the "e", recreated
 * from the brand wordmark as live text so it stays crisp at any size and adapts
 * to light/dark themes. (Rasterizing the supplied art was not viable: ivory
 * letters on a neutral checkerboard have no separable color/brightness signal.)
 */
export function Wordmark({ size = 22, color }: Props) {
  const t = useTheme();
  const ink = color ?? t.ink;
  const dot = Math.round(size * 0.16);
  const seg = { ...scaledType('wordmark', size / 22), color: ink };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} accessibilityLabel="Lumen">
      <Text style={seg}>Lum</Text>
      <View style={{ alignItems: 'center' }}>
        {/* gold tittle floating above the e */}
        <View
          style={{
            position: 'absolute',
            top: -dot * 0.7,
            width: dot,
            height: dot,
            borderRadius: dot / 2,
            backgroundColor: t.gold,
          }}
        />
        <Text style={seg}>e</Text>
      </View>
      <Text style={seg}>n</Text>
    </View>
  );
}
