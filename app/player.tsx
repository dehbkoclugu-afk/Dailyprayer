import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeOut, useReducedMotion } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { spacing } from '@/theme/tokens';
import { prayerArt } from '@/assets/registry';
import { usePrayers } from '@/data/prayers';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { translate, useT } from '@/i18n';
import { useScreenReaderEnabled } from '@/hooks/useScreenReaderEnabled';
import { shouldAutoAdvancePrayer } from '@/lib/accessibility';

type Pace = 'slow' | 'normal' | 'quick';

const PACE_FACTOR: Record<Pace, number> = {
  slow: 115,
  normal: 90,
  quick: 65,
};

/**
 * Guided prayer player , paced text lines with a breathing pause between them.
 * Audio narration slots in here later (expo-audio) without changing the flow.
 */
export default function Player() {
  const t = useTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const screenReaderEnabled = useScreenReaderEnabled();
  const { id } = useLocalSearchParams<{ id: string }>();
  const prayers = usePrayers();
  const prayer = prayers.find((p) => p.id === id) ?? prayers[0];
  const [line, setLine] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pace, setPace] = useState<Pace>('normal');
  const completeStep = useStreakStore((s) => s.completeStep);
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
    AsyncStorage.getItem(`lumen-player-${prayer.id}`)
      .then((saved) => {
        const parsed = Number(saved);
        if (Number.isInteger(parsed) && parsed >= 0 && parsed < prayer.script.length) setLine(parsed);
      })
      .catch(() => {});
  }, [prayer.id, prayer.script.length]);

  useEffect(() => {
    AsyncStorage.setItem(`lumen-player-${prayer.id}`, String(line)).catch(() => {});
    if (screenReaderEnabled) AccessibilityInfo.announceForAccessibility(prayer.script[line]);
  }, [line, prayer.id, prayer.script, screenReaderEnabled]);

  useEffect(() => {
    if (screenReaderEnabled) setPaused(true);
  }, [screenReaderEnabled]);

  useEffect(() => {
    if (!shouldAutoAdvancePrayer(paused, lastLine, screenReaderEnabled)) return;
    const ms = Math.max(4000, prayer.script[line].length * PACE_FACTOR[pace]);
    const timer = setTimeout(() => setLine((l) => l + 1), ms);
    return () => clearTimeout(timer);
  }, [line, pace, paused, lastLine, prayer.script, screenReaderEnabled]);

  const finish = () => {
    completeStep('prayer');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    AsyncStorage.removeItem(`lumen-player-${prayer.id}`).catch(() => {});
    toast(translate('toast.prayer'));
    router.back();
  };

  const foreground = '#FFFFFF';
  const muted = 'rgba(255,255,255,0.84)';
  const quiet = 'rgba(255,255,255,0.76)';
  const textShadow = {
    textShadowColor: 'rgba(0,0,0,0.82)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 9,
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: '#0E1220' }}>
      <StatusBar style="light" />
      <ArtSlot
        id={prayerArt(prayer.id)}
        fit="cover"
        variant="bare"
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[ty.bodyMedium, { fontSize: 16, lineHeight: 22, color: foreground, ...textShadow }]}>
              {prayer.title}
            </Text>
            <Text
              accessible
              accessibilityLabel={`${remainingMinutes} ${tr('player.minLeft')}`}
              style={[ty.caption, { color: muted, marginTop: 2, ...textShadow }]}
            >
              {tr('player.guidedText')} · {remainingMinutes} {tr('player.minLeft')}
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={tr('player.close')}
            style={({ pressed }) => ({
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(14,18,32,0.34)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.18)',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.68 : 1,
            })}
          >
            <Ionicons name="close" size={24} color={foreground} />
          </Pressable>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: spacing.sm }}>
          {/* each line rises gently into place , the "breath" feel */}
          <Animated.Text
            key={line}
            entering={reduceMotion ? undefined : FadeInUp.duration(600)}
            exiting={reduceMotion ? undefined : FadeOut.duration(250)}
            style={{
              fontFamily: fonts.serifLight,
              fontSize: 30,
              lineHeight: 43,
              color: foreground,
              textAlign: 'center',
              ...textShadow,
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
            backgroundColor: 'rgba(255,255,255,0.26)',
            marginBottom: spacing.md,
            overflow: 'hidden',
          }}
        >
          <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: t.gold }} />
        </View>
        <Pressable
          onPress={() => setPace((current) => current === 'slow' ? 'normal' : current === 'normal' ? 'quick' : 'slow')}
          accessibilityRole="button"
          accessibilityLabel={`${tr('player.pace')}: ${tr(`player.pace.${pace}` as never)}`}
          style={{ minHeight: 48, alignSelf: 'center', justifyContent: 'center', marginBottom: spacing.md }}
        >
          <Text style={[ty.label, { fontFamily: fonts.sansMedium, color: muted, ...textShadow }]}>
            {tr('player.pace')}: {tr(`player.pace.${pace}` as never)}
          </Text>
        </Pressable>

        {lastLine ? (
          <PillButton label={translate('devotional.amen')} onPress={finish} />
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl }}>
            <Pressable
              onPress={() => setLine((l) => Math.max(0, l - 1))}
              disabled={line === 0}
              accessibilityRole="button"
              accessibilityState={{ disabled: line === 0 }}
              accessibilityLabel={tr('player.previous')}
              style={({ pressed }) => ({
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: 'rgba(14,18,32,0.28)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.16)',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: line === 0 ? 0.35 : pressed ? 0.65 : 1,
              })}
            >
              <Ionicons name="play-skip-back" size={24} color={quiet} />
            </Pressable>
            <Pressable
              onPress={() => setPaused((p) => !p)}
              accessibilityRole="button"
              accessibilityLabel={paused ? tr('player.resume') : tr('player.pause')}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: t.gold,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={paused ? 'play' : 'pause'} size={28} color={t.onGold} />
            </Pressable>
            <Pressable
              onPress={() => setLine((l) => Math.min(prayer.script.length - 1, l + 1))}
              accessibilityRole="button"
              accessibilityLabel={tr('player.next')}
              style={({ pressed }) => ({
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: 'rgba(14,18,32,0.28)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.16)',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.65 : 1,
              })}
            >
              <Ionicons name="play-skip-forward" size={24} color={quiet} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
