import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 45: the reading-settings sheet's two "A" buttons and a
 * percentage say how much bigger the text gets, not what a real paragraph
 * looks like at that size — line length and leading only show up once text
 * actually wraps.
 *
 * The preview must use the same size/leading formula `app/read.tsx` uses for
 * real verse text, or it would be demonstrating a size the reader doesn't
 * actually show.
 */

const sheet = readFileSync('src/components/ReadingSettingsSheet.tsx', 'utf8');
const reader = readFileSync('app/read.tsx', 'utf8');

test('the sheet renders a sample paragraph at the reader body font', () => {
  assert.match(sheet, /fontFamily: fonts\.serifLight/);
  assert.match(sheet, /fontSize: Math\.round\(18 \* fontScale\)/);
  assert.match(sheet, /lineHeight: Math\.round\(30 \* fontScale\)/);
  assert.match(sheet, /tr\('read\.sizePreview'\)/);
});

test("the preview's formula matches what read.tsx actually renders verse text at", () => {
  // Not just "some formula" — the exact one, so a future change to the
  // reader's own sizing doesn't leave the preview showing a stale size.
  assert.match(reader, /const bodySize = Math\.round\(18 \* fontScale\)/);
  assert.match(reader, /const bodyLine = Math\.round\(30 \* fontScale\)/);
  assert.match(reader, /fontFamily: fonts\.serifLight,\s*\n\s*fontSize: bodySize,\s*\n\s*lineHeight: bodyLine/);
});

test('the preview is hidden from screen readers rather than read aloud', () => {
  // A visual demonstration of line wrapping has nothing to say to someone
  // who can't see it — the percentage nearby already gives the number.
  const start = sheet.indexOf("tr('read.sizePreview')");
  const before = sheet.slice(Math.max(0, start - 400), start);
  assert.match(before, /accessibilityElementsHidden/);
  assert.match(before, /importantForAccessibility="no-hide-descendants"/);
});
