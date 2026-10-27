/**
 * Translation-independent Scripture addressing. Positions are stored by
 * canonical book code + chapter + verse *label* (not array indices), so
 * bookmarks, highlights and the reading position survive switching to an
 * edition with a different canon order or merged verse ranges ("2-3").
 * Legacy index-based addresses are kept as "#<index>" so no data is lost.
 */
export type ChapterLike = readonly (readonly [string, string])[];
export interface BookLike {
  code: string;
  chapters: readonly ChapterLike[];
}

export const LEGACY_INDEX_PREFIX = '#';

export function legacyVerseRef(index: number): string {
  return `${LEGACY_INDEX_PREFIX}${index}`;
}

/** Book index for a canonical code; -1 when this edition lacks the book. */
export function findBookIndex(bible: readonly BookLike[], code: string): number {
  return bible.findIndex((book) => book.code === code);
}

/** Index of the verse whose label is (or whose range contains) `ref`; -1 if absent. */
export function findVerseIndex(chapter: ChapterLike | undefined, ref: string): number {
  if (!chapter || !ref) return -1;
  if (ref.startsWith(LEGACY_INDEX_PREFIX)) {
    const index = Number(ref.slice(LEGACY_INDEX_PREFIX.length));
    return Number.isInteger(index) && index >= 0 && index < chapter.length ? index : -1;
  }
  const exact = chapter.findIndex(([label]) => label === ref);
  if (exact >= 0) return exact;
  const wanted = Number.parseInt(ref, 10);
  if (!Number.isFinite(wanted)) return -1;
  return chapter.findIndex(([label]) => {
    const [start, end = start] = label.split('-').map((part) => Number.parseInt(part, 10));
    return wanted >= start && wanted <= end;
  });
}

/** Stable highlight key for a verse. */
export function highlightKey(code: string, chapter: number, verseLabel: string): string {
  return `${code}|${chapter}|${verseLabel}`;
}

export function parseHighlightKey(key: string): { code: string; chapter: number; verse: string } | null {
  const [code, chapter, verse] = key.split('|');
  const chapterIndex = Number(chapter);
  if (!code || !verse || !Number.isInteger(chapterIndex) || chapterIndex < 0) return null;
  return { code, chapter: chapterIndex, verse };
}

export interface ReaderTarget {
  book: number;
  chapter: number;
  /** verse index to scroll to, if requested and valid */
  verse: number | null;
}

/**
 * Validate untrusted reader params (deep links, search, library). `book` may be
 * a canonical code or a legacy numeric index; anything invalid yields null.
 */
export function resolveReaderTarget(
  bible: readonly BookLike[],
  params: { book?: string; chapter?: string; verse?: string },
): ReaderTarget | null {
  if (params.book == null || params.chapter == null) return null;
  const numericBook = /^\d+$/.test(params.book) ? Number(params.book) : NaN;
  const book = Number.isInteger(numericBook) ? numericBook : findBookIndex(bible, params.book);
  if (book < 0 || book >= bible.length) return null;
  const chapter = /^\d+$/.test(params.chapter) ? Number(params.chapter) : NaN;
  if (!Number.isInteger(chapter) || chapter < 0 || chapter >= bible[book].chapters.length) return null;
  const verseIndex = params.verse ? findVerseIndex(bible[book].chapters[chapter], params.verse) : -1;
  return { book, chapter, verse: verseIndex >= 0 ? verseIndex : null };
}
