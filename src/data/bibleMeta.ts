import meta from './bible-books.json';
import bookNames from './bible-book-names.json';
import chapterCounts from './bible-chapters.json';
import type { Locale } from '@/i18n/translations';

export interface BookMeta {
  code: string;
  name: string;
  /** number of chapters */
  chapters: number;
}

/**
 * Lightweight book list in canonical order. The `name` is the Turkish heading and
 * `chapters` is the Turkish count — use `getBookMeta(locale)` or
 * `chapterCount(locale, code)` when the count has to be right for a locale.
 *
 * Editions divide books differently: Luther 1912 follows the Hebrew versification,
 * so German has Joel 4 chapters (others 3) and Malachi 3 (others 4). Totals still
 * come to 1189, which is why this stayed hidden. Reach for the locale-aware helpers
 * for anything that schedules or resolves chapters.
 */
export const bookMeta = meta as BookMeta[];

const names = bookNames as Record<string, Partial<Record<Locale, string>>>;
const chapters = chapterCounts as Record<string, Partial<Record<Locale, number>>>;

/** Localized display name for a canonical book code. */
export function bookName(locale: Locale, code: string): string {
  return names[code]?.[locale] ?? names[code]?.en ?? code;
}

/**
 * Chapter count for a book in the edition this locale actually reads. Derived from
 * the bundled text (scripts/build-bible-chapters.mjs), so it cannot disagree with
 * what the reader loads.
 */
export function chapterCount(locale: Locale, code: string): number {
  return chapters[code]?.[locale] ?? chapters[code]?.en ?? 0;
}

/** Book list with names and chapter counts correct for the given locale. */
export function getBookMeta(locale: Locale): BookMeta[] {
  return (meta as BookMeta[]).map((b) => ({
    code: b.code,
    chapters: chapterCount(locale, b.code),
    name: bookName(locale, b.code),
  }));
}
