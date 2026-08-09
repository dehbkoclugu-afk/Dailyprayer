import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * Guards roadmap item 38: three state changes that were visual-only —
 * completing a ritual (already covered, see below), undoing one, finishing a
 * plan day, and reaching a guided prayer's last line — must reach TalkBack.
 *
 * Every existing "completed" action already calls `toast(...)`, and
 * `ToastHost` already announces every toast via `announceForAccessibility`
 * (guarded separately by its own file's tests, not duplicated here). What was
 * silent: the *undo* half in Today's ritual cards, marking a plan day
 * complete, and a guided prayer reaching its last line — none of which
 * toasted or announced anything.
 */

const read = (file: string) => readFileSync(join(...file.split('/')), 'utf8');

test('undoing a ritual announces itself, not just the completed path', () => {
  const source = read('app/(tabs)/today.tsx');
  // The completed path for each of the three rituals already toasts via its
  // own screen (devotional.tsx, journal.tsx, player.tsx) or, for verse, right
  // here. What this checks is the undo path specifically.
  assert.match(source, /uncompleteStep\(key\);\s*\n\s*toast\(translate\('today\.undone'\)\)/);
  for (const key of ['devotional', 'prayer', 'gratitude']) {
    assert.match(
      source,
      new RegExp(`isDone\\('${key}'\\) \\? undo\\('${key}'\\)`),
      `${key}'s ritual card should route its undo through the announcing helper`,
    );
  }
});

test('marking a plan day complete announces itself', () => {
  const source = read('app/plan/[id]/[day].tsx');
  assert.match(source, /toast\(tr\('plan\.dayCompletedToast'\)\)/);
  // Guarded by the same condition as the actual completion, so re-pressing an
  // already-complete day doesn't announce a completion that didn't happen.
  const complete = source.match(/const complete = \(\) => \{[\s\S]*?\n {2}\};/);
  assert.ok(complete, 'the complete() function');
  assert.match(complete[0], /if \(!done\) \{\s*\n\s*toggleDay\(plan\.id, dayIdx\);\s*\n\s*toast\(/);
});

test('a guided prayer reaching its last line announces the transition', () => {
  const source = read('app/player.tsx');
  assert.match(source, /if \(lastLine\) AccessibilityInfo\.announceForAccessibility\(tr\('player\.prayerEnded'\)\)/);
  // Keyed on lastLine alone, not line: it should fire once on entering the
  // state, not on every re-render while the state holds.
  const effect = source.match(/if \(lastLine\) AccessibilityInfo[\s\S]*?\}, \[([^\]]*)\]/);
  assert.ok(effect, 'the effect');
  assert.equal(effect[1].trim(), 'lastLine');
});
