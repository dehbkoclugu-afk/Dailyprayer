import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, { FadeInUp, FadeOut, useReducedMotion } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PillButton } from '@/components/PillButton';
import { ArtSlot } from '@/components/ArtSlot';
import { useTheme } from '@/hooks/useTheme';
import { type as ty } from '@/theme/typography';
import { interaction, spacing } from '@/theme/tokens';
import { prayerArt } from '@/assets/registry';
import { usePrayers } from '@/data/prayers';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { translate, useT } from '@/i18n';
import { useScreenReaderEnabled } from '@/hooks/useScreenReaderEnabled';
import { shouldAutoAdvancePrayer } from '@/lib/accessibility';
import { prayerSection } from '@/lib/dailyExperience';
import { isShortLayout } from '@/lib/adaptiveLayout';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { InvalidRouteState } from '@/components/InvalidRouteState';

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
  const { height, fontScale } = useWindowDimensions();
  const short = isShortLayout(height, fontScale);
  const reduceMotion = useReducedMotion();
  const screenReaderEnabled = useScreenReaderEnabled();
  const { id } = useLocalSearchParams<{ id: string }>();
  const prayers = usePrayers();
  const prayer = prayers.find((p) => p.id === id);
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const [line, setLine] = useState(0);
  const [paused, setPaused] = useState(false);
  const [pace, setPace] = useState<Pace>('normal');
  const completeStep = useStreakStore((s) => s.completeStep);
  const blocked = Boolean(prayer?.plus && !isPlus);
  const safePrayer = prayer ?? prayers[0];
  const lastLine = line >= safePrayer.script.length - 1;
  const progress = (line + 1) / safePrayer.script.length;
  const activeSection = prayerSection(line, safePrayer.script.length);
  const remainingMinutes = Math.max(
    1,
    Math.ceil(
      safePrayer.script.slice(line + 1).reduce((sum, item) => sum + item.length, 0) *
        PACE_FACTOR[pace] /
        60000,
    ),
  );

  useEffect(() => {
    if (!prayer || blocked) return;
    AsyncStorage.getItem(`lumen-player-${prayer.id}`)
      .then((saved) => {
        const parsed = Number(saved);
        if (Number.isInteger(parsed) && parsed >= 0 && parsed < prayer.script.length) setLine(parsed);
      })
      .catch(() => {});
  }, [blocked, prayer]);

  useEffect(() => {
    if (!prayer || blocked) return;
    AsyncStorage.setItem(`lumen-player-${prayer.id}`, String(line)).catch(() => {});
    if (screenReaderEnabled) AccessibilityInfo.announceForAccessibility(prayer.script[line]);
  }, [blocked, line, prayer, screenReaderEnabled]);

  useEffect(() => {
    if (screenReaderEnabled) setPaused(true);
  }, [screenReaderEnabled]);

  useEffect(() => {
    if (!shouldAutoAdvancePrayer(paused, lastLine, screenReaderEnabled)) return;
    if (!prayer || blocked) return;
    const ms = Math.max(4000, prayer.script[line].length * PACE_FACTOR[pace]);
    const timer = setTimeout(() => setLine((l) => l + 1), ms);
    return () => clearTimeout(timer);
  }, [blocked, line, pace, paused, lastLine, prayer, screenReaderEnabled]);

  useEffect(() => {
    if (blocked) router.replace('/paywall?from=prayer');
  }, [blocked]);

  if (!prayer) return <InvalidRouteState />;
  if (blocked) return null;

  const finish = () => {
    completeStep('prayer');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    AsyncStorage.removeItem(`lumen-player-${prayer.id}`).catch(() => {});
    toast(translate('toast.prayer'));
    router.back();
  };

  const foreground = t.onArtwork;
  const muted = t.onArtworkMuted;
  const quiet = t.onArtworkMuted;
  const textShadow = {
    textShadowColor: 'rgba(0,0,0,0.82)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 9,
  } as const;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar style="light" />
      <ArtSlot
        id={prayerArt(prayer.id)}
        fit="cover"
        scrim="none"
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: spacing.xl,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[ty.bodyCompactMedium, { color: foreground, ...textShadow }]}>
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
              opacity: pressed ? interaction.pressedOpacity : 1,
            })}
          >
            <Ionicons name="close" size={24} color={foreground} />
          </Pressable>
        </View>

        <View style={{ flexGrow: 1, minHeight: short ? 150 : 260, justifyContent: 'center', paddingHorizontal: spacing.sm, paddingVertical: short ? spacing.lg : spacing.xl }}>
          {line > 0 && !short ? (
            <Text
              accessible={false}
              numberOfLines={2}
              style={{
                ...ty.editorialSecondary,
                color: 'rgba(255,255,255,0.48)',
                textAlign: 'center',
                marginBottom: spacing.xl,
                ...textShadow,
              }}
            >
              {prayer.script[line - 1]}
            </Text>
          ) : null}
          {/* each line rises gently into place , the "breath" feel */}
          <Animated.Text
            key={line}
            entering={reduceMotion ? undefined : FadeInUp.duration(600)}
            exiting={reduceMotion ? undefined : FadeOut.duration(250)}
            style={{
              ...ty.playerVerse,
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
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={tr('player.guidedText')}
          accessibilityValue={{ min: 1, max: 3, now: activeSection + 1 }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md }}
        >
          {[0, 1, 2].map((section) => (
            <View key={section} style={{ alignItems: 'center', gap: 4 }}>
              <View style={{ width: section === activeSection ? 28 : 18, height: 4, borderRadius: 2, backgroundColor: section <= activeSection ? t.gold : 'rgba(255,255,255,0.28)' }} />
              <Text style={{ ...ty.labelSmallRegular, color: section === activeSection ? foreground : quiet, ...textShadow }}>
                {section + 1}/3
              </Text>
            </View>
          ))}
        </View>
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{ ...ty.labelSmall, color: muted, textAlign: 'center', marginBottom: spacing.sm, ...textShadow }}>
            {tr('player.pace')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignSelf: 'center', padding: 3, borderRadius: 999, backgroundColor: 'rgba(14,18,32,0.46)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' }}>
            {(['slow', 'normal', 'quick'] as const).map((option) => {
              const selected = option === pace;
              return (
                <Pressable
                  key={option}
                  onPress={() => setPace(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${tr('player.pace')}: ${tr(`player.pace.${option}` as never)}`}
                  style={({ pressed }) => ({
                    minHeight: 48,
                    minWidth: 82,
                    paddingHorizontal: spacing.md,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: selected ? t.gold : 'transparent',
                    opacity: pressed ? interaction.pressedOpacity : 1,
                  })}
                >
                  <Text style={{ ...ty.labelMedium, color: selected ? t.onGold : muted, ...(selected ? {} : textShadow) }}>
                    {tr(`player.pace.${option}` as never)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
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
                opacity: line === 0 ? interaction.disabledOpacity : pressed ? interaction.pressedOpacity : 1,
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
                opacity: pressed ? interaction.pressedOpacity : 1,
              })}
            >
              <Ionicons name="play-skip-forward" size={24} color={quiet} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
