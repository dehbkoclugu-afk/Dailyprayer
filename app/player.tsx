import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PillButton } from '@/components/PillButton';
import { NotFoundState } from '@/components/NotFoundState';
import { useTheme } from '@/hooks/useTheme';
import { type } from '@/theme/typography';
import { artwork, interaction, scrim, spacing, TAP_MIN } from '@/theme/tokens';
import { usePrayers } from '@/data/prayers';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { translate, useT } from '@/i18n';
import { useReduceMotion } from '@/a11y/reduceMotion';

type Pace = 'slow' | 'normal' | 'quick';

const PACE_FACTOR: Record<Pace, number> = {
  slow: 115,
  normal: 90,
  quick: 65,
};

/**
 * Guided prayer player — paced text lines with a breathing pause between them.
 * Audio narration slots in here later (expo-audio) without changing the flow.
 */
export default function Player() {
  const { t: tr } = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const prayers = usePrayers();
  // Falling back to prayers[0] silently played a prayer the user did not ask for.
  // Resolving here keeps the player's hooks off a possibly-missing prayer.
  const prayer = prayers.find((p) => p.id === id);

  if (!prayer) {
    return (
      <NotFoundState
        icon="leaf-outline"
        title={tr('notFound.prayerTitle')}
        body={tr('notFound.prayerBody')}
        actionLabel={tr('notFound.prayerAction')}
        onAction={() => router.replace('/(tabs)/pray')}
      />
    );
  }

  return <PlayerScreen prayer={prayer} />;
}

function PlayerScreen({ prayer }: { prayer: ReturnType<typeof usePrayers>[number] }) {
  const t = useTheme();
  const { t: tr, tn } = useT();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const completeStep = useStreakStore((s) => s.completeStep);
  const [line, setLine] = useState(0);
  const [paused, setPaused] = useState(false);
  const [accessibilityReady, setAccessibilityReady] = useState(false);
  const [pace, setPace] = useState<Pace>('normal');
  const lastLine = line >= prayer.script.length - 1;
  const progress = (line + 1) / prayer.script.length;
  const remainingMinutes = Math.max(
    1,
    Math.ceil(
      prayer.script.slice(line + 1).reduce((sum, item) => sum + item.length, 0) *
        PACE_FACTOR[pace] /
        60000,
    ),
  );

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((enabled) => {
        if (!mounted) return;
        if (enabled) setPaused(true);
        setAccessibilityReady(true);
      })
      .catch(() => {
        if (mounted) setAccessibilityReady(true);
      });
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      if (enabled) setPaused(true);
      setAccessibilityReady(true);
    });
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(`lumen-player-${prayer.id}`)
      .then((saved) => {
        const parsed = Number(saved);
        if (Number.isInteger(parsed) && parsed >= 0 && parsed < prayer.script.length) setLine(parsed);
      })
      .catch(() => {});
  }, [prayer.id, prayer.script.length]);

  useEffect(() => {
    AsyncStorage.setItem(`lumen-player-${prayer.id}`, String(line)).catch(() => {});
    AccessibilityInfo.announceForAccessibility(prayer.script[line]);
  }, [line, prayer.id, prayer.script]);

  useEffect(() => {
    if (!accessibilityReady || paused || lastLine) return;
    const ms = Math.max(4000, prayer.script[line].length * PACE_FACTOR[pace]);
    const timer = setTimeout(() => setLine((l) => l + 1), ms);
    return () => clearTimeout(timer);
  }, [accessibilityReady, line, pace, paused, lastLine, prayer.script]);

  const finish = () => {
    completeStep('prayer');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    AsyncStorage.removeItem(`lumen-player-${prayer.id}`).catch(() => {});
    toast(translate('toast.prayer'));
    router.back();
  };

  return (
    <LinearGradient colors={[t.duskFrom, t.duskTo]} style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View
            style={{ flex: 1 }}
            accessible
            accessibilityLabel={`${prayer.title}. ${tr('player.guidedText')}. ${remainingMinutes} ${tn(remainingMinutes, 'player.minLeft')}`}
          >
            <Text style={{ ...type.calloutSemi, color: artwork.onArtwork }}>
              {prayer.title}
            </Text>
            <Text style={{ ...type.label, color: artwork.onArtworkSoft, marginTop: 2 }}>
              {tr('player.guidedText')} · {remainingMinutes} {tn(remainingMinutes, 'player.minLeft')}
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={tr('a11y.closePlayer')}
            style={{ width: TAP_MIN, height: TAP_MIN, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="close" size={24} color="#A9A698" />
          </Pressable>
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          {line > 0 ? (
            <Text
              accessibilityElementsHidden
              importantForAccessibility="no"
              numberOfLines={2}
              style={{ ...type.quoteSmall, color: artwork.onArtwork, opacity: 0.32, textAlign: 'center', marginBottom: spacing.xl }}
            >
              {prayer.script[line - 1]}
            </Text>
          ) : null}
          {/* each line rises gently into place — the "breath" feel */}
          <Animated.Text
            key={line}
            entering={reduceMotion ? undefined : FadeInUp.duration(600)}
            exiting={reduceMotion ? undefined : FadeOut.duration(250)}
            accessibilityRole="text"
            style={{
              ...type.verse,
              color: artwork.onArtwork,
              textAlign: 'center',
            }}
          >
            {prayer.script[line]}
          </Animated.Text>
        </View>

        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: prayer.script.length, now: line + 1 }}
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: scrim.top[0],
            marginBottom: spacing.md,
            overflow: 'hidden',
          }}
        >
          <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: artwork.sacredGold }} />
        </View>
        <View style={{ flexDirection: 'row', alignSelf: 'center', marginBottom: spacing.sm }}>
          {(['slow', 'normal', 'quick'] as const).map((value) => (
            <Pressable key={value} onPress={() => setPace(value)} accessibilityRole="radio"
              accessibilityState={{ checked: pace === value }}
              accessibilityLabel={`${tr('player.pace')}: ${tr(`player.pace.${value}` as never)}`}
              style={({ pressed }) => ({ minHeight: TAP_MIN, justifyContent: 'center', paddingHorizontal: spacing.md, borderBottomWidth: pace === value ? 2 : 0, borderBottomColor: artwork.sacredGold, opacity: pressed ? interaction.pressed : 1 })}>
              <Text style={{ ...type.labelMedium, color: pace === value ? artwork.onArtwork : artwork.onArtworkSoft }}>{tr(`player.pace.${value}` as never)}</Text>
            </Pressable>
          ))}
        </View>
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: 3, now: progress < .34 ? 1 : progress < .75 ? 2 : 3 }}
          style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
          {[0.05, 0.5, 0.95].map((point) => (
            <View key={point} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: progress >= point ? artwork.sacredGold : artwork.onArtworkSoft, opacity: progress >= point ? 1 : .35 }} />
          ))}
        </View>

        {lastLine ? (
          <PillButton label={translate('devotional.amen')} onPress={finish} />
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl }}>
            <Pressable
              onPress={() => setLine((l) => Math.max(0, l - 1))}
              disabled={line === 0}
              accessibilityRole="button"
              accessibilityState={{ disabled: line === 0 }}
              // Same rule as the reader's chapter arrows (roadmap item 24): the
              // dimming is announced by the state, the reason has to be in the
              // label.
              accessibilityLabel={line === 0 ? tr('a11y.atFirstLine') : tr('a11y.prevLine')}
              style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center', opacity: line === 0 ? 0.35 : 1 }}
            >
              <Ionicons name="play-skip-back" size={24} color="#A9A698" />
            </Pressable>
            <Pressable
              onPress={() => setPaused((p) => !p)}
              accessibilityRole="button"
              accessibilityLabel={paused ? tr('player.resume') : tr('player.pause')}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: artwork.sacredGold,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={paused ? 'play' : 'pause'} size={28} color={artwork.onSacredGold} />
            </Pressable>
            <Pressable
              onPress={() => setLine((l) => Math.min(prayer.script.length - 1, l + 1))}
              accessibilityRole="button"
              accessibilityLabel={tr('a11y.nextLine')}
              style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="play-skip-forward" size={24} color="#A9A698" />
            </Pressable>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}
