import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 49: the player's remaining-time text should update
 * live but quietly, and separately from the per-line verse announcement —
 * not folded into one loud, everything-at-once announcement.
 *
 * Two changes, checked separately since they were opposite fixes to the
 * same underlying conflict:
 *  - the verse text lost its own `accessibilityLiveRegion` — it remounts on
 *    every line (`key={line}`), which a live region needs *not* to happen
 *    to fire correctly, and the explicit `announceForAccessibility` call
 *    already reads exactly this text once on its own; keeping both risked
 *    the same line being read twice.
 *  - the remaining-time text gained its own `accessibilityLiveRegion=
 *    "polite"` plus an explicit label, so it updates on its own, quietly
 *    (`"polite"` queues rather than interrupting), independent of the verse
 *    announcement.
 */

const source = readFileSync('app/player.tsx', 'utf8');

test('the remaining-time text has its own quiet, separate live region', () => {
  const start = source.indexOf('player.guidedText');
  assert.ok(start > -1);
  const nearby = source.slice(Math.max(0, start - 400), start + 400);
  assert.match(nearby, /accessibilityLiveRegion="polite"/);
  assert.match(nearby, /accessibilityLabel=\{`\$\{tr\('player\.guidedText'\)\}, /);
});

test('the verse text no longer carries a conflicting live region of its own', () => {
  // Scoped to the verse's own Animated.Text block specifically — not a
  // blanket "no accessibilityLiveRegion anywhere in the file" rule, since
  // the remaining-time text above is supposed to have one.
  const verseBlock = source.match(/<Animated\.Text\s+key=\{line\}[\s\S]*?<\/Animated\.Text>/);
  assert.ok(verseBlock, 'expected the per-line verse Animated.Text');
  assert.doesNotMatch(verseBlock[0], /accessibilityLiveRegion/);
});

test('the verse text is still announced exactly once, by the explicit call', () => {
  assert.match(source, /AccessibilityInfo\.announceForAccessibility\(prayer\.script\[line\]\)/);
});
