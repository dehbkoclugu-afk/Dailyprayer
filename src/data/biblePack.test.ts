import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIBLE_PACK_SCHEMA_VERSION,
  CANONICAL_BOOK_CODES,
  CATHOLIC_73_BOOK_CODES,
  validateBiblePack,
  type BibleCanon,
} from './biblePack.ts';
import { bookMeta } from './bibleMeta.ts';

const catholicChapters: Record<string, number> = {
  DAN: 14, JOL: 4, MAL: 3, TOB: 14, JDT: 16, ESG: 10,
  WIS: 19, SIR: 51, BAR: 6, '1MA': 16, '2MA': 15,
};

function fixture(canon: BibleCanon, codes: readonly string[]) {
  return {
    schemaVersion: BIBLE_PACK_SCHEMA_VERSION,
    locale: canon === 'catholic-73' ? 'hr' : 'en',
    canon,
    edition: 'Fixture',
    credit: 'Fixture credit',
    sourceUrl: 'https://example.test/source.zip',
    sourceSha256: 'a'.repeat(64),
    generatedAt: '2026-08-08T00:00:00.000Z',
    books: codes.map((code) => ({
      code, name: code,
      chapters: Array.from({ length: canon === 'catholic-73'
        ? catholicChapters[code] ?? bookMeta.find((book) => book.code === code)?.chapters ?? 0
        : bookMeta.find((book) => book.code === code)?.chapters ?? 0 }, () => [['1', 'Text']]),
    })),
  };
}

test('accepts Protestant 66 pack profile', () => {
  const pack = fixture('protestant-66', CANONICAL_BOOK_CODES);
  assert.equal(validateBiblePack(pack, 'en').books.length, 66);
});

test('accepts Catholic 73 profile without pretending ESG is EST', () => {
  const pack = fixture('catholic-73', CATHOLIC_73_BOOK_CODES);
  const validated = validateBiblePack(pack, 'hr');
  assert.equal(validated.books.length, 73);
  assert.equal(validated.books.some((book) => book.code === 'ESG'), true);
  assert.equal(validated.books.some((book) => book.code === 'EST'), false);
});

test('rejects a canon label that does not match its book profile', () => {
  const pack = fixture('catholic-73', CANONICAL_BOOK_CODES);
  assert.throws(() => validateBiblePack(pack, 'hr'), /must contain 73 books/);
});

test('rejects books with empty chapters', () => {
  const pack = fixture('protestant-66', CANONICAL_BOOK_CODES);
  pack.books[0].chapters[0] = [];
  assert.throws(() => validateBiblePack(pack, 'en'), /Empty or invalid chapter/);
});

test('rejects an incomplete book even when its remaining chapters have verses', () => {
  const pack = fixture('protestant-66', CANONICAL_BOOK_CODES);
  pack.books[0].chapters.pop();
  assert.throws(() => validateBiblePack(pack, 'en'), /GEN must contain 50 chapters/);
});

test('lightweight bundled credits match the bundled Bible files', async () => {
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const here = (name: string) => fileURLToPath(new URL(name, import.meta.url).href);
  const source = readFileSync(here('./bibleFull.ts'), 'utf8');
  for (const locale of ['en', 'tr', 'es', 'de']) {
    const { credit } = JSON.parse(readFileSync(here(`./bible-full.${locale}.json`), 'utf8'));
    assert.ok(source.includes(JSON.stringify(credit).slice(1, -1)), `${locale} credit drifted: ${credit}`);
  }
});
