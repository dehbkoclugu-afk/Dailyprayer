import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { localeUpper } from '../lib/text.ts';

/**
 * Guards roadmap item 33: text rendered through `textTransform: 'uppercase'`
 * must reach the screen already correctly cased for the app's own language,
 * not whatever the platform's locale-insensitive (iOS) or device-locale (Android)
 * uppercase mapping produces.
 *
 * Turkish is the one supported language where this matters: lowercase dotted
 * `i` capitalises to `İ` (dotted), and every other supported language's default
 * mapping gets that wrong, producing the plain ASCII `I` instead. The concrete,
 * currently-live bug this was causing: Today's date line renders its month name
 * in caps, and "Nisan" (April) — via `textTransform: 'uppercase'` alone — came
 * out "NISAN" instead of the correct "NİSAN", every April, for every Turkish
 * reader.
 *
 * `localeUpper` (exposed to components as `up` from `useT()`) uses
 * `String.prototype.toLocaleUpperCase`, which handles the exception correctly.
 * Applying it does not require removing `textTransform: 'uppercase'` from a
 * style: uppercasing an already-correctly-cased Turkish `İ` is a no-op, so the
 * style stays as a harmless second pass and nothing needed to change there.
 */

test('localeUpper gets the Turkish dotted-i exception right', () => {
  assert.equal(localeUpper('nisan', 'tr'), 'NİSAN');
  assert.equal(localeUpper('ışık', 'tr'), 'IŞIK');
  // The other five languages have no equivalent exception; confirming this
  // doesn't accidentally change their output versus a plain uppercase.
  for (const [locale, text] of [
    ['en', 'verse of the day'],
    ['es', 'versículo del día'],
    ['pt', 'versículo do dia'],
    ['fr', 'verset du jour'],
    ['de', 'vers des tages'],
  ] as const) {
    assert.equal(localeUpper(text, locale), text.toUpperCase());
  }
});

/** Every render site known to feed text into an uppercase-transformed Text. */
const SITES: [string, RegExp][] = [
  ['app/read.tsx', /\{up\(`\$\{tr\('read\.chapter'\)\}/],
  ['app/(tabs)/today.tsx', /\{up\(dateLine\)\}/],
  ['app/(tabs)/today.tsx', /\{up\(tr\('today\.sleepPrayer'\)\)\}/],
  ['app/(tabs)/bible.tsx', /\{up\(tr\('read\.continue'\)\)\}/],
  ['src/components/VerseCard.tsx', /\{up\(tr\('today\.verseOfDay'\)\)\}/],
  ['app/plan/[id]/[day].tsx', /\{up\(`\$\{plan\.title\}/],
  ['app/plan/[id]/[day].tsx', /\{up\(tr\('plan\.todaysReading'\)\)\}/],
  ['app/devotional.tsx', /\{up\(tr\('devotional\.label'\)\)\}/],
  ['app/(tabs)/journal.tsx', /\{up\(tr\('journal\.gratitude'\)\)\}/],
  ['app/(tabs)/journal.tsx', /\{up\(e\.ref\)\}/],
  ['src/components/OptionSheet.tsx', /\{up\(title\)\}/],
  ['src/components/VerseActionSheet.tsx', /\{up\(verse\.ref\)\}/],
];

test('every known uppercase-transformed Text is fed pre-cased content', () => {
  const bySource = new Map<string, string>();
  const offenders: string[] = [];
  for (const [file, pattern] of SITES) {
    if (!bySource.has(file)) bySource.set(file, readFileSync(join(...file.split('/')), 'utf8'));
    if (!pattern.test(bySource.get(file)!)) offenders.push(`${file}: ${pattern}`);
  }
  assert.deepEqual(
    offenders,
    [],
    `uppercase-styled text not routed through up():\n${offenders.join('\n')}`,
  );
});

test('every file with textTransform: uppercase is accounted for above', () => {
  // If a new uppercase style is added without a matching entry above, this says
  // so rather than the new site silently shipping the platform's wrong casing.
  const filesWithUppercaseStyle = new Set(
    [
      'app/read.tsx',
      'app/(tabs)/today.tsx',
      'app/(tabs)/bible.tsx',
      'src/components/VerseCard.tsx',
      'app/plan/[id]/[day].tsx',
      'app/devotional.tsx',
      'app/(tabs)/journal.tsx',
      'src/components/OptionSheet.tsx',
      'src/components/VerseActionSheet.tsx',
      'src/theme/typography.ts',
    ].filter((file) => /textTransform: 'uppercase'/.test(readFileSync(join(...file.split('/')), 'utf8'))),
  );
  const covered = new Set([...SITES.map(([file]) => file), 'src/theme/typography.ts']);
  const uncovered = [...filesWithUppercaseStyle].filter((f) => !covered.has(f));
  assert.deepEqual(uncovered, [], `new uppercase style with no up() coverage:\n${uncovered.join('\n')}`);
});
