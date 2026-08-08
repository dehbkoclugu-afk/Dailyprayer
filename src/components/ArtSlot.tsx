import React from 'react';
import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { artSpecs, type AssetId } from '@/assets/registry';
import { useArtwork } from '@/hooks/useArtwork';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';

interface Props {
  id: AssetId;
  height?: number;
  /** cover fills the frame (hero art); contain floats spot art */
  fit?: 'cover' | 'contain';
  radius?: number;
  style?: StyleProp<ViewStyle>;
  /** Theme-aware scrim. Bare preserves the original artwork untouched. */
  variant?: 'bare' | 'row' | 'card' | 'hero';
  /** rendered above the art (e.g. scrims, text) */
  children?: React.ReactNode;
}

const DARK_SCRIMS = {
  row: ['rgba(14,18,32,0.96)', 'rgba(14,18,32,0.80)', 'rgba(14,18,32,0.24)'],
  card: ['rgba(14,18,32,0.93)', 'rgba(14,18,32,0.68)', 'rgba(14,18,32,0.18)'],
  hero: ['rgba(14,18,32,0.10)', 'rgba(14,18,32,0.38)', 'rgba(14,18,32,0.94)'],
} as const;

/**
 * Art slot: renders finished artwork when registered in artRegistry, otherwise
 * an elegant labeled placeholder so the layout is final before art exists.
 */
export function ArtSlot({ id, height, fit = 'cover', radius = 0, style, variant = 'bare', children }: Props) {
  const t = useTheme();
  const artwork = useArtwork();
  const source = artwork.source(id);
  const spec = artSpecs[id];
  const dawnSurface = artwork.scheme === 'dawn' && (variant === 'row' || variant === 'card');
  const scrim =
    variant === 'bare'
      ? null
      : dawnSurface
        ? null
        : DARK_SCRIMS[variant];

  return (
    <View
      style={[
        { height, borderRadius: radius, overflow: 'hidden' },
        dawnSurface ? { backgroundColor: t.surface } : null,
        style,
      ]}
    >
      {source ? (
        <Image
          source={source}
          resizeMode={fit}
          style={{
            position: 'absolute',
            right: 0,
            width: dawnSurface ? '44%' : '100%',
            height: '100%',
          }}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: t.surfaceAlt,
            borderWidth: 1,
            borderStyle: 'dashed',
            borderColor: t.gold,
            borderRadius: radius,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.85,
          }}
        >
          <Ionicons name="image-outline" size={22} color={t.gold} />
          <Text
            style={{
              fontFamily: fonts.sansSemiBold,
              fontSize: 11,
              color: t.gold,
              marginTop: 6,
              letterSpacing: 1,
            }}
          >
            {id}
          </Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 10, color: t.inkSoft, marginTop: 2 }}>
            {spec.label} · {spec.size}
          </Text>
        </View>
      )}
      {dawnSurface && source ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '44%',
            backgroundColor: 'rgba(251,247,240,0.10)',
            borderLeftWidth: 1,
            borderLeftColor: t.border,
          }}
        />
      ) : null}
      {scrim ? (
        <LinearGradient
          colors={scrim}
          locations={[0, 0.56, 1]}
          start={variant === 'hero' ? { x: 0.5, y: 0 } : { x: 0, y: 0.5 }}
          end={variant === 'hero' ? { x: 0.5, y: 1 } : { x: 1, y: 0.5 }}
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
      ) : null}
      {children}
    </View>
  );
}
