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
 * Turkish heading; use `bookName`/`getBookMeta` for a localized label. Chapter
 * counts are canonical and identical across every bundled translation.
 */
export const bookMeta = meta as BookMeta[];

const names = bookNames as Record<string, Partial<Record<Locale, string>>>;

/** Localized display name for a canonical book code. */
export function bookName(locale: Locale, code: string): string {
  return names[code]?.[locale] ?? names[code]?.en ?? code;
}
