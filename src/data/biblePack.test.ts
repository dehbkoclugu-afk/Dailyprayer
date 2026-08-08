import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIBLE_PACK_SCHEMA_VERSION,
  CANONICAL_BOOK_CODES,
  CATHOLIC_73_BOOK_CODES,
  validateBiblePack,
  type BibleCanon,
} from './biblePack.ts';

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
    books: codes.map((code) => ({ code, name: code, chapters: [[['1', 'Text']]] })),
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
