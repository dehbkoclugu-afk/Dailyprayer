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
 * "Selaora" wordmark rendered as live text so it remains crisp at every size.
 * The gold halo above the "o" preserves the existing light motif without tying
 * the visual identity to the former product name.
 */
export function Wordmark({ size = 22, color }: Props) {
  const t = useTheme();
  const ink = color ?? t.ink;
  const dot = Math.round(size * 0.16);
  const seg = { ...scaledType('wordmark', size / 22), color: ink };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }} accessibilityLabel="Selaora">
      <Text style={seg}>Sela</Text>
      <View style={{ alignItems: 'center' }}>
        {/* gold halo floating above the o */}
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
        <Text style={seg}>o</Text>
      </View>
      <Text style={seg}>ra</Text>
    </View>
  );
}
