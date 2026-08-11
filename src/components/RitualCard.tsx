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
import { getDirectionalIconName } from '@/i18n/direction';

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
  const { t: tr, locale } = useT();
  const hasArt = !!(art && artwork.source(art));
  const titleColor = hasArt ? '#FFFFFF' : t.ink;
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
        minHeight: hasArt ? 136 : undefined,
        alignItems: hasArt ? 'center' : 'stretch',
        justifyContent: hasArt ? 'center' : undefined,
        backgroundColor: t.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: done ? t.gold : t.border,
        padding: spacing.lg,
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

      <View style={{ alignItems: hasArt ? 'center' : 'flex-start', paddingHorizontal: hasArt ? spacing.xl : 0 }}>
        <View
          style={{
            width: hasArt ? 38 : 48,
            height: hasArt ? 38 : 48,
            borderRadius: hasArt ? 19 : radius.inner,
            backgroundColor: done ? t.goldSoft : hasArt ? artwork.foreground.badge : t.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: hasArt ? spacing.sm : spacing.md,
          }}
        >
          <Ionicons name={icon} size={hasArt ? 19 : 22} color={done ? t.gold : hasArt ? '#FFFFFF' : t.inkSoft} />
        </View>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: fonts.sansSemiBold,
            fontSize: 17,
            lineHeight: 21,
            textAlign: hasArt ? 'center' : 'left',
            color: titleColor,
            ...(hasArt ? { textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 7 } : null),
          }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: fonts.sans,
            fontSize: 14,
            lineHeight: 18,
            textAlign: hasArt ? 'center' : 'left',
            color: subColor,
            marginTop: 3,
            ...(hasArt ? { textShadowColor: 'rgba(0,0,0,0.72)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 } : null),
          }}
        >
          {done ? `${tr('today.completed')} · ${tr('today.undo')}` : subtitle}
        </Text>
      </View>
      {done ? (
        <Animated.View entering={ZoomIn.springify().damping(12)} style={{ position: 'absolute', right: spacing.lg, top: spacing.lg }}>
          <Ionicons name="checkmark-circle" size={26} color={t.gold} />
        </Animated.View>
      ) : locked ? (
        <Ionicons name="lock-closed-outline" size={22} color={chevColor} style={{ position: 'absolute', right: spacing.lg, top: spacing.lg }} />
      ) : (
        <View
          style={{
            position: 'absolute',
            right: spacing.md,
            top: spacing.md,
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: hasArt ? 'rgba(14,18,32,0.28)' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={getDirectionalIconName('chevron-forward', locale)} size={22} color={chevColor} />
        </View>
      )}
    </Pressable>
  );
}
