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
  useReducedMotion,
  ZoomIn,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useArtwork } from '@/hooks/useArtwork';
import { type as ty } from '@/theme/typography';
import { interaction, radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  done: boolean;
  locked?: boolean;
  /** The single unfinished step currently recommended on Today. */
  featured?: boolean;
  onPress: () => void;
  /** optional right-weighted background art (a left→right scrim keeps text legible) */
  art?: AssetId;
}

const CARD_W = 360; // approximate; the shimmer just needs to travel past the edge

export function RitualCard({ icon, title, subtitle, done, locked, featured = false, onPress, art }: Props) {
  const t = useTheme();
  const artwork = useArtwork();
  const { t: tr, locale } = useT();
  const reduceMotion = useReducedMotion();
  const hasArt = !!(art && artwork.source(art));
  const titleColor = hasArt ? t.onArtwork : t.ink;
  const subColor = hasArt ? t.onArtworkMuted : done ? t.sacredGold : t.inkSoft;
  const chevColor = hasArt ? artwork.foreground.secondary : t.inkFaint;

  // One-time gold shimmer sweep when a card transitions to done (design-100 #57).
  const shimmerX = useSharedValue(-CARD_W);
  const prevDone = useRef(done);
  useEffect(() => {
    if (done && !prevDone.current && !reduceMotion) {
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
  }, [done, reduceMotion, shimmerX]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }, { rotate: '18deg' }],
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${done ? `, ${tr('today.undoCompletion')}` : ''}`}
      accessibilityHint={locked ? tr('today.unlock') : undefined}
      accessibilityState={{ selected: done }}
      style={({ pressed }) => ({
        minHeight: done ? 84 : hasArt ? 136 : undefined,
        alignItems: hasArt ? 'center' : 'stretch',
        justifyContent: hasArt ? 'center' : undefined,
        backgroundColor: t.surface,
        borderRadius: radius.card,
        borderWidth: featured ? 2 : 1,
        borderColor: done || featured ? t.gold : t.border,
        padding: done ? spacing.md : spacing.lg,
        overflow: 'hidden',
        opacity: pressed ? interaction.pressedOpacity : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      {art && hasArt ? (
        <ArtSlot
          id={art}
          scrim="soft"
          radius={radius.card}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
      ) : null}
      {hasArt ? (
        <LinearGradient
          pointerEvents="none"
          colors={done
            ? ['rgba(8,10,18,0.70)', 'rgba(8,10,18,0.38)', 'rgba(8,10,18,0.08)']
            : ['rgba(8,10,18,0.14)', 'rgba(8,10,18,0.48)', 'rgba(8,10,18,0.20)']}
          start={done ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 }}
          end={done ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 }}
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
          width: '100%',
          flexDirection: done ? 'row' : 'column',
          alignItems: done ? 'center' : hasArt ? 'center' : 'flex-start',
          paddingHorizontal: done ? spacing.sm : hasArt ? spacing.xl : 0,
          paddingRight: done ? spacing.xxxl : undefined,
        }}
      >
        <View
          style={{
            width: done ? 40 : hasArt ? 38 : 48,
            height: done ? 40 : hasArt ? 38 : 48,
            borderRadius: done ? 20 : hasArt ? 19 : radius.inner,
            backgroundColor: done ? t.goldSoft : hasArt ? artwork.foreground.badge : t.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: done ? 0 : hasArt ? spacing.sm : spacing.md,
            marginRight: done ? spacing.md : 0,
          }}
        >
          <Ionicons name={icon} size={hasArt ? 19 : 22} color={done ? t.sacredGold : hasArt ? t.onArtwork : t.inkSoft} />
        </View>
        <View style={{ flex: done ? 1 : undefined, alignItems: done ? 'flex-start' : hasArt ? 'center' : 'flex-start' }}>
          <Text
            numberOfLines={done ? 1 : 2}
            style={{
              ...ty.bodyStrong,
              textAlign: done ? 'left' : hasArt ? 'center' : 'left',
              color: titleColor,
              ...(hasArt ? { textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 7 } : null),
            }}
          >
            {title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...ty.labelRegular,
              textAlign: done ? 'left' : hasArt ? 'center' : 'left',
              color: subColor,
              marginTop: 3,
              ...(hasArt ? { textShadowColor: 'rgba(0,0,0,0.72)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 } : null),
            }}
          >
            {done ? `${tr('today.completed')} · ${tr('today.undo')}` : subtitle}
          </Text>
        </View>
      </View>
      {done ? (
        <Animated.View entering={reduceMotion ? undefined : ZoomIn.springify().damping(12)} style={{ position: 'absolute', right: spacing.lg, top: 29 }}>
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
