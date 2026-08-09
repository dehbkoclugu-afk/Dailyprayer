import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

/**
 * Guards roadmap item 44: the journal's per-entry delete icon already had
 * its 48dp box (`width/height: TAP_MIN`) — what it didn't have was any
 * visual sign it was there at all. A transparent hit area around an
 * 18px `inkFaint` glyph reads as decoration, not a destructive control.
 *
 * The fix is a light danger-tinted circle behind the icon, and the icon
 * itself recolored to match — both derived from the existing `danger`
 * token (just less opaque for the background), not a new named color.
 */

const source = readFileSync('app/(tabs)/journal.tsx', 'utf8');

test('the delete-entry control has a danger-tinted background and a matching icon', () => {
  const start = source.indexOf("accessibilityLabel={tr('a11y.deleteEntry')}");
  assert.ok(start > -1, 'expected the delete-entry Pressable');
  const nearby = source.slice(start, start + 900);
  assert.match(nearby, /width: TAP_MIN,\s*\n\s*height: TAP_MIN/, 'the 48dp box should still be there');
  assert.match(nearby, /backgroundColor: `\$\{t\.danger\}26`/, 'a light tint of the existing danger token');
  assert.match(nearby, /borderRadius: TAP_MIN \/ 2/, 'a full circle at this box size');
  assert.match(nearby, /color={t\.danger}/, 'the glyph itself should read as destructive too');
});
