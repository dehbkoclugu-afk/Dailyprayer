import { bookMeta, bookName } from '@/data/bibleMeta';
import type { Locale } from '@/i18n/translations';

/**
 * Maps each reading plan's day to a REAL passage in the bundled Bible, replacing
 * the old placeholder that drew an unrelated verse from the daily pool. Uses only
 * the lightweight book metadata (names + chapter counts) — the 4 MB text is loaded
 * lazily by the reader when the passage is opened.
 */
export interface PlanReading {
  /** entry point — canonical book index + 0-based chapter (where the reader opens) */
  book: number;
  chapter: number;
  /** inclusive end of the day's reading (same as book/chapter for single chapters) */
  endBook: number;
  endChapter: number;
}

const idxByCode: Record<string, number> = {};
bookMeta.forEach((b, i) => (idxByCode[b.code] = i));

/** Curated single-chapter passages, [bookCode, 1-based chapter]. */
const PEACE: [string, number][] = [
  ['PSA', 23], ['PSA', 46], ['MAT', 6], ['PSA', 121], ['PHP', 4], ['JHN', 14], ['PSA', 91],
];
const GRATITUDE: [string, number][] = [
  ['PSA', 100], ['PSA', 103], ['COL', 3], ['PSA', 136], ['1TH', 5], ['PHP', 4], ['PSA', 145],
];

/** Flat [bookIndex, chapterIndex] list across the given books, in order. */
function flatten(codes: string[]): [number, number][] {
  const out: [number, number][] = [];
  for (const c of codes) {
    const bi = idxByCode[c];
    if (bi === undefined) continue;
    for (let ch = 0; ch < bookMeta[bi].chapters; ch++) out.push([bi, ch]);
  }
  return out;
}

const GOSPELS = flatten(['MAT', 'MRK', 'LUK', 'JHN']); // 89 chapters

let ALL: [number, number][] | null = null;
function allChapters(): [number, number][] {
  if (!ALL) ALL = flatten(bookMeta.map((b) => b.code));
  return ALL; // 1189 chapters
}

const single = (bi: number, ch0: number): PlanReading => ({
  book: bi,
  chapter: ch0,
  endBook: bi,
  endChapter: ch0,
});

/** The reading for a plan on a given 0-based day. */
export function planReading(planId: string, day: number): PlanReading {
  switch (planId) {
    case 'peace-7': {
      const [code, ch] = PEACE[day % PEACE.length];
      return single(idxByCode[code], ch - 1);
    }
    case 'gratitude-7': {
      const [code, ch] = GRATITUDE[day % GRATITUDE.length];
      return single(idxByCode[code], ch - 1);
    }
    case 'psalms-30': {
      // Psalm 1..30, one per day, in order
      return single(idxByCode['PSA'], day % 150);
    }
    case 'gospels-90': {
      const [bi, ch] = GOSPELS[Math.min(day, GOSPELS.length - 1)];
      return single(bi, ch);
    }
    case 'bible-365':
    default: {
      // spread all 1189 chapters evenly across 365 days (~3 chapters/day)
      const all = allChapters();
      const total = all.length;
      const start = Math.min(Math.floor((day * total) / 365), total - 1);
      const endExcl = Math.min(Math.floor(((day + 1) * total) / 365), total);
      const endIdx = Math.max(start, endExcl - 1);
      const [sb, sc] = all[start];
      const [eb, ec] = all[endIdx];
      return { book: sb, chapter: sc, endBook: eb, endChapter: ec };
    }
  }
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
