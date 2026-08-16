import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { getScriptureAudioSource, resolveScriptureAudioChapterUrl } from '@/services/scriptureAudio';
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';

const COPY: Record<string, { title: string; listen: string; pause: string; loading: string; retry: string }> = {
  en: { title: 'Audio Bible', listen: 'Listen', pause: 'Pause', loading: 'Loading…', retry: 'Try again' },
  tr: { title: 'Sesli Kutsal Kitap', listen: 'Dinle', pause: 'Duraklat', loading: 'Yükleniyor…', retry: 'Tekrar dene' },
  es: { title: 'Biblia en audio', listen: 'Escuchar', pause: 'Pausar', loading: 'Cargando…', retry: 'Reintentar' },
  fr: { title: 'Bible audio', listen: 'Écouter', pause: 'Pause', loading: 'Chargement…', retry: 'Réessayer' },
  de: { title: 'Hörbibel', listen: 'Anhören', pause: 'Pause', loading: 'Laden…', retry: 'Erneut versuchen' },
  ja: { title: 'オーディオ聖書', listen: '聴く', pause: '一時停止', loading: '読み込み中…', retry: '再試行' },
};

export function ScriptureAudioBible({ edition, book, chapter, palette }: {
  edition: string;
  book: number;
  chapter: number;
  palette: { surface: string; border: string; ink: string; inkSoft: string; gold: string; goldSoft: string };
}) {
  const source = getScriptureAudioSource(edition);
  const { locale } = useT();
  const copy = COPY[locale] ?? COPY.en;
  const isPlus = useEntitlementStore((state) => state.isPlus);
  const player = useAudioPlayer(null, 500);
  const status = useAudioPlayerStatus(player);
  const [loadedFor, setLoadedFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const key = `${edition}:${book}:${chapter}`;

  useEffect(() => {
    player.pause();
    player.replace(null);
    setLoadedFor('');
    setFailed(false);
  }, [edition, book, chapter, player]);

  if (!source) return null;

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
      const url = await resolveScriptureAudioChapterUrl(edition, book, chapter);
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
  const action = failed ? copy.retry : loading || status.isBuffering ? copy.loading : status.playing ? copy.pause : copy.listen;

  return (
    <View style={{ marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.inner, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
      <Pressable onPress={() => void toggle()} disabled={loading} accessibilityRole="button" accessibilityLabel={`${copy.title}: ${action}`} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: pressed ? 0.65 : 1 })}>
        <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.goldSoft }}>
          <Ionicons name={!isPlus ? 'lock-closed' : status.playing ? 'pause' : 'play'} size={19} color={palette.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...ty.bodyCompactStrong, color: palette.ink }}>{copy.title} · PLUS</Text>
          <Text style={{ ...ty.captionRegular, color: palette.inkSoft, marginTop: 2 }}>{action} · {source.edition} · {source.rights}</Text>
        </View>
        <Ionicons name={!isPlus ? 'chevron-forward' : status.playing ? 'pause-circle-outline' : 'play-circle-outline'} size={24} color={palette.gold} />
      </Pressable>
      {loadedFor === key ? <View style={{ height: 3, borderRadius: 2, overflow: 'hidden', backgroundColor: palette.border, marginTop: spacing.sm }}><View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: palette.gold }} /></View> : null}
    </View>
  );
}
