import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { fonts } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import {
  APPLICATION_LOCALES,
  resolveLocale,
  resolveRequestedApplicationLocale,
  useT,
} from '@/i18n';
import { getDirectionalIconName } from '@/i18n/direction';
import type { AppDirection, AppLocale } from '@/i18n/applicationLocales';
import {
  activateApplicationLocale,
  BUNDLED_APPLICATION_CONTENT_LOCALES,
} from '@/i18n/applicationLanguageActivation';
import { registerApplicationContentPack } from '@/i18n/applicationContent';
import { useUserStore } from '@/state/useUserStore';
import {
  installApplicationContentPack,
  listInstalledApplicationContentPacks,
  loadInstalledApplicationContentPack,
} from '@/services/applicationContentPacks';
import {
  applicationContentReleaseMap,
  fetchApplicationContentManifest,
} from '@/services/applicationContentRegistry';
import type {
  ApplicationContentLocale,
  ApplicationContentRelease,
} from '@/data/applicationContentPack';

const bundled = new Set<ApplicationContentLocale>(BUNDLED_APPLICATION_CONTENT_LOCALES);
const hasDownloadableLocale = APPLICATION_LOCALES.some(
  (locale) => !bundled.has(locale.tag as ApplicationContentLocale),
);

export default function ApplicationLanguage() {
  const t = useTheme();
  const { t: tr, locale } = useT();
  const language = useUserStore((state) => state.language);
  const setLanguage = useUserStore((state) => state.setLanguage);
  const selected = resolveLocale(language);
  const [installed, setInstalled] = useState<Set<ApplicationContentLocale>>(
    () => new Set(BUNDLED_APPLICATION_CONTENT_LOCALES),
  );
  const [releases, setReleases] = useState<
    Map<ApplicationContentLocale, ApplicationContentRelease>
  >(new Map());
  const [downloading, setDownloading] = useState<AppLocale | null>(null);

  useEffect(() => {
    if (!hasDownloadableLocale) return;
    let active = true;
    listInstalledApplicationContentPacks()
      .then((locales) => {
        if (active) setInstalled(new Set([...BUNDLED_APPLICATION_CONTENT_LOCALES, ...locales]));
      })
      .catch(() => {});
    fetchApplicationContentManifest()
      .then((manifest) => {
        if (active) setReleases(applicationContentReleaseMap(manifest));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const choose = async (tag: AppLocale, preference: AppLocale | 'system' = tag) => {
    if (downloading) return;
    const locale = tag;
    try {
      if (!bundled.has(locale)) setDownloading(tag);
      await activateApplicationLocale(locale, {
        loadInstalled: loadInstalledApplicationContentPack,
        getRelease: (requested) => releases.get(requested) ?? null,
        install: async (release) => {
          const pack = await installApplicationContentPack(release);
          setInstalled((current) => new Set([...current, release.locale]));
          return pack;
        },
        register: registerApplicationContentPack,
        setLanguage: () => setLanguage(preference),
      });
      router.back();
    } catch {
      Alert.alert(tr('profile.language'), tr('scripture.downloadUnavailable'));
    } finally {
      setDownloading(null);
    }
  };

  const autoSelected = language === 'system';

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
          {tr('profile.language')}
        </Text>
      </View>

      <Pressable
        onPress={() => choose(resolveRequestedApplicationLocale('system'), 'system')}
        disabled={downloading !== null}
        accessibilityRole="button"
        accessibilityState={{ selected: autoSelected }}
        style={({ pressed }) => ({
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
          opacity: pressed ? 0.72 : 1,
        })}
      >
        <Ionicons name="phone-portrait-outline" size={20} color={autoSelected ? t.gold : t.inkSoft} />
        <Text style={{ flex: 1, fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink }}>
          {tr('profile.auto')}
        </Text>
        {autoSelected ? <Ionicons name="checkmark-circle" size={22} color={t.gold} /> : null}
      </Pressable>

      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        {APPLICATION_LOCALES.map((item) => {
          const locale = item.tag as ApplicationContentLocale;
          const direction = item.direction as AppDirection;
          const active = selected === item.tag && !autoSelected;
          const ready = installed.has(locale);
          const release = releases.get(locale);
          const busy = downloading === item.tag;
          return (
            <Pressable
              key={item.tag}
              onPress={() => choose(item.tag)}
              disabled={downloading !== null}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.nativeName}
              style={({ pressed }) => ({
                minHeight: 60,
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
              <Text
                style={{
                  flex: 1,
                  fontFamily: fonts.sansSemiBold,
                  fontSize: 16,
                  color: t.ink,
                  textAlign: direction === 'rtl' ? 'right' : 'left',
                  writingDirection: direction,
                }}
              >
                {item.nativeName}
              </Text>
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
