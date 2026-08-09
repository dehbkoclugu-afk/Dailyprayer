import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 42: selecting a prayer-category chip near either edge
 * of the horizontal row used to leave it clipped by the screen edge, with no
 * way to tell — short of scrolling manually — that it was even the active
 * one. Six categories (`src/data/prayers.ts`) render wider than a phone
 * screen, so this isn't a rare edge case; "Strength", the last chip, starts
 * off-screen on a typical device width.
 *
 * `cat` changing now scrolls the row just far enough to bring the newly
 * selected chip fully into the viewport — not to center it, not to scroll
 * on every render, only the minimum needed when the chip's edge is already
 * past the visible bound. `useReducedMotion()` (the same hook items 36/37
 * added elsewhere) turns the scroll's own animation off when the OS asks
 * for it, same as everything else that moves in this app.
 */

const source = readFileSync('app/(tabs)/pray.tsx', 'utf8');

test('the chip row tracks its own scroll position and viewport width', () => {
  assert.match(source, /const chipScrollRef = useRef<ScrollView>\(null\)/);
  assert.match(source, /viewport\.current\.width = e\.nativeEvent\.layout\.width/);
  assert.match(source, /viewport\.current\.x = e\.nativeEvent\.contentOffset\.x/);
});

test('every chip records its own layout, keyed by category', () => {
  assert.match(
    source,
    /chipLayouts\.current\[c\.key\] = \{ x: e\.nativeEvent\.layout\.x, width: e\.nativeEvent\.layout\.width \}/,
  );
});

test('selecting a category scrolls it into view and respects reduced motion', () => {
  assert.match(source, /useEffect\(\(\) => \{\s*if \(cat === 'all'\) return;/);
  assert.match(source, /const reduceMotion = useReducedMotion\(\);/);
  assert.match(source, /chipScrollRef\.current\?\.scrollTo\(\{ x: target, animated: !reduceMotion \}\)/);
});

test('the effect only scrolls when the chip is actually out of view, not on every selection', () => {
  // Two separate bounds checks — left edge and right edge — not an
  // unconditional scrollTo on every `cat` change.
  assert.match(source, /chip\.x < scrollX \+ spacing\.xl/);
  assert.match(source, /chip\.x \+ chip\.width > scrollX \+ viewportW - spacing\.xl/);
});
