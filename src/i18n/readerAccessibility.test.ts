import assert from 'node:assert/strict';
import test from 'node:test';
import { SUPPORTED_LOCALES } from './applicationLocales.ts';
import { getReaderAccessibilityCopy } from './readerAccessibility.ts';
import { HIGHLIGHT_ORDER, HIGHLIGHT_SYMBOL } from '../theme/highlights.ts';

test('reader accessibility copy covers every advertised application locale', () => {
  for (const locale of SUPPORTED_LOCALES) {
    const copy = getReaderAccessibilityCopy(locale);
    assert.ok(copy.openVerseActions.trim(), `${locale} needs an open-action label`);
    for (const color of HIGHLIGHT_ORDER) {
      assert.ok(copy.colors[color].trim(), `${locale} needs a human label for ${color}`);
      assert.notEqual(copy.colors[color], color, `${locale} must not expose the lowercase storage key ${color}`);
    }
  }
});

test('highlight swatches have unique non-color shape cues', () => {
  const symbols = HIGHLIGHT_ORDER.map((color) => HIGHLIGHT_SYMBOL[color]);
  assert.equal(new Set(symbols).size, HIGHLIGHT_ORDER.length);
  assert.ok(symbols.every((symbol) => symbol.trim().length > 0));
});
