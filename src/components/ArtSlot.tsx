import React from 'react';
import { Image, Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { artRegistry, artSpecs, type AssetId } from '@/assets/registry';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';

interface Props {
  id: AssetId;
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

  return (
    // minHeight, not height: several call sites overlay text on this art (hero
    // titles, taglines, benefit lists), and a fixed height combined with
    // overflow:hidden clips that text at large system font sizes instead of
    // letting the card grow (roadmap item 30). The absolutely-positioned image
    // below still fills whatever height the box ends up with.
    <View style={[{ minHeight: height, borderRadius: radius, overflow: 'hidden' }, style]}>
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
          {/* Dev-only — shown when art isn't registered yet, never in a release
              build. Still raised to 11sp (roadmap item 32); no reason for
              anyone reading it to strain either. */}
          <Text style={{ fontFamily: fonts.sans, fontSize: 11, color: t.inkSoft, marginTop: 2 }}>
            {spec.label} · {spec.size}
          </Text>
        </View>
      )}
      {children}
    </View>
  );
}
