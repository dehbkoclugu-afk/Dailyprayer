import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * Guards roadmap item 30: a container that overlays text on art, or holds text
 * next to a fixed frame, must not clip that text when the system font size is
 * large.
 *
 * The concrete bugs: `ArtSlot` — the single component behind the paywall hero,
 * every plan card, the Bible tab's "continue reading" hero and Tonight card —
 * used `height` combined with `overflow: 'hidden'`. A title plus a benefit list
 * at a large system font size needs more than the box's fixed height, and
 * `overflow: 'hidden'` cuts off whatever does not fit rather than letting the
 * card grow. `VerseCard` had the same shape: the verse itself scrolls, but the
 * label above it and the reference/credit row below it do not, and those two
 * rows alone can approach the card's fixed 320dp at a large font size. The
 * Today streak badge was the same defect without `overflow: 'hidden'`: a fixed
 * 64×64 box just let a three-digit streak spill past its own border instead of
 * widening.
 *
 * The fix in all three is the same one-word change: `minHeight` in place of
 * `height` (and `minWidth` in place of `width` where the box holds a row, not a
 * column). A floor preserves the design's usual size; only a lack of room grows
 * it, and only as far as the content actually needs.
 */

test('ArtSlot uses a floor, not a fixed height, for its frame', () => {
  const source = readFileSync(join('src', 'components', 'ArtSlot.tsx'), 'utf8');
  assert.match(
    source,
    /\{\s*minHeight:\s*height,/,
    'ArtSlot must pass its height prop through as minHeight — every hero, plan ' +
      'card, and Tonight card overlays text on this frame and shares whatever bug ' +
      'is here',
  );
  // The exact regression: `{ height, ...}` back on the root View.
  assert.doesNotMatch(source, /\{\s*height,\s*borderRadius/);
});

test('VerseCard’s frame grows for its non-scrolling rows', () => {
  const source = readFileSync(join('src', 'components', 'VerseCard.tsx'), 'utf8');
  assert.match(source, /\{\s*minHeight:\s*320,/, 'the card frame must not be a fixed height');
  assert.doesNotMatch(source, /\{\s*height:\s*320,/);
});

test('the streak badge widens instead of clipping a long streak', () => {
  const source = readFileSync(join('app', '(tabs)', 'today.tsx'), 'utf8');
  assert.match(source, /minWidth:\s*64,/, 'the badge needs a floor, not a fixed width');
  assert.match(source, /minHeight:\s*64,/, 'the badge needs a floor, not a fixed height');
  assert.doesNotMatch(source, /width:\s*64,\s*\n\s*height:\s*64,/, 'the old fixed box must be gone');
});
