/**
 * Reading-plan scheduling, as a pure function of chapter counts.
 *
 * Split out so it can be tested against every edition's real versification without
 * loading the 4 MB text or the JSON metadata that only Metro can import. The
 * counts are per locale on purpose: Luther 1912 gives German Joel 4 chapters and
 * Malachi 3 where the other editions have 3 and 4, so scheduling from one shared
 * layout silently mis-scheduled German.
 */

export interface PlanReading {
  /** entry point — canonical book index + 0-based chapter (where the reader opens) */
  book: number;
  chapter: number;
  /** inclusive end of the day's reading (same as book/chapter for single chapters) */
  endBook: number;
  endChapter: number;
}

/** Curated single-chapter passages, [bookCode, 1-based chapter]. */
export const PEACE: [string, number][] = [
  ['PSA', 23], ['PSA', 46], ['MAT', 6], ['PSA', 121], ['PHP', 4], ['JHN', 14], ['PSA', 91],
];
export const GRATITUDE: [string, number][] = [
  ['PSA', 100], ['PSA', 103], ['COL', 3], ['PSA', 136], ['1TH', 5], ['PHP', 4], ['PSA', 145],
];

export const GOSPEL_CODES = ['MAT', 'MRK', 'LUK', 'JHN'];

/** Chapter counts for one edition: canonical book code -> number of chapters. */
export type ChapterCounts = Record<string, number>;

/** Flat [bookIndex, chapterIndex] list across the given books, in this edition. */
export function flatten(
  codes: string[],
  order: string[],
  counts: ChapterCounts,
): [number, number][] {
  const out: [number, number][] = [];
  for (const code of codes) {
    const bookIndex = order.indexOf(code);
    if (bookIndex === -1) continue;
    for (let chapter = 0; chapter < (counts[code] ?? 0); chapter += 1) {
      out.push([bookIndex, chapter]);
    }
  }
  return out;
}

const single = (book: number, chapter: number): PlanReading => ({
  book,
  chapter,
  endBook: book,
  endChapter: chapter,
});

/**
 * The reading for a plan on a given 0-based day.
 *
 * `order` is the canonical book order; `counts` must be the chapter counts of the
 * edition the reader will actually open, or a scheduled chapter may not exist.
 */
export function planReadingFrom(
  planId: string,
  day: number,
  order: string[],
  counts: ChapterCounts,
  gospels: [number, number][] = flatten(GOSPEL_CODES, order, counts),
  all: [number, number][] = flatten(order, order, counts),
): PlanReading {
  const indexOf = (code: string) => order.indexOf(code);

  switch (planId) {
    case 'peace-7': {
      const [code, chapter] = PEACE[day % PEACE.length];
      return single(indexOf(code), chapter - 1);
    }
    case 'gratitude-7': {
      const [code, chapter] = GRATITUDE[day % GRATITUDE.length];
      return single(indexOf(code), chapter - 1);
    }
    case 'psalms-30': {
      // Psalm 1..30, one per day, in order
      return single(indexOf('PSA'), day % (counts.PSA ?? 1));
    }
    case 'gospels-90': {
      const [book, chapter] = gospels[Math.min(day, gospels.length - 1)];
      return single(book, chapter);
    }
    case 'bible-365':
    default: {
      // spread every chapter evenly across 365 days (~3 chapters/day)
      const total = all.length;
      const start = Math.min(Math.floor((day * total) / 365), total - 1);
      const endExclusive = Math.min(Math.floor(((day + 1) * total) / 365), total);
      const endIndex = Math.max(start, endExclusive - 1);
      const [startBook, startChapter] = all[start];
      const [endBook, endChapter] = all[endIndex];
      return { book: startBook, chapter: startChapter, endBook, endChapter };
    }
  }
}
