import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type AssetId } from '@/assets/registry';
import { ArtSlot } from '@/components/ArtSlot';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  done: boolean;
  locked?: boolean;
  onPress: () => void;
  /** optional right-weighted background art (a left→right scrim keeps text legible) */
  art?: AssetId;
}

const CARD_W = 360; // approximate; the shimmer just needs to travel past the edge

export function RitualCard({ icon, title, subtitle, done, locked, onPress, art }: Props) {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr } = useT();
  const hasArt = !!(art && artwork.source(art));
  const titleColor = hasArt ? artwork.foreground.primary : t.ink;
  const subColor = done ? t.gold : hasArt ? artwork.foreground.secondary : t.inkSoft;
  const chevColor = hasArt ? artwork.foreground.secondary : t.inkFaint;

  // One-time gold shimmer sweep when a card transitions to done (design-100 #57).
  const shimmerX = useSharedValue(-CARD_W);
  const prevDone = useRef(done);
  useEffect(() => {
    if (done && !prevDone.current) {
      shimmerX.value = -CARD_W;
      shimmerX.value = withSequence(
        withTiming(CARD_W, {
          duration: 650,
          easing: Easing.out(Easing.cubic),
          reduceMotion: ReduceMotion.System,
        }),
      );
    }
    prevDone.current = done;
  }, [done, shimmerX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }, { rotate: '18deg' }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${done ? `, ${tr('today.undoCompletion')}` : locked ? ', locked' : ''}`}
      accessibilityState={{ disabled: Boolean(locked), selected: done }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: t.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: done ? t.gold : t.border,
        paddingLeft: spacing.lg,
        paddingVertical: spacing.lg,
        paddingRight: hasArt && artwork.scheme === 'dawn' ? 104 : 52,
        gap: spacing.lg,
        overflow: 'hidden',
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      {art && hasArt ? (
        <ArtSlot
          id={art}
          variant="row"
          radius={radius.card}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
      ) : null}

      {/* shimmer overlay , sweeps once on completion, invisible otherwise */}
      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', top: -40, bottom: -40, width: 80 },
          shimmerStyle,
        ]}
      >
        <LinearGradient
          colors={['rgba(217,164,65,0)', 'rgba(217,164,65,0.35)', 'rgba(217,164,65,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.inner,
          backgroundColor: done ? t.goldSoft : hasArt ? artwork.foreground.badge : t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={22} color={done ? t.gold : hasArt ? artwork.foreground.primary : t.inkSoft} />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={{ fontFamily: fonts.sansSemiBold, fontSize: 17, lineHeight: 21, color: titleColor }}>{title}</Text>
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: subColor, marginTop: 2 }}>
          {done ? `${tr('today.completed')} · ${tr('today.undo')}` : subtitle}
        </Text>
      </View>
      {done ? (
        <Animated.View entering={ZoomIn.springify().damping(12)} style={{ position: 'absolute', right: spacing.lg }}>
          <Ionicons name="checkmark-circle" size={26} color={t.gold} />
        </Animated.View>
      ) : locked ? (
        <Ionicons name="lock-closed-outline" size={22} color={chevColor} style={{ position: 'absolute', right: spacing.lg }} />
      ) : (
        <View
          style={{
            position: 'absolute',
            right: hasArt && artwork.scheme === 'dawn' ? 39 : spacing.lg,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: hasArt && artwork.scheme === 'dawn' ? 'rgba(255,255,255,0.90)' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-forward" size={22} color={chevColor} />
        </View>
      )}
    </Pressable>
  );
}
