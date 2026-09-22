import React from 'react';
import { Image, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { artSpecs, type AssetId } from '@/assets/registry';
import { useArtwork } from '@/hooks/useArtwork';
import { useTheme } from '@/hooks/useTheme';
import { type as ty } from '@/theme/typography';
import { artworkScrims, type ArtworkScrimPreset } from '@/theme/artContrast';

interface Props {
  id: AssetId;
  height?: number;
  /** cover fills the frame (hero art); contain floats spot art */
  fit?: 'cover' | 'contain';
  radius?: number;
  style?: StyleProp<ViewStyle>;
  /** Semantic artwork overlay. None preserves the original artwork untouched. */
  scrim?: ArtworkScrimPreset | 'none';
  /** rendered above the art (e.g. scrims, text) */
  children?: React.ReactNode;
}

/**
 * Art slot: renders finished artwork when registered in artRegistry, otherwise
 * an elegant labeled placeholder so the layout is final before art exists.
 */
export function ArtSlot({ id, height, fit = 'cover', radius = 0, style, scrim = 'none', children }: Props) {
  const t = useTheme();
  const artwork = useArtwork();
  const source = artwork.source(id);
  const spec = artSpecs[id];
  const overlay = scrim === 'none' ? null : artworkScrims[scrim];

  return (
    <View style={[{ height, borderRadius: radius, overflow: 'hidden' }, style]}>
      {source ? (
        <Image
          source={source}
          resizeMode={fit}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
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
              ...ty.labelSmall,
              color: t.gold,
              marginTop: 6,
              letterSpacing: 1,
            }}
          >
            {id}
          </Text>
          <Text style={{ ...ty.labelSmallRegular, color: t.inkSoft, marginTop: 2 }}>
            {spec.label} · {spec.size}
          </Text>
        </View>
      )}
      {source && overlay ? (
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: overlay }}
        />
      ) : null}
      {children}
    </View>
  );
}
