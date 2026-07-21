import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PillButton } from '@/components/PillButton';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/tokens';
import { usePrayers } from '@/data/prayers';
import { useStreakStore } from '@/state/useStreakStore';
import { toast } from '@/state/useToastStore';
import { translate, useT } from '@/i18n';

/**
 * Guided prayer player — paced text lines with a breathing pause between them.
 * Audio narration slots in here later (expo-audio) without changing the flow.
 */
export default function Player() {
  const t = useTheme();
  const { t: tr } = useT();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const prayers = usePrayers();
  const prayer = prayers.find((p) => p.id === id) ?? prayers[0];
  const [line, setLine] = useState(0);
  const [paused, setPaused] = useState(false);
  const completeStep = useStreakStore((s) => s.completeStep);
  const lastLine = line >= prayer.script.length - 1;

  useEffect(() => {
    if (paused || lastLine) return;
    const ms = Math.max(5000, prayer.script[line].length * 90);
    const timer = setTimeout(() => setLine((l) => l + 1), ms);
    return () => clearTimeout(timer);
  }, [line, paused, lastLine, prayer.script]);

  const finish = () => {
    completeStep('prayer');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
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
          <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 15, color: '#F2EEE6' }}>
            {prayer.title}
          </Text>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={tr('a11y.closePlayer')}
            // Visible bordered chip — the only way out of the player must never
            // become an invisible corner if the close glyph fails to render.
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(14,18,32,0.7)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
            }}
          >
            <Ionicons name="close" size={22} color="#F2EEE6" />
          </Pressable>
        </View>

        <View style={{ flex: 1, justifyContent: 'center' }}>
          {/* each line rises gently into place — the "breath" feel */}
          <Animated.Text
            key={line}
            entering={FadeInUp.duration(600)}
            exiting={FadeOut.duration(250)}
            style={{
              fontFamily: 'Fraunces_400Regular',
              fontSize: 26,
              lineHeight: 38,
              color: '#F2EEE6',
              textAlign: 'center',
            }}
          >
            {prayer.script[line]}
          </Animated.Text>
        </View>

        {/* progress dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: spacing.xl }}>
          {prayer.script.map((_, i) => (
            <View
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i <= line ? '#D9A441' : 'rgba(242,238,230,0.2)',
              }}
            />
          ))}
        </View>

        {lastLine ? (
          <PillButton label={translate('devotional.amen')} onPress={finish} />
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl }}>
            <Pressable
              onPress={() => setLine((l) => Math.max(0, l - 1))}
              accessibilityRole="button"
              accessibilityLabel={tr('a11y.prevLine')}
              style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="play-skip-back" size={24} color="#A9A698" />
            </Pressable>
            <Pressable
              onPress={() => setPaused((p) => !p)}
              accessibilityRole="button"
              accessibilityLabel={paused ? 'Resume' : 'Pause'}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#D9A441',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={paused ? 'play' : 'pause'} size={28} color="#1A1206" />
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
