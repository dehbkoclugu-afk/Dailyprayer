import type { Locale } from '@/i18n/translations';
import { SCRIPTURE_SOURCES } from './scriptureRights';

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
// then cached. Each edition's rights status differs — see scriptureRights.ts;
// French and Portuguese are not verified as free and are release-blocked.
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

/**
 * Per-translation attribution line (required by each source's license).
 *
 * Read from `scriptureRights.ts`, not from the bundled JSON: the generator wrote
 * an unverified "public domain" claim into the French and Portuguese files, and
 * those files are immutable Scripture source data (`docs/scripture-integrity.md`).
 * The registry is the only thing allowed to state rights to the user.
 */
export function getBibleCredit(locale: Locale): string {
  return (SCRIPTURE_SOURCES[locale] ?? SCRIPTURE_SOURCES.en).credit;
}
