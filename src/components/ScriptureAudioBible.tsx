import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { getScriptureAudioSource, resolveScriptureAudioChapterUrl } from '@/services/scriptureAudio';
import { type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';

const COPY: Record<string, { title: string; listen: string; pause: string; loading: string; retry: string; speed: string; back: string; forward: string }> = {
  en: { title: 'Audio Bible', listen: 'Listen', pause: 'Pause', loading: 'Loading…', retry: 'Try again', speed: 'Speed', back: 'Back 15 seconds', forward: 'Forward 15 seconds' },
  tr: { title: 'Sesli Kutsal Kitap', listen: 'Dinle', pause: 'Duraklat', loading: 'Yükleniyor…', retry: 'Tekrar dene', speed: 'Hız', back: '15 saniye geri', forward: '15 saniye ileri' },
  es: { title: 'Biblia en audio', listen: 'Escuchar', pause: 'Pausar', loading: 'Cargando…', retry: 'Reintentar', speed: 'Velocidad', back: 'Retroceder 15 segundos', forward: 'Avanzar 15 segundos' },
  fr: { title: 'Bible audio', listen: 'Écouter', pause: 'Pause', loading: 'Chargement…', retry: 'Réessayer', speed: 'Vitesse', back: 'Reculer de 15 secondes', forward: 'Avancer de 15 secondes' },
  de: { title: 'Hörbibel', listen: 'Anhören', pause: 'Pause', loading: 'Laden…', retry: 'Erneut versuchen', speed: 'Tempo', back: '15 Sekunden zurück', forward: '15 Sekunden vor' },
  ja: { title: 'オーディオ聖書', listen: '聴く', pause: '一時停止', loading: '読み込み中…', retry: '再試行', speed: '速度', back: '15秒戻る', forward: '15秒進む' },
};

/** Recordings differ wildly in pace; a slower rate is the only pacing control we can offer. */
const RATES = [0.75, 1, 1.25] as const;
const SKIP_SECONDS = 15;

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
  const [activated, setActivated] = useState(false);

  if (!source) return null;

  if (!activated) {
    const action = copy.listen;
    return (
      <View style={{ marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.inner, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
        <Pressable
          onPress={() => {
            if (!isPlus) router.push('/paywall?from=bible-audio');
            else setActivated(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`${copy.title}: ${action}`}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: pressed ? 0.65 : 1 })}
        >
          <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.goldSoft }}>
            <Ionicons name={!isPlus ? 'lock-closed' : 'play'} size={19} color={palette.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ ...ty.bodyCompactStrong, color: palette.ink }}>{copy.title} · PLUS</Text>
            <Text style={{ ...ty.captionRegular, color: palette.inkSoft, marginTop: 2 }}>{action} · {source.edition}</Text>
          </View>
          <Ionicons name={!isPlus ? 'chevron-forward' : 'play-circle-outline'} size={24} color={palette.gold} />
        </Pressable>
      </View>
    );
  }

  return <ActiveScriptureAudio edition={edition} book={book} chapter={chapter} palette={palette} />;
}

function ActiveScriptureAudio({ edition, book, chapter, palette }: {
  edition: string;
  book: number;
  chapter: number;
  palette: { surface: string; border: string; ink: string; inkSoft: string; gold: string; goldSoft: string };
}) {
  const source = getScriptureAudioSource(edition)!;
  const { locale } = useT();
  const copy = COPY[locale] ?? COPY.en;
  const player = useAudioPlayer(null, 500);
  const status = useAudioPlayerStatus(player);
  const [loadedFor, setLoadedFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [rate, setRate] = useState<number>(1);
  /** What the listener last asked for, so turning the page does not start audio they paused. */
  const wantsPlayback = useRef(true);
  const key = `${edition}:${book}:${chapter}`;

  // The app declares the iOS background-audio capability; without this the session
  // never actually keeps playing once the screen locks.
  useEffect(() => {
    void setAudioModeAsync({ shouldPlayInBackground: true, playsInSilentMode: true }).catch(() => {});
  }, []);

  const load = useCallback(async (autoPlay: boolean) => {
    setLoading(true);
    setFailed(false);
    try {
      const url = await resolveScriptureAudioChapterUrl(edition, book, chapter);
      player.replace(url);
      player.setPlaybackRate(rate);
      setLoadedFor(key);
      if (autoPlay) player.play();
      return true;
    } catch {
      setFailed(true);
      return false;
    } finally {
      setLoading(false);
    }
  }, [edition, book, chapter, key, player, rate]);

  // Follow the reader from chapter to chapter, but only keep sounding if the
  // listener had not paused. `load` is intentionally out of the dependency list:
  // it changes with `rate`, and re-running this would restart the chapter.
  useEffect(() => {
    void load(wantsPlayback.current);
    return () => player.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edition, book, chapter, key, player]);

  const toggle = async () => {
    if (status.playing) {
      wantsPlayback.current = false;
      player.pause();
      return;
    }
    wantsPlayback.current = true;
    if (loadedFor === key && !failed) {
      if (status.didJustFinish) await player.seekTo(0);
      player.play();
      return;
    }
    await load(true);
  };

  const skip = async (seconds: number) => {
    if (loadedFor !== key || status.duration <= 0) return;
    const target = Math.min(Math.max(0, status.currentTime + seconds), status.duration);
    await player.seekTo(target);
  };

  const changeRate = (next: number) => {
    setRate(next);
    if (loadedFor === key) player.setPlaybackRate(next);
  };

  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  const action = failed ? copy.retry : loading || status.isBuffering ? copy.loading : status.playing ? copy.pause : copy.listen;

  return (
    <View style={{ marginTop: spacing.lg, padding: spacing.md, borderRadius: radius.inner, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border }}>
      <Pressable onPress={() => void toggle()} disabled={loading} accessibilityRole="button" accessibilityLabel={`${copy.title}: ${action}`} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: pressed ? 0.65 : 1 })}>
        <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.goldSoft }}>
          <Ionicons name={status.playing ? 'pause' : 'play'} size={19} color={palette.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ ...ty.bodyCompactStrong, color: palette.ink }}>{copy.title} · PLUS</Text>
          <Text style={{ ...ty.captionRegular, color: palette.inkSoft, marginTop: 2 }}>{action} · {source.edition}</Text>
        </View>
        <Ionicons name={status.playing ? 'pause-circle-outline' : 'play-circle-outline'} size={24} color={palette.gold} />
      </Pressable>
      {loadedFor === key ? <View style={{ height: 3, borderRadius: 2, overflow: 'hidden', backgroundColor: palette.border, marginTop: spacing.sm }}><View style={{ height: '100%', width: `${progress * 100}%`, backgroundColor: palette.gold }} /></View> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md }}>
        <Pressable
          onPress={() => void skip(-SKIP_SECONDS)}
          accessibilityRole="button"
          accessibilityLabel={copy.back}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: spacing.xs })}
        >
          <Ionicons name="play-back" size={18} color={palette.inkSoft} />
        </Pressable>
        <Pressable
          onPress={() => void skip(SKIP_SECONDS)}
          accessibilityRole="button"
          accessibilityLabel={copy.forward}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: spacing.xs })}
        >
          <Ionicons name="play-forward" size={18} color={palette.inkSoft} />
        </Pressable>
        <Text style={{ ...ty.captionRegular, color: palette.inkSoft, marginLeft: spacing.sm }}>{copy.speed}</Text>
        {RATES.map((option) => (
          <Pressable
            key={option}
            onPress={() => changeRate(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: rate === option }}
            accessibilityLabel={`${copy.speed}: ${option}×`}
            hitSlop={8}
            style={({ pressed }) => ({
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: radius.inner,
              backgroundColor: rate === option ? palette.goldSoft : 'transparent',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={{ ...ty.captionRegular, color: rate === option ? palette.gold : palette.inkSoft }}>{option}×</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
