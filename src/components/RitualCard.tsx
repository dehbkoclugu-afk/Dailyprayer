import React, { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  done: boolean;
  locked?: boolean;
  primary?: boolean;
  onPress: () => void;
}

const CARD_W = 360; // approximate; the shimmer just needs to travel past the edge

export function RitualCard({ icon, title, subtitle, done, locked, primary, onPress }: Props) {
  const t = useTheme();
  const { t: tr } = useT();

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
        backgroundColor: primary ? t.goldSoft : t.surface,
        borderRadius: radius.card,
        borderColor: primary || done ? t.gold : t.border,
        borderWidth: primary ? 2 : 1,
        padding: spacing.lg,
        gap: spacing.lg,
        overflow: 'hidden',
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
      })}
    >
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
          width: 48,
          height: 48,
          borderRadius: radius.inner,
          backgroundColor: done ? t.goldSoft : t.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={22} color={done ? t.gold : t.inkSoft} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 17, color: t.ink }}>{title}</Text>
        <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: done ? t.gold : t.inkSoft, marginTop: 2 }}>
          {done ? `${tr('today.completed')} · ${tr('common.undo')}` : subtitle}
        </Text>
      </View>
      {done ? (
        <Animated.View entering={ZoomIn.springify().damping(12)}>
          <Ionicons name="checkmark-circle" size={26} color={t.gold} />
        </Animated.View>
      ) : locked ? (
        <Ionicons name="lock-closed-outline" size={22} color={t.inkFaint} />
      ) : (
        <Ionicons name="chevron-forward" size={22} color={t.inkFaint} />
      )}
    </Pressable>
  );
}
