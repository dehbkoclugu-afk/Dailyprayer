/**
 * Application-language source of truth.
 *
 * Keep this catalog separate from Scripture editions: choosing the language of
 * Lumen's interface must never silently change the user's Bible preference.
 */
import {
  GLOBAL_LANGUAGE_CATALOG,
  RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS,
  type GlobalLocaleTag,
} from './globalLanguageCatalog.ts';

export type AppDirection = 'ltr' | 'rtl';

const rolloutTags = new Set<GlobalLocaleTag>([
  ...RELEASE_CANDIDATE_SCRIPTURE_LOCALE_TAGS,
  'tr',
]);

/** Locales that become selectable only after both UI and content packs pass release gates. */
export const APPLICATION_LOCALE_CANDIDATES = GLOBAL_LANGUAGE_CATALOG
  .filter((locale) => rolloutTags.has(locale.tag))
  .map(({ tag, nativeName, direction }) => ({ tag, nativeName, direction }));

export const RTL_APPLICATION_LOCALE_CANDIDATES = APPLICATION_LOCALE_CANDIDATES
  .filter((locale) => locale.direction === 'rtl')
  .map((locale) => locale.tag);

/** Fully translated and currently advertised locales. */
export const APPLICATION_LOCALES = [
  { tag: 'en', nativeName: 'English', direction: 'ltr' },
  { tag: 'tr', nativeName: 'Türkçe', direction: 'ltr' },
  { tag: 'es', nativeName: 'Español', direction: 'ltr' },
  { tag: 'pt', nativeName: 'Português', direction: 'ltr' },
  { tag: 'fr', nativeName: 'Français', direction: 'ltr' },
  { tag: 'de', nativeName: 'Deutsch', direction: 'ltr' },
  { tag: 'it', nativeName: 'Italiano', direction: 'ltr' },
  { tag: 'nl', nativeName: 'Nederlands', direction: 'ltr' },
] as const;

export type AppLocale = (typeof APPLICATION_LOCALES)[number]['tag'];

export const SUPPORTED_LOCALES = APPLICATION_LOCALES.map((locale) => locale.tag) as AppLocale[];
export const RTL_APPLICATION_LOCALES = APPLICATION_LOCALES
  .filter((locale) => (locale.direction as AppDirection) === 'rtl')
  .map((locale) => locale.tag) as AppLocale[];

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

export function getApplicationLocale(tag: AppLocale) {
  return APPLICATION_LOCALES.find((locale) => locale.tag === tag)!;
}

/** Resolve a BCP-47 device locale to a fully translated application locale. */
export function resolveApplicationLocale(
  languageTag?: string | null,
  languageCode?: string | null,
): AppLocale {
  const raw = (languageTag ?? '').replace(/_/g, '-');
  const lower = raw.toLowerCase();

  // These branches become active as soon as their complete UI packs are added.
  // Keeping the resolver script-aware now prevents a second migration later.
  if (lower.startsWith('zh')) {
    const candidate = /(?:^|-)hant(?:-|$)|-(?:tw|hk|mo)(?:-|$)/i.test(raw)
      ? 'zh-Hant'
      : 'zh-Hans';
    if (SUPPORTED_LOCALE_SET.has(candidate)) return candidate as AppLocale;
  }
  if (lower.startsWith('sr')) {
    const candidate = /(?:^|-)latn(?:-|$)/i.test(raw) ? 'sr-Latn' : 'sr-Cyrl';
    if (SUPPORTED_LOCALE_SET.has(candidate)) return candidate as AppLocale;
  }

  const exact = SUPPORTED_LOCALES.find((tag) => tag.toLowerCase() === lower);
  if (exact) return exact;

  const code = (languageCode ?? raw.split('-')[0] ?? '').toLowerCase();
  return SUPPORTED_LOCALE_SET.has(code) ? (code as AppLocale) : 'en';
}
