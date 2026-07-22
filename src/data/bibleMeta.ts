import meta from './bible-books.json';

export interface BookMeta {
  code: string;
  name: string;
  /** number of chapters */
  chapters: number;
}

/** Lightweight book list (names + chapter counts), canonical order. */
export const bookMeta = meta as BookMeta[];
