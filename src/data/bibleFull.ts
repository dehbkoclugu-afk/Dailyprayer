import type { Locale } from '@/i18n/translations';
import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import type { BiblePack } from '@/data/biblePack';

/** A chapter is an ordered list of [verseLabel, text] pairs (labels keep ranges). */
export type Chapter = [string, string][];

export interface FullBook {
  code: string;
  name: string;
  chapters: Chapter[];
}

interface BibleData {
  credit: string;
  books: FullBook[];
}

// Each translation is ~4 MB. The require() calls keep them out of initial bundle
// evaluation — a locale's JSON is parsed only the first time its reader opens,
// then cached. Turkish is the bundled Yorumsuz Türkçe Çeviri; the rest are
// public-domain translations (see scripts/build-bible-i18n.mjs).
const LOADERS: Record<Locale, () => BibleData> = {
  tr: () => require('./bible-full.tr.json'),
  en: () => require('./bible-full.en.json'),
  es: () => require('./bible-full.es.json'),
  pt: () => require('./bible-full.pt.json'),
  fr: () => require('./bible-full.fr.json'),
  de: () => require('./bible-full.de.json'),
};

const cache: Partial<Record<Locale, BibleData>> = {};
const downloaded: Partial<Record<GlobalLocaleTag, BibleData>> = {};

function isBundledLocale(locale: GlobalLocaleTag): locale is Locale {
  return Object.prototype.hasOwnProperty.call(LOADERS, locale);
}

function load(locale: GlobalLocaleTag): BibleData {
  const remote = downloaded[locale];
  if (remote) return remote;
  if (isBundledLocale(locale)) return (cache[locale] ??= LOADERS[locale]());
  // Startup/picker guarantees remote preferences are registered before use.
  // English is a defensive fallback for a deleted/corrupt pack.
  return (cache.en ??= LOADERS.en());
}

/** Register a checksum + schema validated offline pack for synchronous reader use. */
export function registerDownloadedBiblePack(pack: BiblePack): void {
  downloaded[pack.locale] = { credit: pack.credit, books: pack.books };
}

/** The whole Bible for a locale, in source-defined canon/order. Lazy + cached. */
export function getBible(locale: GlobalLocaleTag): FullBook[] {
  return load(locale).books;
}

/** Per-translation attribution line (required by each source's license). */
export function getBibleCredit(locale: GlobalLocaleTag): string {
  return load(locale).credit;
}
