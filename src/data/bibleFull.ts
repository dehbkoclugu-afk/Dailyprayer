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
// then cached. Each edition's rights status differs (public domain for en/es/fr/de,
// licensed for tr/pt) — see scriptureRights.ts, which is the only place allowed to
// state rights to the user.
const LOADERS: Record<Locale, () => BibleData> = {
  tr: () => require('./bible-full.tr.json'),
  en: () => require('./bible-full.en.json'),
  es: () => require('./bible-full.es.json'),
  pt: () => require('./bible-full.pt.json'),
  fr: () => require('./bible-full.fr.json'),
  de: () => require('./bible-full.de.json'),
};

const cache: Partial<Record<Locale, BibleData>> = {};
const loadDurations: Partial<Record<Locale, number>> = {};

function load(locale: Locale): BibleData {
  if (cache[locale]) return cache[locale]!;
  const started = globalThis.performance?.now?.() ?? Date.now();
  const data = (LOADERS[locale] ?? LOADERS.en)();
  loadDurations[locale] = (globalThis.performance?.now?.() ?? Date.now()) - started;
  return (cache[locale] = data);
}

/** Dev/release profiling hook; only locales actually opened appear in this map. */
export function getBibleLoadMetrics(): Readonly<Partial<Record<Locale, number>>> {
  return { ...loadDurations };
}

/** The whole Bible for a locale, in canonical order. Lazy + cached. */
export function getBible(locale: Locale): FullBook[] {
  return load(locale).books;
}

/**
 * Per-translation attribution line (required by each source's license).
 *
 * Read from `scriptureRights.ts`, not from the bundled JSON. The generators write a
 * credit into the JSON, which once let an unverified "public domain" claim reach
 * users; routing display through the registry means a claim has to carry evidence
 * and pass `npm run release-gate` before anyone can see it.
 */
export function getBibleCredit(locale: Locale): string {
  return (SCRIPTURE_SOURCES[locale] ?? SCRIPTURE_SOURCES.en).credit;
}
