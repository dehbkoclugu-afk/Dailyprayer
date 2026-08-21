import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, type GestureResponderEvent } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { ArtSlot } from '@/components/ArtSlot';
import { useArtwork } from '@/hooks/useArtwork';
import { useEntitlementStore } from '@/state/useEntitlementStore';
import { getScriptureAudioSource, resolveScriptureAudioChapterUrl } from '@/services/scriptureAudio';
import { type as ty } from '@/theme/typography';
import { elevation, interaction, radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';

const COPY: Record<string, { title: string; listen: string; pause: string; loading: string; retry: string; speed: string; back: string; forward: string; seek: string; included: string }> = {
  en: { title: 'Audio Bible', listen: 'Listen', pause: 'Pause', loading: 'Loading…', retry: 'Try again', speed: 'Speed', back: 'Back 15 seconds', forward: 'Forward 15 seconds', seek: 'Playback position', included: 'Included with Plus' },
  tr: { title: 'Sesli Kutsal Kitap', listen: 'Dinle', pause: 'Duraklat', loading: 'Yükleniyor…', retry: 'Tekrar dene', speed: 'Hız', back: '15 saniye geri', forward: '15 saniye ileri', seek: 'Oynatma konumu', included: 'Plus ile birlikte' },
  es: { title: 'Biblia en audio', listen: 'Escuchar', pause: 'Pausar', loading: 'Cargando…', retry: 'Reintentar', speed: 'Velocidad', back: 'Retroceder 15 segundos', forward: 'Avanzar 15 segundos', seek: 'Posición de reproducción', included: 'Incluido con Plus' },
  fr: { title: 'Bible audio', listen: 'Écouter', pause: 'Pause', loading: 'Chargement…', retry: 'Réessayer', speed: 'Vitesse', back: 'Reculer de 15 secondes', forward: 'Avancer de 15 secondes', seek: 'Position de lecture', included: 'Inclus avec Plus' },
  de: { title: 'Hörbibel', listen: 'Anhören', pause: 'Pause', loading: 'Laden…', retry: 'Erneut versuchen', speed: 'Tempo', back: '15 Sekunden zurück', forward: '15 Sekunden vor', seek: 'Wiedergabeposition', included: 'In Plus enthalten' },
  ja: { title: 'オーディオ聖書', listen: '聴く', pause: '一時停止', loading: '読み込み中…', retry: '再試行', speed: '速度', back: '15秒戻る', forward: '15秒進む', seek: '再生位置', included: 'Plusに含まれています' },
};

type AudioCopy = (typeof COPY)[string];
type Translator = ReturnType<typeof useT>['t'];

function audioCopy(locale: string, tr: Translator): AudioCopy {
  return COPY[locale] ?? {
    title: `${tr('bible.title')} · ♪`,
    listen: tr('today.play'),
    pause: tr('player.pause'),
    loading: '…',
    retry: tr('paywall.retry'),
    speed: tr('player.pace'),
    back: `${tr('player.previous')} · 15s`,
    forward: `${tr('player.next')} · 15s`,
    seek: tr('read.continue'),
    included: tr('profile.plusCta'),
  };
}

/** Keep speech intelligible while still offering useful pacing choices. */
const RATES = [0.85, 1, 1.15] as const;
const PITCH_CORRECTION_QUALITY = 'high' as const;
const SKIP_SECONDS = 15;

type PlayerPalette = {
  surface: string;
  border: string;
  ink: string;
  inkSoft: string;
  gold: string;
  goldSoft: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

export function ScriptureAudioBible({ edition, book, chapter, palette }: {
  edition: string;
  book: number;
  chapter: number;
  palette: PlayerPalette;
}) {
  const source = getScriptureAudioSource(edition);
  const { locale, t: tr } = useT();
  const artwork = useArtwork();
  const copy = audioCopy(locale, tr);
  const isPlus = useEntitlementStore((state) => state.isPlus);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!isPlus) setActivated(false);
  }, [isPlus]);

  if (!source) return null;

  if (!activated) {
    const action = copy.listen;
    return (
      <View style={{ marginTop: spacing.lg, borderRadius: radius.card, ...elevation.card }}>
        <ArtSlot id="A18-ritual-reading" height={120} radius={radius.card} scrim="readable">
          <Pressable
            onPress={() => {
              if (!isPlus) router.push('/paywall?from=bible-audio');
              else setActivated(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${copy.title}: ${action}`}
            style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, opacity: pressed ? interaction.pressedOpacity : 1 })}
          >
            <View style={{ width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: artwork.foreground.badge, borderWidth: 1, borderColor: artwork.foreground.tertiary }}>
              <Ionicons name={!isPlus ? 'lock-closed' : 'headset'} size={22} color={palette.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Text style={{ ...ty.bodyCompactStrong, color: artwork.foreground.primary }}>{copy.title}</Text>
                <View style={{ paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: palette.gold }}>
                  <Text style={{ ...ty.labelSmallBold, color: palette.surface }}>PLUS</Text>
                </View>
              </View>
              <Text numberOfLines={1} style={{ ...ty.captionRegular, color: artwork.foreground.secondary, marginTop: spacing.xs }}>{source.edition}</Text>
              <Text style={{ ...ty.labelSmallMedium, color: artwork.foreground.primary, marginTop: 2 }}>{isPlus ? action : copy.included}</Text>
            </View>
            <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: artwork.foreground.badge }}>
              <Ionicons name={!isPlus ? 'chevron-forward' : 'play'} size={19} color={palette.gold} />
            </View>
          </Pressable>
        </ArtSlot>
      </View>
    );
  }

  return <ActiveScriptureAudio edition={edition} book={book} chapter={chapter} palette={palette} />;
}

function ActiveScriptureAudio({ edition, book, chapter, palette }: {
  edition: string;
  book: number;
  chapter: number;
  palette: PlayerPalette;
}) {
  const source = getScriptureAudioSource(edition)!;
  const { locale, t: tr } = useT();
  const artwork = useArtwork();
  const copy = audioCopy(locale, tr);
  const player = useAudioPlayer(null, 500);
  const status = useAudioPlayerStatus(player);
  const [loadedFor, setLoadedFor] = useState('');
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [trackWidth, setTrackWidth] = useState(0);
  /** What the listener last asked for, so turning the page does not start audio they paused. */
  const wantsPlayback = useRef(true);
  const requestVersion = useRef(0);
  const key = `${edition}:${book}:${chapter}`;

  // The app declares the iOS background-audio capability; without this the session
  // never actually keeps playing once the screen locks.
  useEffect(() => {
    void setAudioModeAsync({ shouldPlayInBackground: true, playsInSilentMode: true }).catch(() => {});
  }, []);

  const load = useCallback(async (autoPlay: boolean) => {
    const request = ++requestVersion.current;
    setLoading(true);
    setFailed(false);
    try {
      const url = await resolveScriptureAudioChapterUrl(edition, book, chapter);
      if (request !== requestVersion.current) return false;
      player.replace(url);
      player.setPlaybackRate(rate, PITCH_CORRECTION_QUALITY);
      setLoadedFor(key);
      if (autoPlay) player.play();
      return true;
    } catch {
      if (request !== requestVersion.current) return false;
      setFailed(true);
      return false;
    } finally {
      if (request === requestVersion.current) setLoading(false);
    }
  }, [edition, book, chapter, key, player, rate]);

  // Follow the reader from chapter to chapter, but only keep sounding if the
  // listener had not paused. `load` is intentionally out of the dependency list:
  // it changes with `rate`, and re-running this would restart the chapter.
  useEffect(() => {
    void load(wantsPlayback.current);
    return () => {
      requestVersion.current += 1;
      player.pause();
    };
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
    if (loadedFor === key) player.setPlaybackRate(next, PITCH_CORRECTION_QUALITY);
  };

  const progress = status.duration > 0 ? Math.min(1, status.currentTime / status.duration) : 0;
  const action = failed ? copy.retry : loading || status.isBuffering ? copy.loading : status.playing ? copy.pause : copy.listen;

  const seekFromGesture = (event: GestureResponderEvent) => {
    if (trackWidth <= 0 || status.duration <= 0) return;
    const ratio = Math.min(1, Math.max(0, event.nativeEvent.locationX / trackWidth));
    void player.seekTo(ratio * status.duration);
  };

  const adjustPosition = (seconds: number) => {
    if (status.duration <= 0) return;
    void player.seekTo(Math.min(Math.max(0, status.currentTime + seconds), status.duration));
  };

  const seekDisabled = loading || status.duration <= 0;

  return (
    <View style={{ marginTop: spacing.lg, borderRadius: radius.card, ...elevation.card }}>
      <View style={{ borderRadius: radius.card, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, overflow: 'hidden' }}>
        <ArtSlot id="A18-ritual-reading" height={116} scrim="readable">
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: artwork.foreground.badge, borderWidth: 1, borderColor: artwork.foreground.tertiary }}>
              <Ionicons name="headset" size={24} color={palette.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...ty.bodyCompactStrong, color: artwork.foreground.primary }}>{copy.title}</Text>
              <Text numberOfLines={2} style={{ ...ty.captionRegular, color: artwork.foreground.secondary, marginTop: 3 }}>{source.edition}</Text>
            </View>
            <View style={{ minHeight: 30, maxWidth: 104, flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, borderRadius: radius.pill, backgroundColor: artwork.foreground.badge }}>
              {loading || status.isBuffering ? <ActivityIndicator size="small" color={palette.gold} /> : null}
              <Text numberOfLines={1} style={{ ...ty.labelSmallMedium, color: artwork.foreground.primary }}>{action}</Text>
            </View>
          </View>
        </ArtSlot>

        <View style={{ padding: spacing.xl }}>
          <View
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={copy.seek}
            accessibilityValue={{ min: 0, max: Math.max(0, Math.round(status.duration)), now: Math.max(0, Math.round(status.currentTime)), text: `${formatTime(status.currentTime)} / ${formatTime(status.duration)}` }}
            accessibilityActions={[{ name: 'decrement', label: copy.back }, { name: 'increment', label: copy.forward }]}
            onAccessibilityAction={(event) => adjustPosition(event.nativeEvent.actionName === 'increment' ? SKIP_SECONDS : -SKIP_SECONDS)}
            onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => status.duration > 0}
            onMoveShouldSetResponder={() => status.duration > 0}
            onResponderGrant={seekFromGesture}
            onResponderMove={seekFromGesture}
            style={{ height: 32, justifyContent: 'center' }}
          >
            <View style={{ height: 6, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: palette.border }}>
              <View style={{ height: '100%', width: `${progress * 100}%`, borderRadius: radius.pill, backgroundColor: palette.gold }} />
            </View>
            {status.duration > 0 ? (
              <View style={{ position: 'absolute', left: `${progress * 100}%`, marginLeft: -8, width: 16, height: 16, borderRadius: 8, backgroundColor: palette.gold, borderWidth: 3, borderColor: palette.surface }} />
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...ty.labelSmallRegular, color: palette.inkSoft, fontVariant: ['tabular-nums'] }}>{formatTime(status.currentTime)}</Text>
            <Text style={{ ...ty.labelSmallRegular, color: palette.inkSoft, fontVariant: ['tabular-nums'] }}>-{formatTime(Math.max(0, status.duration - status.currentTime))}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: spacing.lg }}>
            <Pressable
              onPress={() => void skip(-SKIP_SECONDS)}
              disabled={seekDisabled}
              accessibilityRole="button"
              accessibilityState={{ disabled: seekDisabled }}
              accessibilityLabel={copy.back}
              hitSlop={8}
              style={({ pressed }) => ({ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.goldSoft, opacity: seekDisabled ? interaction.disabledOpacity : pressed ? interaction.pressedOpacity : 1 })}
            >
              <Text style={{ ...ty.captionStrong, color: palette.gold, fontVariant: ['tabular-nums'] }}>−15</Text>
            </Pressable>
            <Pressable
              onPress={() => void toggle()}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={`${copy.title}: ${action}`}
              style={({ pressed }) => ({ width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.gold, opacity: loading ? interaction.disabledOpacity : pressed ? interaction.pressedOpacity : 1, ...elevation.card })}
            >
              {loading ? (
                <ActivityIndicator color={palette.surface} />
              ) : (
                <Ionicons name={status.playing ? 'pause' : failed ? 'refresh' : 'play'} size={30} color={palette.surface} style={status.playing || failed ? undefined : { marginLeft: 3 }} />
              )}
            </Pressable>
            <Pressable
              onPress={() => void skip(SKIP_SECONDS)}
              disabled={seekDisabled}
              accessibilityRole="button"
              accessibilityState={{ disabled: seekDisabled }}
              accessibilityLabel={copy.forward}
              hitSlop={8}
              style={({ pressed }) => ({ width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.goldSoft, opacity: seekDisabled ? interaction.disabledOpacity : pressed ? interaction.pressedOpacity : 1 })}
            >
              <Text style={{ ...ty.captionStrong, color: palette.gold, fontVariant: ['tabular-nums'] }}>+15</Text>
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: palette.border }}>
            <Text style={{ ...ty.captionStrong, color: palette.inkSoft, marginBottom: spacing.sm }}>{copy.speed}</Text>
            <View style={{ flexDirection: 'row', padding: 4, borderRadius: radius.inner, backgroundColor: palette.goldSoft }}>
              {RATES.map((option) => (
                <Pressable
                  key={option}
                  onPress={() => changeRate(option)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: rate === option }}
                  accessibilityLabel={`${copy.speed}: ${option}×`}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 42,
                    borderRadius: radius.inner - 4,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: rate === option ? palette.surface : 'transparent',
                    borderWidth: rate === option ? 1 : 0,
                    borderColor: palette.border,
                    opacity: pressed ? interaction.pressedOpacity : 1,
                  })}
                >
                  <Text style={{ ...ty.captionStrong, color: rate === option ? palette.gold : palette.inkSoft }}>{option}×</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
