import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { resolveWebAudioChapterUrl } from '@/services/webAudioBible';
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';

export function EnglishAudioBible({ book, chapter, palette }: {
  book: number;
  chapter: number;
  palette: { surface: string; border: string; ink: string; inkSoft: string; gold: string; goldSoft: string };
}) {
  const { locale } = useT();
  const turkish = locale === 'tr';
  const isPlus = useEntitlementStore((state) => state.isPlus);
  const player = useAudioPlayer(null, 500);
  const status = useAudioPlayerStatus(player);
  const [loadedFor, setLoadedFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const key = `${book}:${chapter}`;

  useEffect(() => {
    player.pause();
    player.replace(null);
    setLoadedFor('');
    setFailed(false);
  }, [book, chapter, player]);

  const toggle = async () => {
    if (!isPlus) {
      router.push('/paywall?from=bible-audio');
      return;
    }
    if (status.playing) {
      player.pause();
      return;
    }
    if (loadedFor === key) {
      if (status.didJustFinish) await player.seekTo(0);
      player.play();
      return;
    }
    setLoading(true);
    setFailed(false);
    try {
      const url = await resolveWebAudioChapterUrl(book, chapter);
      player.replace(url);
      setLoadedFor(key);
      player.play();
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  const action = failed
    ? (turkish ? 'Tekrar dene' : 'Try again')
    : loading || status.isBuffering
      ? (turkish ? 'Yükleniyor…' : 'Loading…')
      : status.playing
        ? (turkish ? 'Duraklat' : 'Pause')
        : (turkish ? 'Dinle' : 'Listen');

  return (
    <View style={{ marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.inner, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
      <Pressable
        onPress={() => void toggle()}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={`${turkish ? 'İngilizce sesli İncil' : 'English Audio Bible'}: ${action}`}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: pressed ? 0.65 : 1 })}
      >
        <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.goldSoft }}>
          <Ionicons name={!isPlus ? 'lock-closed' : status.playing ? 'pause' : 'play'} size={19} color={palette.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...ty.bodyCompactStrong, color: palette.ink }}>
            {turkish ? 'İngilizce sesli İncil' : 'English Audio Bible'} · PLUS
          </Text>
          <Text style={{ ...ty.captionRegular, color: palette.inkSoft, marginTop: 2 }}>
            {action} · WEB · Public Domain · Winfred W. Henson
          </Text>
        </View>
        <Ionicons name={!isPlus ? 'chevron-forward' : status.playing ? 'pause-circle-outline' : 'play-circle-outline'} size={24} color={palette.gold} />
      </Pressable>
      {loadedFor === key ? (
        <View style={{ height: 3, borderRadius: 2, overflow: 'hidden', backgroundColor: palette.border, marginTop: spacing.sm }}>
          <View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: palette.gold }} />
        </View>
      ) : null}
    </View>
  );
}
