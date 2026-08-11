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
// then cached. Turkish is the bundled Yorumsuz Türkçe Çeviri; the rest have
// exact public-domain source evidence. Portuguese and French use downloadable,
// checksum-pinned editions because the archived bundle revisions are ambiguous.
type BundledBibleLocale = 'en' | 'tr' | 'es' | 'de';

const LOADERS: Record<BundledBibleLocale, () => BibleData> = {
  tr: () => require('./bible-full.tr.json'),
  en: () => require('./bible-full.en.json'),
  es: () => require('./bible-full.es.json'),
  de: () => require('./bible-full.de.json'),
};

const cache: Partial<Record<BundledBibleLocale, BibleData>> = {};
const downloaded: Partial<Record<GlobalLocaleTag, BibleData>> = {};

function isBundledLocale(locale: GlobalLocaleTag): locale is BundledBibleLocale {
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
