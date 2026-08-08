import React from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { planDayArtSource } from '@/assets/planDayRegistry';
import { useArtwork } from '@/hooks/useArtwork';
import { useTheme } from '@/hooks/useTheme';

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
  const dawn = artwork.scheme === 'dawn';
  const source = planDayArtSource(planId, dayIndex, artwork.scheme);

  const rowScrim = dawn
    ? ['rgba(251,247,240,0.90)', 'rgba(251,247,240,0.70)', 'rgba(251,247,240,0.16)'] as const
    : ['rgba(14,18,32,0.90)', 'rgba(14,18,32,0.68)', 'rgba(14,18,32,0.16)'] as const;

  return (
    <View style={[{ height, borderRadius: radius, overflow: 'hidden', backgroundColor: t.surface }, style]}>
      {source ? <Image source={source} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} accessibilityIgnoresInvertColors /> : null}
      {variant === 'row' && source ? (
        <LinearGradient
          pointerEvents="none"
          colors={rowScrim}
          locations={[0, 0.56, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
      ) : null}
      {children}
    </View>
  );
}
