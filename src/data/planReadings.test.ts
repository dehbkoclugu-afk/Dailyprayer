import test from 'node:test';
import assert from 'node:assert/strict';
import { CATHOLIC_73_BOOK_CODES } from './biblePack.ts';
import { planChapters, planReading } from './planReadings.ts';

test('annual plan resolves every chapter in the selected Catholic canon', () => {
  const books = CATHOLIC_73_BOOK_CODES.map((code) => ({ code, name: code, chapters: [[]] }));
  const covered = new Set<string>();
  for (let day = 0; day < 365; day++) {
    const reading = planReading('bible-365', day, books);
    for (const [book, chapter] of planChapters(reading, books)) {
      assert.equal(chapter, 0);
      covered.add(books[book].code);
    }
  }
  assert.deepEqual(covered, new Set(CATHOLIC_73_BOOK_CODES));
  assert.equal(books[planReading('bible-365', 0, books).book].code, 'GEN');
});
