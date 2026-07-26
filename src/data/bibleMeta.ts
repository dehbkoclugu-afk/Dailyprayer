import meta from './bible-books.json';
import bookNames from './bible-book-names.json';
import type { Locale } from '@/i18n/translations';

export interface BookMeta {
  code: string;
  name: string;
  /** number of chapters */
  chapters: number;
}

/**
 * Lightweight book list (canonical order + chapter counts). The `name` is the
 * Turkish heading; use `bookName`/`getBookMeta` for a localized label.
 *
 * Chapter counts come from the Turkish edition and are NOT valid for every
 * locale: Luther 1912 follows the Hebrew versification, so German has Joel 4
 * (others 3) and Malachi 3 (others 4). Totals still come to 1189. The reader is
 * unaffected — it reads chapter counts from the loaded edition — but anything
 * that schedules or resolves chapters from this list (see `planReadings.ts`) is
 * wrong for German in those two books. Tracked in docs/design-100.md item 13.
 */
export const bookMeta = meta as BookMeta[];

const names = bookNames as Record<string, Partial<Record<Locale, string>>>;

/** Localized display name for a canonical book code. */
export function bookName(locale: Locale, code: string): string {
  return names[code]?.[locale] ?? names[code]?.en ?? code;
}

/** Book list with names localized for the given locale. */
export function getBookMeta(locale: Locale): BookMeta[] {
  return (meta as BookMeta[]).map((b) => ({
    code: b.code,
    chapters: b.chapters,
    name: bookName(locale, b.code),
  }));
}
