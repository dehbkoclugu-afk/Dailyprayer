import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { useT } from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import {
  EXISTING_NON_PD_SCRIPTURE,
  GLOBAL_LANGUAGE_CATALOG,
  RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS,
  type GlobalLocaleTag,
} from '@/i18n/globalLanguageCatalog';
import { BUNDLED_SCRIPTURE_LOCALES, isBundledScriptureLocale, useScriptureLocale } from '@/i18n/scripture';
import { useUserStore } from '@/state/useUserStore';
import { useReaderStore } from '@/state/useReaderStore';
import {
  installBiblePack,
  listInstalledBiblePacks,
  loadInstalledBiblePack,
} from '@/services/biblePacks';
import { fetchBiblePackManifest, releaseMap } from '@/services/biblePackRegistry';
import { registerDownloadedBiblePack } from '@/data/bibleFull';
import type { BiblePackRelease } from '@/data/biblePack';

const candidates = new Set<string>(RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS);
const languages = GLOBAL_LANGUAGE_CATALOG.filter(
  (item) => candidates.has(item.tag) || item.tag === 'tr',
);

export default function ScriptureLanguage() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const effectiveScriptureLocale = useScriptureLocale();
  const scriptureLocale = useUserStore((s) => s.scriptureLocale);
  const setScriptureLocale = useUserStore((s) => s.setScriptureLocale);
  const [installed, setInstalled] = useState<Set<GlobalLocaleTag>>(
    () => new Set<GlobalLocaleTag>(BUNDLED_SCRIPTURE_LOCALES),
  );
  const [releases, setReleases] = useState<Map<GlobalLocaleTag, BiblePackRelease>>(new Map());
  const [downloading, setDownloading] = useState<GlobalLocaleTag | null>(null);

  const selected = effectiveScriptureLocale;

  useEffect(() => {
    let active = true;
    listInstalledBiblePacks()
      .then((tags) => {
        if (!active) return;
        setInstalled(new Set<GlobalLocaleTag>([...BUNDLED_SCRIPTURE_LOCALES, ...tags]));
      })
      .catch(() => {});

    fetchBiblePackManifest()
      .then((manifest) => {
        if (active) setReleases(releaseMap(manifest));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const choose = async (tag: GlobalLocaleTag) => {
    if (downloading) return;
    try {
      if (isBundledScriptureLocale(tag)) {
        if (selected === 'hr') useReaderStore.getState().setPos(0, 0);
        setScriptureLocale(tag);
        router.back();
        return;
      }

      let pack = installed.has(tag) ? await loadInstalledBiblePack(tag) : null;
      if (!pack) {
        const release = releases.get(tag);
        if (!release) {
          Alert.alert(tr('profile.scriptureLanguage'), tr('scripture.downloadUnavailable'));
          return;
        }
        setDownloading(tag);
        pack = await installBiblePack(release);
        setInstalled((current) => new Set<GlobalLocaleTag>([...current, tag]));
      }

      registerDownloadedBiblePack(pack);
      if (pack.canon === 'catholic-73' || selected === 'hr') {
        useReaderStore.getState().setPos(0, 0);
      }
      setScriptureLocale(tag);
      router.back();
    } catch {
      Alert.alert(tr('profile.scriptureLanguage'), tr('scripture.downloadUnavailable'));
    } finally {
      setDownloading(null);
    }
  };

  const autoSelected = scriptureLocale === 'system';
  const rows = useMemo(() => languages, []);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={tr('a11y.back')}
          hitSlop={10}
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={getDirectionalIconName('chevron-back', locale)} size={22} color={t.ink} />
        </Pressable>
        <Text style={{ flex: 1, fontFamily: fonts.serif, fontSize: 30, color: t.ink }}>
          {tr('profile.scriptureLanguage')}
        </Text>
      </View>

      <Pressable
        onPress={() => {
          if (selected === 'hr') useReaderStore.getState().setPos(0, 0);
          setScriptureLocale('system');
          router.back();
        }}
        style={{
          marginTop: spacing.xl,
          minHeight: 60,
          padding: spacing.lg,
          borderRadius: radius.inner,
          backgroundColor: autoSelected ? t.goldSoft : t.surface,
          borderWidth: 1,
          borderColor: autoSelected ? t.gold : t.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
        }}
      >
        <Ionicons name="phone-portrait-outline" size={20} color={autoSelected ? t.gold : t.inkSoft} />
        <Text style={{ flex: 1, fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink }}>
          {tr('profile.auto')}
        </Text>
        {autoSelected ? <Ionicons name="checkmark-circle" size={22} color={t.gold} /> : null}
      </Pressable>

      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        {rows.map((item) => {
          const tag = item.tag as GlobalLocaleTag;
          const active = selected === tag && !autoSelected;
          const ready = installed.has(tag);
          const release = releases.get(tag);
          const busy = downloading === tag;
          const edition = tag === 'tr' ? EXISTING_NON_PD_SCRIPTURE.edition : item.edition;

          return (
            <Pressable
              key={tag}
              onPress={() => choose(tag)}
              disabled={downloading !== null}
              accessibilityRole="button"
              accessibilityLabel={`${item.nativeName}, ${edition}`}
              style={({ pressed }) => ({
                minHeight: 72,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderRadius: radius.inner,
                backgroundColor: active ? t.goldSoft : t.surface,
                borderWidth: 1,
                borderColor: active ? t.gold : t.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                opacity: pressed ? 0.72 : 1,
              })}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink, textAlign: item.direction === 'rtl' ? 'right' : 'left', writingDirection: item.direction === 'rtl' ? 'rtl' : 'ltr' }}>
                  {item.nativeName}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{ fontFamily: fonts.sans, fontSize: 12, color: t.inkSoft, marginTop: 3, textAlign: item.direction === 'rtl' ? 'right' : 'left', writingDirection: item.direction === 'rtl' ? 'rtl' : 'ltr' }}
                >
                  {edition}
                </Text>
              </View>

              {busy ? (
                <ActivityIndicator color={t.gold} />
              ) : active ? (
                <Ionicons name="checkmark-circle" size={22} color={t.gold} />
              ) : ready ? (
                <Ionicons name="checkmark" size={21} color={t.inkSoft} />
              ) : release ? (
                <View style={{ alignItems: 'flex-end', gap: 2 }}>
                  <Ionicons name="cloud-download-outline" size={21} color={t.gold} />
                  <Text style={{ fontFamily: fonts.sans, fontSize: 10, color: t.inkFaint }}>
                    {(release.bytes / 1024 / 1024).toFixed(1)} MB
                  </Text>
                </View>
              ) : (
                <Ionicons name="cloud-offline-outline" size={20} color={t.inkFaint} />
              )}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
