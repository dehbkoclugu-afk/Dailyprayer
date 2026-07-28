import React from 'react';
import { Image, Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { artRegistry, artSpecs, type AssetId } from '@/assets/registry';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { useScaledHeight } from '@/theme/textScale';

interface Props {
  id: AssetId;
  /** Height at default text size; grows with the reader's setting when text is laid over it. */
  height: number;
  /** cover fills the frame (hero art); contain floats spot art */
  fit?: 'cover' | 'contain';
  radius?: number;
  style?: ViewStyle;
  /** rendered above the art (e.g. scrims, text) */
  children?: React.ReactNode;
}

/**
 * Art slot: renders finished artwork when registered in artRegistry, otherwise
 * an elegant labeled placeholder so the layout is final before art exists.
 */
export function ArtSlot({ id, height, fit = 'cover', radius = 0, style, children }: Props) {
  const t = useTheme();
  const source = artRegistry[id];
  const spec = artSpecs[id];

  // Art with content laid over it is a text box that happens to have a picture
  // behind it, so it grows with the reader's text setting (roadmap item 30).
  // Bare art is a picture and keeps the height it was composed at — the paywall
  // hero was the worst case, where at 200% the title covered the four benefit
  // lines and the lowest one fell outside the frame.
  const scaled = useScaledHeight(height);
  const frameHeight = children ? scaled : height;

  return (
    <View style={[{ height: frameHeight, borderRadius: radius, overflow: 'hidden' }, style]}>
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
      {children}
    </View>
  );
}
