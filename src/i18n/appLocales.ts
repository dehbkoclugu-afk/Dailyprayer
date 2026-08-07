import { GLOBAL_LANGUAGE_CATALOG, type GlobalLocaleTag } from './globalLanguageCatalog';

/**
 * Application locales with complete Lumen-owned localization coverage.
 *
 * Scripture remains independent and has a wider catalog. We intentionally do
 * not advertise a UI locale until the translation pipeline can actually
 * produce it. cek/hlt/kos/to therefore remain Scripture-only editions.
 */
export const APP_LOCALE_TAGS = [
  'ar', 'my', 'zh-Hans', 'zh-Hant', 'hr', 'cs', 'nl', 'en', 'eo', 'fr', 'de',
  'ht', 'haw', 'it', 'ja', 'ko', 'la', 'fa', 'pt', 'ro', 'ru',
  'sr-Latn', 'sr-Cyrl', 'es', 'uk', 'vi', 'sq', 'da', 'fi', 'hu', 'lv',
  'mi', 'no', 'pl', 'sv', 'tl', 'tr',
] as const satisfies readonly GlobalLocaleTag[];

export type AppLocale = (typeof APP_LOCALE_TAGS)[number];

export const APP_LOCALE_META = Object.fromEntries(
  APP_LOCALE_TAGS.map((tag) => {
    const item = GLOBAL_LANGUAGE_CATALOG.find((entry) => entry.tag === tag);
    if (!item) throw new Error(`Missing global locale metadata for ${tag}`);
    return [tag, item];
  }),
) as Record<AppLocale, (typeof GLOBAL_LANGUAGE_CATALOG)[number]>;

export const APP_RTL_LOCALES: readonly AppLocale[] = ['ar', 'fa'];

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALE_TAGS as readonly string[]).includes(value);
}
