import bible from './bible-full.json';

/** A chapter is an ordered list of [verseLabel, text] pairs (labels keep ranges). */
export type Chapter = [string, string][];

export interface FullBook {
  code: string;
  name: string;
  chapters: Chapter[];
}

// ~4 MB — imported only by the reader screen so it parses lazily on first open.
export const fullBible = (bible as { credit: string; books: FullBook[] }).books;
