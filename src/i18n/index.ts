import { getLocales } from 'expo-localization';
import { translations, type Locale, type TranslationKey } from './translations';
import { upper } from './casing';
import { useUserStore } from '@/state/useUserStore';

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

/**
 * Fill `{name}` placeholders in a translated string (roadmap items 34 and 35).
 *
 * Labels used to be assembled at the call site — `${count} ${tr('today.dayStreak')}`
 * — which hard-codes English word order into every language. Turkish puts the
 * counted noun and the verb somewhere else entirely: "3 of 4 completed today"
 * is "bugün 4 adımın 3'ü tamamlandı", where the numbers swap places and the
 * verb moves to the end. No amount of concatenating translated fragments
 * produces that; the whole sentence has to be one translatable string with the
 * values marked in it.
 *
 * A missing placeholder is left as written rather than blanked, so the gap is
 * visible in the label instead of silently changing what the sentence says.
 */
function fill(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (whole, name) =>
    name in params ? String(params[name]) : whole,
  );
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
    /**
     * Uppercase in the reader's language (roadmap item 33). Takes text rather
     * than a key so a date, a verse reference or a book name goes through the
     * same rules as a translated label.
     */
    tu: (text: string) => upper(text, locale),
    /** A whole sentence with values in it: `tf('a11y.verseOfDay', { ref })`. */
    tf: (key: TranslationKey, params: Record<string, string | number>) =>
      fill(lookup(locale, key), params),
    /** Both at once, for a sentence that also inflects on a count. */
    tfn: (count: number, key: TranslationKey, params: Record<string, string | number>) =>
      fill(lookupCount(locale, key, count), { count, ...params }),
  };
}

/** Non-reactive translator for call sites outside React (toasts, services). */
export function translate(key: TranslationKey): string {
  return lookup(resolveLocale(useUserStore.getState().language), key);
}
