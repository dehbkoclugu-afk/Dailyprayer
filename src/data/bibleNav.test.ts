import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findVerseIndex,
  highlightKey,
  legacyVerseRef,
  parseHighlightKey,
  resolveReaderTarget,
} from './bibleNav.ts';

const bible = [
  { code: 'GEN', chapters: [[['1', 'a'], ['2-3', 'b'], ['4', 'c']]] },
  { code: 'PSA', chapters: [[['1', 'x']], [['1', 'y'], ['2', 'z']]] },
] as const;

test('finds verses by label, range membership and legacy index', () => {
  const chapter = bible[0].chapters[0];
  assert.equal(findVerseIndex(chapter, '1'), 0);
  assert.equal(findVerseIndex(chapter, '3'), 1);
  assert.equal(findVerseIndex(chapter, '2-3'), 1);
  assert.equal(findVerseIndex(chapter, '4'), 2);
  assert.equal(findVerseIndex(chapter, '9'), -1);
  assert.equal(findVerseIndex(chapter, legacyVerseRef(2)), 2);
  assert.equal(findVerseIndex(chapter, legacyVerseRef(7)), -1);
});

test('highlight keys round-trip', () => {
  assert.deepEqual(parseHighlightKey(highlightKey('JHN', 2, '16')), { code: 'JHN', chapter: 2, verse: '16' });
  assert.equal(parseHighlightKey('JHN|x|1'), null);
});

test('reader params are validated instead of crashing the reader', () => {
  assert.deepEqual(resolveReaderTarget(bible, { book: 'PSA', chapter: '1', verse: '2' }), {
    book: 1,
    chapter: 1,
    verse: 1,
  });
  assert.deepEqual(resolveReaderTarget(bible, { book: '0', chapter: '0' }), { book: 0, chapter: 0, verse: null });
  assert.equal(resolveReaderTarget(bible, { book: 'x', chapter: '0' }), null);
  assert.equal(resolveReaderTarget(bible, { book: 'GEN', chapter: '5' }), null);
  assert.equal(resolveReaderTarget(bible, { book: '-1', chapter: '0' }), null);
  assert.equal(resolveReaderTarget(bible, { book: 'GEN', chapter: '0', verse: '99' })?.verse, null);
});
