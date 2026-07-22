import type { Locale } from '@/i18n/translations';

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

function load(locale: Locale): BibleData {
  return (cache[locale] ??= (LOADERS[locale] ?? LOADERS.en)());
}

/** The whole Bible for a locale, in canonical order. Lazy + cached. */
export function getBible(locale: Locale): FullBook[] {
  return load(locale).books;
}

/** Per-translation attribution line (required by each source's license). */
export function getBibleCredit(locale: Locale): string {
  return load(locale).credit;
}
