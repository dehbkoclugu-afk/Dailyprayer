import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

/**
 * Guards roadmap items 34 and 35: an accessibility label is user-facing text,
 * and user-facing text goes through the translator like everything else.
 *
 * Six labels were hardcoded English, found by reading every
 * `accessibilityLabel={\`...\`}` template literal in the app and checking its
 * literal (non-`${}`) segments: "Verse of the day", ", requires Plus" (twice,
 * worded differently in each place), ", locked", "day streak" and "completed
 * today". `StreakFlame`'s was worse than hardcoded — it was a second,
 * conflicting label nested inside a `View` that Today already labels
 * correctly, so translating it in place would have kept two overlapping
 * announcements instead of one correct one.
 *
 * `today.dayStreak` also turned up an instance of a bug already fixed
 * elsewhere: a counted noun read with the plain translator
 * (`${count} ${tr('today.dayStreak')}`) — the same shape as the
 * "1 días seguidos" fix, just missed at this call site during that pass.
 */

const read = (file: string) => readFileSync(join(...file.split('/')), 'utf8');

test('the six known hardcoded-English labels are gone', () => {
  const cases: [string, RegExp][] = [
    ['src/components/VerseCard.tsx', /Verse of the day/],
    ['app/(tabs)/bible.tsx', /requires Plus/],
    ['app/(tabs)/pray.tsx', /· Plus/],
    ['src/components/RitualCard.tsx', /, locked'/],
    ['src/components/StreakFlame.tsx', /day streak/],
    ['src/components/ProgressRing.tsx', /completed today/],
  ];
  for (const [file, pattern] of cases) {
    // The doc comments deliberately quote the old string as history; only the
    // live code (with comment lines stripped) must be clean of it.
    const codeOnly = read(file)
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
    assert.doesNotMatch(codeOnly, pattern, `${file} still hardcodes English`);
  }
});

test('the new shared keys exist and are actually used', () => {
  const sites: [string, RegExp][] = [
    ['src/components/VerseCard.tsx', /tr\('today\.verseOfDay'\)\}, \$\{verse\.reference\}/],
    ['app/(tabs)/bible.tsx', /locked \? tr\('a11y\.requiresPlus'\)/],
    ['app/(tabs)/pray.tsx', /p\.plus \? tr\('a11y\.requiresPlus'\)/],
    ['src/components/RitualCard.tsx', /locked \? tr\('a11y\.locked'\)/],
    ['app/(tabs)/today.tsx', /tn\(count, 'today\.dayStreak'\)/],
    ['app/(tabs)/today.tsx', /tr\('today\.completedToday'\)/],
    ['src/components/ProgressRing.tsx', /tr\('today\.completedToday'\)/],
  ];
  for (const [file, pattern] of sites) {
    assert.match(read(file), pattern, `${file} should reference the shared key`);
  }
});

test('StreakFlame no longer announces itself separately', () => {
  // Its own label used to conflict with the one Today's wrapper already gives
  // the same badge; it should now be a decorative pass-through instead.
  const source = read('src/components/StreakFlame.tsx');
  assert.doesNotMatch(source, /accessibilityLabel=/);
  assert.match(source, /importantForAccessibility="no"/);
  assert.match(source, /accessibilityElementsHidden/);
});

test('Today’s streak badge carries both the count and the completed-today state', () => {
  // A single source of truth, in the one place a screen reader actually lands
  // on this badge.
  const expected =
    "accessibilityLabel={`${count} ${tn(count, 'today.dayStreak')}${litToday ? `, ${tr('today.completedToday')}` : ''}`}";
  assert.ok(read('app/(tabs)/today.tsx').includes(expected), 'the streak badge label');
});
