import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 43: the prayer library's "Show all" control already
 * had its 48dp row (`minHeight: TAP_MIN`), but its `style` was a plain
 * object, not a function of `pressed` — tapping it gave no visual feedback
 * at all, the one thing that told a sighted user it was a real button and
 * not just underlined-looking text.
 */

const source = readFileSync('app/(tabs)/pray.tsx', 'utf8');

test('the "Show all" control gives a real, filled tap area with a pressed state', () => {
  const start = source.indexOf("accessibilityLabel={tr('a11y.showAll')}");
  assert.ok(start > -1, 'expected the Show all Pressable');
  const nearby = source.slice(Math.max(0, start - 200), start + 300);
  assert.match(nearby, /style=\{\(\{ pressed \}\) => \(\{/, 'style should be a function of pressed');
  assert.match(nearby, /opacity: pressed \? 0\.6 : 1/, 'pressed should dim it, like every other Pressable in this file');
  assert.match(nearby, /paddingHorizontal: spacing\.sm/, 'the tap area should extend past the bare text');
});
