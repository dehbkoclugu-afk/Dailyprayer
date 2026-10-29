import React from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { planDayArtSource } from '@/assets/planDayRegistry';
import { useArtwork } from '@/hooks/useArtwork';
import { useTheme } from '@/hooks/useTheme';
import { artworkScrims } from '@/theme/artContrast';

interface Props {
  planId: string;
  dayIndex: number;
  radius: number;
  height?: number;
  variant?: 'row' | 'hero';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export function PlanDayArtwork({ planId, dayIndex, radius, height, variant = 'row', style, children }: Props) {
  const t = useTheme();
  const artwork = useArtwork();
  const source = planDayArtSource(planId, dayIndex, artwork.scheme);

  return (
    <View style={[{ height, borderRadius: radius, overflow: 'hidden', backgroundColor: t.surface }, style]}>
      {source ? <Image source={source} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} accessibilityIgnoresInvertColors /> : null}
      {variant === 'row' && source ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: artworkScrims.strong }}
        />
      ) : null}
      {children}
    </View>
  );
}
