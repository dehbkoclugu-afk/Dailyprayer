import { getLocales } from 'expo-localization';
import type { Locale } from '@/i18n/translations';
import { resolveGlobalLocale, type GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import { useUserStore } from '@/state/useUserStore';

/**
 * Only editions whose exact bundled revision has release-ready rights evidence.
 * Portuguese and French stay available through the checksum-pinned pack catalog:
 * World Portuguese Bible and Louis Segond 1910 replace the archived, ambiguous
 * Almeida/Ostervald bundle sources without modifying either Scripture file.
 */
export const BUNDLED_SCRIPTURE_LOCALES = ['en', 'tr', 'es', 'de'] as const satisfies readonly Locale[];

export function isBundledScriptureLocale(value: string): value is Locale {
  return (BUNDLED_SCRIPTURE_LOCALES as readonly string[]).includes(value);
}

export function resolveSystemScriptureLocale(): GlobalLocaleTag {
  try {
    const device = getLocales()[0];
    return resolveGlobalLocale(device?.languageTag, device?.languageCode);
  } catch {
    return 'en';
  }
}

/** Scripture choice is independent from UI choice; system follows the device locale. */
export function useScriptureLocale(): GlobalLocaleTag {
  const preference = useUserStore((state) => state.scriptureLocale);
  if (preference !== 'system') return preference;
  return resolveSystemScriptureLocale();
}
