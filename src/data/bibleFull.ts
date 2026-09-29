import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';
import type { BiblePack } from '@/data/biblePack';
import {
  bundledScriptureSource,
  downloadedScriptureSource,
  type BundledScriptureLocale,
  type ScriptureSource,
} from '@/data/scriptureSource';

/** A chapter is an ordered list of [verseLabel, text] pairs (labels keep ranges). */
export type Chapter = [string, string][];

export interface FullBook {
  code: string;
  name: string;
  chapters: Chapter[];
}

interface BiblePayload {
  credit: string;
  books: FullBook[];
}

interface BibleData extends BiblePayload {
  source: ScriptureSource;
}

// Each translation is ~4 MB. The require() calls keep them out of initial bundle
// evaluation — a locale's JSON is parsed only the first time its reader opens,
// then cached. Turkish is the bundled Yorumsuz Türkçe Çeviri; the rest have
// exact public-domain source evidence. Portuguese and French use downloadable,
// checksum-pinned editions because the archived bundle revisions are ambiguous.
type BundledBibleLocale = BundledScriptureLocale;

const LOADERS: Record<BundledBibleLocale, () => BiblePayload> = {
  tr: () => require('./bible-full.tr.json'),
  en: () => require('./bible-full.en.json'),
  es: () => require('./bible-full.es.json'),
  de: () => require('./bible-full.de.json'),
};

const cache: Partial<Record<BundledBibleLocale, BibleData>> = {};
const downloaded: Partial<Record<GlobalLocaleTag, BibleData>> = {};
const loadMetrics: Partial<Record<GlobalLocaleTag, { durationMs: number; books: number; verses: number }>> = {};
let activeLocale: GlobalLocaleTag | null = null;

function isBundledLocale(locale: GlobalLocaleTag): locale is BundledBibleLocale {
  return Object.prototype.hasOwnProperty.call(LOADERS, locale);
}

function load(locale: GlobalLocaleTag): BibleData {
  // A language switch releases the previous parsed multi-megabyte JSON. Metro
  // retains the compressed module bytes, but only the active Scripture tree is
  // held by this data layer.
  if (activeLocale !== locale) {
    for (const cachedLocale of Object.keys(cache) as BundledBibleLocale[]) {
      if (cachedLocale !== locale) delete cache[cachedLocale];
    }
    activeLocale = locale;
  }
  const remote = downloaded[locale];
  if (remote) return remote;
  if (isBundledLocale(locale)) {
    return (cache[locale] ??= (() => {
      const startedAt = globalThis.performance?.now?.() ?? Date.now();
      const payload = LOADERS[locale]();
      loadMetrics[locale] = {
        durationMs: (globalThis.performance?.now?.() ?? Date.now()) - startedAt,
        books: payload.books.length,
        verses: payload.books.reduce(
          (bookTotal, book) => bookTotal + book.chapters.reduce((chapterTotal, chapter) => chapterTotal + chapter.length, 0),
          0,
        ),
      };
      return { ...payload, source: bundledScriptureSource(locale, payload.credit) };
    })());
  }
  // Startup/picker guarantees remote preferences are registered before use.
  // English is a defensive fallback for a deleted/corrupt pack.
  return (cache.en ??= (() => {
    const payload = LOADERS.en();
    return { ...payload, source: bundledScriptureSource('en', payload.credit) };
  })());
}

/** Register a checksum + schema validated offline pack for synchronous reader use. */
export function registerDownloadedBiblePack(pack: BiblePack): void {
  downloaded[pack.locale] = {
    credit: pack.credit,
    books: pack.books,
    source: downloadedScriptureSource(pack),
  };
}

/** The whole Bible for a locale, in source-defined canon/order. Lazy + cached. */
export function getBible(locale: GlobalLocaleTag): FullBook[] {
  return load(locale).books;
}

/** Per-translation attribution line (required by each source's license). */
export function getBibleCredit(locale: GlobalLocaleTag): string {
  return load(locale).credit;
}

/** Metadata for the exact edition currently returned by getBible(). */
export function getBibleSource(locale: GlobalLocaleTag): ScriptureSource {
  return load(locale).source;
}

/** Diagnostics for startup/language-switch profiling; contains no Scripture. */
export function getBibleLoadMetrics() {
  return { activeLocale, locales: { ...loadMetrics } };
}
