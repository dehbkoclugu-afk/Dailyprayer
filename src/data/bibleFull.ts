import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import type { BiblePack } from '@/data/biblePack';
import { bookName } from '@/data/bibleMeta';

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

/** True when the edition's text is already in memory (no parse cost to use it). */
export function isBibleLoaded(locale: GlobalLocaleTag): boolean {
  if (downloaded[locale]) return true;
  return isBundledLocale(locale) ? Boolean(cache[locale]) : Boolean(cache.en);
}

/**
 * Localized book name without loading a 4 MB edition: downloaded packs carry
 * their own names (already in memory); bundled editions use the small
 * metadata table.
 */
export function getBookName(locale: GlobalLocaleTag, code: string): string {
  const remote = downloaded[locale]?.books.find((book) => book.code === code);
  if (remote) return remote.name;
  return bookName(isBundledLocale(locale) ? locale : 'en', code);
}

/** Register a checksum + schema validated offline pack for synchronous reader use. */
export function registerDownloadedBiblePack(pack: BiblePack): void {
  downloaded[pack.locale] = { credit: pack.credit, books: pack.books };
}

/** The whole Bible for a locale, in source-defined canon/order. Lazy + cached. */
export function getBible(locale: GlobalLocaleTag): FullBook[] {
  return load(locale).books;
}

/** Credits of the bundled editions, duplicated here so showing them never parses 4 MB. */
const BUNDLED_CREDITS: Record<BundledBibleLocale, string> = {
  en: 'World English Bible · Public Domain',
  tr: 'Yorumsuz Türkçe Çeviri © İsmail Serinken & eBible.org · CC BY-ND 4.0',
  es: 'Reina-Valera 1909 · Dominio público',
  de: 'Lutherbibel 1912 · Gemeinfrei',
};

/** Per-translation attribution line (required by each source's license). */
export function getBibleCredit(locale: GlobalLocaleTag): string {
  const remote = downloaded[locale];
  if (remote) return remote.credit;
  return BUNDLED_CREDITS[isBundledLocale(locale) ? locale : 'en'];
}
