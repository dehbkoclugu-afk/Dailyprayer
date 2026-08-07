import type { GlobalLocaleTag } from '@/i18n/globalLanguageCatalog';

/**
 * On-disk/network Bible language-pack contract.
 *
 * Full Scripture text is intentionally NOT part of this file. A released pack
 * is produced from a named source edition, validated, checksum-pinned and then
 * downloaded on demand. Scripture is never generated or machine-translated.
 */
export const BIBLE_PACK_SCHEMA_VERSION = 2 as const;

export type BibleCanon = 'protestant-66' | 'catholic-73';

export interface BiblePackBook {
  code: string;
  name: string;
  chapters: [string, string][][];
}

export interface BiblePack {
  schemaVersion: typeof BIBLE_PACK_SCHEMA_VERSION;
  locale: GlobalLocaleTag;
  canon: BibleCanon;
  edition: string;
  credit: string;
  sourceUrl: string;
  sourceSha256: string;
  generatedAt: string;
  books: BiblePackBook[];
}

export interface BiblePackRelease {
  locale: GlobalLocaleTag;
  version: string;
  bytes: number;
  sha256: string;
  downloadUrl: string;
}

export const CANONICAL_BOOK_CODES = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH',
  'EZR','NEH','EST','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS',
  'JOL','AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL','MAT','MRK','LUK',
  'JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH','1TI','2TI','TIT',
  'PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV',
] as const;

export const CATHOLIC_73_BOOK_CODES = [
  'GEN','EXO','LEV','NUM','DEU','JOS','JDG','RUT','1SA','2SA','1KI','2KI','1CH','2CH',
  'EZR','NEH','JOB','PSA','PRO','ECC','SNG','ISA','JER','LAM','EZK','DAN','HOS','JOL',
  'AMO','OBA','JON','MIC','NAM','HAB','ZEP','HAG','ZEC','MAL',
  'TOB','JDT','ESG','WIS','SIR','BAR','1MA','2MA',
  'MAT','MRK','LUK','JHN','ACT','ROM','1CO','2CO','GAL','EPH','PHP','COL','1TH','2TH',
  '1TI','2TI','TIT','PHM','HEB','JAS','1PE','2PE','1JN','2JN','3JN','JUD','REV',
] as const;

const CANON_BOOK_CODES: Record<BibleCanon, readonly string[]> = {
  'protestant-66': CANONICAL_BOOK_CODES,
  'catholic-73': CATHOLIC_73_BOOK_CODES,
};

/**
 * Defensive validation for downloaded packs. This deliberately checks shape
 * and canonical book identity before any text reaches the reader. Cryptographic
 * SHA-256 verification belongs to the download/storage layer and happens first.
 */
export function validateBiblePack(value: unknown, expectedLocale?: GlobalLocaleTag): BiblePack {
  if (!value || typeof value !== 'object') throw new Error('Bible pack is not an object');
  const pack = value as Partial<BiblePack>;

  if (pack.schemaVersion !== BIBLE_PACK_SCHEMA_VERSION) {
    throw new Error(`Unsupported Bible pack schema: ${String(pack.schemaVersion)}`);
  }
  if (!pack.locale || (expectedLocale && pack.locale !== expectedLocale)) {
    throw new Error(`Bible pack locale mismatch: ${String(pack.locale)}`);
  }
  if (pack.canon !== 'protestant-66' && pack.canon !== 'catholic-73') {
    throw new Error(`Unsupported Bible canon: ${String(pack.canon)}`);
  }
  for (const field of ['edition', 'credit', 'sourceUrl', 'sourceSha256', 'generatedAt'] as const) {
    if (typeof pack[field] !== 'string' || !pack[field]) {
      throw new Error(`Bible pack is missing ${field}`);
    }
  }
  if (!/^[a-f0-9]{64}$/i.test(pack.sourceSha256!)) {
    throw new Error('Bible pack sourceSha256 is invalid');
  }
  const expectedCodes = CANON_BOOK_CODES[pack.canon];
  if (!Array.isArray(pack.books) || pack.books.length !== expectedCodes.length) {
    throw new Error(`Bible pack canon ${pack.canon} must contain ${expectedCodes.length} books`);
  }

  pack.books.forEach((book, index) => {
    if (!book || typeof book !== 'object') throw new Error(`Invalid Bible book at index ${index}`);
    const expectedCode = expectedCodes[index];
    if (book.code !== expectedCode) {
      throw new Error(`Bible book order mismatch at ${index}: expected ${expectedCode}`);
    }
    if (typeof book.name !== 'string' || !book.name || !Array.isArray(book.chapters) || !book.chapters.length) {
      throw new Error(`Invalid Bible book payload: ${book.code}`);
    }
    for (const chapter of book.chapters) {
      if (!Array.isArray(chapter)) throw new Error(`Invalid chapter in ${book.code}`);
      for (const verse of chapter) {
        if (
          !Array.isArray(verse) ||
          verse.length !== 2 ||
          typeof verse[0] !== 'string' ||
          typeof verse[1] !== 'string' ||
          !verse[0] ||
          !verse[1]
        ) {
          throw new Error(`Invalid verse in ${book.code}`);
        }
      }
    }
  });

  return pack as BiblePack;
}
