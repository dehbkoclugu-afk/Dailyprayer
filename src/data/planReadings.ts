import { bookMeta, bookName, chapterCount } from '@/data/bibleMeta';
import {
  GOSPEL_CODES,
  flatten,
  planReadingFrom,
  type ChapterCounts,
  type PlanReading,
} from '@/data/planReadings.logic';
import type { Locale } from '@/i18n/translations';

/**
 * Maps each reading plan's day to a REAL passage in the bundled Bible, replacing
 * the old placeholder that drew an unrelated verse from the daily pool. Uses only
 * the lightweight book metadata (names + chapter counts) — the 4 MB text is loaded
 * lazily by the reader when the passage is opened.
 *
 * Scheduling is per locale because editions divide books differently: Luther 1912
 * gives German Joel 4 chapters and Malachi 3 where the others have 3 and 4. Using
 * one edition's counts for all of them meant a German plan scheduled a Malachi 4
 * that does not exist (the reader clamped it back to Malachi 3, repeating a day)
 * and never scheduled German Joel 4.
 *
 * The scheduling itself lives in `planReadings.logic.ts` so it can be tested
 * against every edition's real versification.
 */
export type { PlanReading };

const ORDER = bookMeta.map((b) => b.code);

interface Layout {
  counts: ChapterCounts;
  gospels: [number, number][];
  all: [number, number][];
}

// Cached per locale: the flattened lists come to the same length (1189) but not the
// same content, so one shared cache would hand a German reader another edition's
// layout — which is exactly the bug this replaced.
const layouts: Partial<Record<Locale, Layout>> = {};

function layout(locale: Locale): Layout {
  return (layouts[locale] ??= (() => {
    const counts: ChapterCounts = {};
    for (const code of ORDER) counts[code] = chapterCount(locale, code);
    return {
      counts,
      gospels: flatten(GOSPEL_CODES, ORDER, counts),
      all: flatten(ORDER, ORDER, counts),
    };
  })());
}

/** The reading for a plan on a given 0-based day, in this locale's edition. */
export function planReading(planId: string, day: number, locale: Locale): PlanReading {
  const { counts, gospels, all } = layout(locale);
  return planReadingFrom(planId, day, ORDER, counts, gospels, all);
}

/** Display reference, e.g. "Mezmur 23", "Yaratılış 1–3", "Malaki 4 – Matta 2". */
export function formatReadingRef(r: PlanReading, locale: Locale): string {
  const sCode = bookMeta[r.book]?.code ?? '';
  const eCode = bookMeta[r.endBook]?.code ?? '';
  const sName = sCode ? bookName(locale, sCode) : '';
  const eName = eCode ? bookName(locale, eCode) : '';
  if (r.book === r.endBook) {
    return r.chapter === r.endChapter
      ? `${sName} ${r.chapter + 1}`
      : `${sName} ${r.chapter + 1}–${r.endChapter + 1}`;
  }
  return `${sName} ${r.chapter + 1} – ${eName} ${r.endChapter + 1}`;
}
