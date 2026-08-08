import { getLocales } from 'expo-localization';
import type { Locale } from '@/i18n/translations';
import { resolveGlobalLocale, type GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import { useUserStore } from '@/state/useUserStore';

export const BUNDLED_SCRIPTURE_LOCALES = ['en', 'tr', 'es', 'pt', 'fr', 'de'] as const satisfies readonly Locale[];

export function isBundledScriptureLocale(value: string): value is Locale {
  return (BUNDLED_SCRIPTURE_LOCALES as readonly string[]).includes(value);
}

/** Scripture choice is independent from UI choice; system follows the device locale. */
export function useScriptureLocale(): GlobalLocaleTag {
  const preference = useUserStore((state) => state.scriptureLocale);
  if (preference !== 'system') return preference;
  try {
    const device = getLocales()[0];
    return resolveGlobalLocale(device?.languageTag, device?.languageCode);
  } catch {
    return 'en';
  }
}
