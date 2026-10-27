import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getVerses, verseCount } from './verses.ts';

const LOCALES = ['tr', 'en', 'es', 'pt', 'fr', 'de'] as const;

// Data-integrity guard for scripture. See docs/scripture-integrity.md.
// This caught a real incident where a generator wrote an empty verses file.

test('verse pool covers a full year of daily rotation', () => {
  assert.ok(verseCount >= 365, `only ${verseCount} verses; expected >= 365`);
});

test('every locale resolves the whole pool', () => {
  for (const l of LOCALES) {
    assert.equal(getVerses(l).length, verseCount, `${l} pool size mismatch`);
  }
});

test('every verse has real, non-empty text in every language', () => {
  for (const l of LOCALES) {
    for (const v of getVerses(l)) {
      assert.ok(v.text && v.text.trim().length >= 8, `too-short ${l} text at ${v.reference}`);
    }
  }
});

test('every reference is well-formed "Book chapter:verse" in every language', () => {
  // Book names are localized: Unicode letters, digits ("1. Korintliler"),
  // periods and apostrophes (’/') are all valid in the book portion.
  const re = /^[\p{L}\p{N}][\p{L}\p{N}.’' ]*\s\d+:\d+(-\d+)?$/u;
  for (const l of LOCALES) {
    for (const v of getVerses(l)) {
      assert.match(v.reference, re, `malformed ${l} reference: ${v.reference}`);
    }
  }
});

test('no parsing artifacts leaked into verse text', () => {
  for (const l of LOCALES) {
    for (const v of getVerses(l)) {
      assert.doesNotMatch(v.text, /[{}[\]]|verseNumber|undefined|\\n/, `artifact in ${l} ${v.reference}`);
    }
  }
});

test('references are unique within each language (no repeated days)', () => {
  for (const l of LOCALES) {
    const refs = getVerses(l).map((v) => v.reference);
    assert.equal(new Set(refs).size, refs.length, `duplicate ${l} references present`);
  }
});

test('German and French Psalms use English verse numbering (no superscription drift)', () => {
  const at = (locale: 'de' | 'fr' | 'en', index: number) => getVerses(locale)[index];
  const en = getVerses('en');
  const index = (reference: string) => en.findIndex((v) => v.reference === reference);
  assert.match(at('de', index('Psalm 46:10')).text, /^Seid stille/);
  assert.match(at('fr', index('Psalm 46:10')).text, /^Cessez/);
  assert.match(at('de', index('Psalm 23:1')).text, /^Der HERR ist mein Hirte/);
  assert.match(at('fr', index('Psalm 42:11')).text, /^Pourquoi t'abats-tu/);
  for (const locale of ['de', 'fr'] as const) {
    for (const verse of getVerses(locale)) {
      assert.doesNotMatch(
        verse.text,
        /^(Ein (Psalm|Lied)|Psaume (de|des)|Au maître-chantre|Cantique (de|des))/,
        `${locale} ${verse.reference} starts with a Psalm superscription`,
      );
    }
  }
});
