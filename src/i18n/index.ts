import { getLocales } from 'expo-localization';
import { translations, type Locale, type TranslationKey } from './translations';
import { useUserStore } from '@/state/useUserStore';
import { localeUpper } from '@/lib/text';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'tr', 'es', 'pt', 'fr', 'de'];

export function resolveLocale(pref: Locale | 'system'): Locale {
  if (pref !== 'system') return pref;
  try {
    const device = getLocales()[0]?.languageCode ?? 'en';
    return (SUPPORTED_LOCALES as string[]).includes(device) ? (device as Locale) : 'en';
  } catch {
    return 'en';
  }
}

function lookup(locale: Locale, key: TranslationKey): string {
  const dict = translations[locale] as Record<string, string>;
  return dict[key] ?? translations.en[key];
}

/**
 * Count-aware lookup. A counted noun next to "1" was wrong in four places —
 * "1 resultados", "1 días", "1 min restantes" — because the label was always the
 * plural. Where a `<key>.one` entry exists it is used for exactly one.
 *
 * Deliberately only two forms: the six languages here all inflect on 1 vs. more,
 * and a full CLDR plural-category system would be machinery for a rule none of
 * them needs.
 */
function lookupCount(locale: Locale, key: TranslationKey, count: number): string {
  if (count !== 1) return lookup(locale, key);
  const singular = `${key}.one` as TranslationKey;
  return singular in translations.en ? lookup(locale, singular) : lookup(locale, key);
}

/** Reactive translator for components. */
export function useT() {
  const pref = useUserStore((s) => s.language);
  const locale = resolveLocale(pref);
  return {
    locale,
    t: (key: TranslationKey) => lookup(locale, key),
    /** For a label that follows a number: `tn(days, 'bible.days')`. */
    tn: (count: number, key: TranslationKey) => lookupCount(locale, key, count),
    /** For text a style renders in caps: `up(tr('today.sleepPrayer'))`. */
    up: (text: string) => localeUpper(text, locale),
  };
}

/** Non-reactive translator for call sites outside React (toasts, services). */
export function translate(key: TranslationKey): string {
  return lookup(resolveLocale(useUserStore.getState().language), key);
}
