import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verses } from './verses.ts';

// Data-integrity guard for scripture. See docs/scripture-integrity.md.
// This caught a real incident where a generator wrote an empty verses file.

test('verse pool covers a full year of daily rotation', () => {
  assert.ok(verses.length >= 365, `only ${verses.length} verses; expected >= 365`);
});

test('every verse has real, non-empty text', () => {
  for (const v of verses) {
    assert.ok(v.text && v.text.trim().length >= 8, `too-short text at ${v.reference}`);
  }
});

test('every reference is well-formed "Book chapter:verse"', () => {
  const re = /^[0-9]?\s?[A-Za-z ]+\s\d+:\d+(-\d+)?$/;
  for (const v of verses) {
    assert.match(v.reference, re, `malformed reference: ${v.reference}`);
  }
});

test('no parsing artifacts leaked into verse text', () => {
  for (const v of verses) {
    assert.doesNotMatch(v.text, /[{}[\]]|verseNumber|undefined|\\n/, `artifact in ${v.reference}`);
  }
});

test('references are unique (no repeated days)', () => {
  const refs = verses.map((v) => v.reference);
  assert.equal(new Set(refs).size, refs.length, 'duplicate references present');
});
