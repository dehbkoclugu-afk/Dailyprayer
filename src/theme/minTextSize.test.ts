import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * Guards roadmap item 32: nothing renders below Material's label-small floor
 * (11sp).
 *
 * Three `Text`s were at 10sp: both "PLUS" badges (Today's locked sleep prayer,
 * Pray's locked category rows) and `ArtSlot`'s dev-only placeholder caption. All
 * three are raised to 11.
 *
 * This checks the floor is not crossed again; it does not attempt the item's
 * other half. `pray.tsx`'s badge pairs `t.gold` text on a `t.goldSoft`
 * background, and that pair fails WCAG's 4.5:1 minimum for small text in the
 * Dawn (light) theme at 2.66:1 — computed while verifying this item, not fixed
 * by it. `t.onGold`, the token that exists for text-on-gold, makes it worse
 * (1.22:1): it is calibrated for solid `gold`, not the paler `goldSoft`, so the
 * fix is a new colour decision, not a wrong-token bug. See the plan doc.
 */

const ROOTS = ['app', 'src'];

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx$/.test(entry) && !/\.test\.tsx$/.test(entry)) out.push(path);
    }
  };
  for (const root of ROOTS) walk(root);
  return out;
}

test('no Text renders below Material’s label-small floor (11sp)', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/fontSize:\s*(\d+)/g)) {
      const size = Number(match[1]);
      if (size < 11) {
        const line = source.slice(0, match.index).split('\n').length;
        offenders.push(`${file}:${line} fontSize: ${size}`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `text below Material’s 11sp label-small floor:\n${offenders.join('\n')}\n` +
      'Raise it, or if a specific case is genuinely exempt, say why here.',
  );
});
