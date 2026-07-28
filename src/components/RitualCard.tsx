import React, { useEffect, useRef } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { artRegistry, type AssetId } from '@/assets/registry';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { type } from '@/theme/typography';
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
  primary?: boolean;
  compact?: boolean;
}

const CARD_W = 360; // approximate; the shimmer just needs to travel past the edge

export function RitualCard({ icon, title, subtitle, done, locked, onPress, art, primary = false, compact = false }: Props) {
  const t = useTheme();
  const reduceMotion = useReducedMotion();
  const { t: tr, tf } = useT();
  // With art, the card is a dark warm scene regardless of the app theme, so the
  // text/icon must be light — theme colors (t.ink) would be dark-on-dark in the
  // light theme and vanish. Fall back to theme colors only when there's no art.
  const hasArt = !!(art && artRegistry[art]);
  const titleColor = hasArt ? '#F2EEE6' : t.ink;
  const subColor = done ? t.gold : hasArt ? 'rgba(242,238,230,0.94)' : t.inkSoft;
  const chevColor = hasArt ? 'rgba(242,238,230,0.88)' : t.inkFaint;

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
      accessibilityLabel={
        done
          ? `${title}, ${tr('today.undoCompletion')}`
          : locked
            ? tf('a11y.lockedItem', { title })
            : title
      }
      accessibilityState={{ disabled: Boolean(locked), selected: done }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: t.surface,
        borderRadius: radius.card,
        borderColor: done || primary ? t.gold : hasArt ? 'rgba(255,255,255,0.10)' : t.border,
        borderWidth: primary ? 2 : 1,
        padding: compact ? spacing.md : spacing.lg,
        gap: spacing.lg,
        overflow: 'hidden',
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
      {/* right-weighted background art + a left→right scrim so the icon and
          text stay on near-solid surface while the amber glow shows on the right */}
      {art && artRegistry[art] ? (
        <>
          <Image
            source={artRegistry[art]!}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
          {/* warm near-black scrim, evened out so the candle glow suffuses the
              whole card (not a flat dark half) while the left stays legible */}
          <LinearGradient
            colors={['rgba(22,15,8,0.94)', 'rgba(22,15,8,0.86)', 'rgba(22,15,8,0.74)']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />
        </>
      ) : null}

      {/* shimmer overlay — sweeps once on completion, invisible otherwise */}
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
          width: compact ? 36 : 48,
          height: compact ? 36 : 48,
          borderRadius: radius.inner,
          backgroundColor: done ? t.goldSoft : hasArt ? 'rgba(255,255,255,0.14)' : t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={22} color={done ? t.gold : hasArt ? '#F2EEE6' : t.inkSoft} />
      </View>
      <View style={{ flex: 1 }}>
        {primary ? (
          <Text style={{ ...type.overlineBold, color: t.goldText, marginBottom: 2 }}>
            {tr('today.nextStep')}
          </Text>
        ) : null}
        <Text style={{ ...type.bodySemi, color: titleColor }}>{title}</Text>
        {!compact ? <Text style={{ ...type.callout, color: subColor, marginTop: 2 }}>
          {done ? `${tr('today.completed')} · ${tr('today.undo')}` : subtitle}
        </Text> : null}
      </View>
      {done ? (
        <Animated.View entering={reduceMotion ? undefined : ZoomIn.springify().damping(12)}>
          <Ionicons name="checkmark-circle" size={26} color={t.gold} />
        </Animated.View>
      ) : locked ? (
        <Ionicons name="lock-closed-outline" size={22} color={chevColor} />
      ) : (
        <Ionicons name="chevron-forward" size={22} color={chevColor} />
      )}
    </Pressable>
  );
}
