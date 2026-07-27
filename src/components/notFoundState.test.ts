import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { translations } from '../i18n/translations.ts';

/**
 * Guards roadmap item 19: an unknown plan, day, prayer, passage or route must not
 * produce a blank dark screen.
 *
 * Source-level, because these are screens reaching `@/` aliases and native
 * modules. What is checked is the shape of the failure: no bare background View,
 * a designed state with a named way out, and strict parameter parsing.
 */

const LOCALES = ['tr', 'en', 'es', 'pt', 'fr', 'de'] as const;

const files = {
  notFoundState: 'src/components/NotFoundState.tsx',
  planIndex: 'app/plan/[id]/index.tsx',
  planDay: 'app/plan/[id]/[day].tsx',
  player: 'app/player.tsx',
  read: 'app/read.tsx',
  route: 'app/+not-found.tsx',
} as const;

const source = Object.fromEntries(
  Object.entries(files).map(([key, path]) => [key, readFileSync(path, 'utf8')]),
) as Record<keyof typeof files, string>;

/** Comments quote the old code on purpose; assertions must look at code only. */
const codeOnly = (text: string) =>
  text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('no screen answers a missing thing with a blank background', () => {
  // This exact line was the bug: a full-bleed View in the theme background, with
  // no text and no affordance to leave.
  for (const [name, text] of Object.entries(source)) {
    assert.ok(
      !/return <View style=\{\{ flex: 1, backgroundColor: t\.bg \}\} \/>/.test(codeOnly(text)),
      `${name} still returns a blank background view`,
    );
  }
});

test('every dead end explains itself and names a way out', () => {
  for (const key of ['planIndex', 'planDay', 'player', 'read', 'route'] as const) {
    assert.match(source[key], /<NotFoundState/, `${key} should use the designed state`);
    assert.match(source[key], /title=\{tr\('notFound\./, `${key} needs a title`);
    assert.match(source[key], /body=\{tr\('notFound\./, `${key} needs an explanation`);
    assert.match(source[key], /actionLabel=\{tr\('notFound\./, `${key} needs a named action`);
    assert.match(source[key], /onAction=\{\(\) => router\.replace\(/, `${key} needs a safe destination`);
  }
  // And a second way out when there is somewhere to go back to.
  assert.match(source.notFoundState, /router\.canGoBack\(\)/);
  assert.match(source.notFoundState, /tr\('notFound\.back'\)/);
});

test('the plan day is parsed strictly and bounded by the plan', () => {
  // `Number(day) || 0` turned "abc" into day 1 and let day 9999 render a clamped
  // reading under a "Day 10000" heading.
  assert.ok(!/Number\(day\) \|\| 0/.test(codeOnly(source.planDay)), 'the day must not fall back to 0');
  assert.match(source.planDay, /Number\.isInteger\(parsedDay\)/);
  assert.match(source.planDay, /dayIdx < 0 \|\| dayIdx >= plan\.days/, 'the day must be inside the plan');
});

test('a bad reference cannot poison the saved reading position', () => {
  // setPos(Number('abc'), 1) wrote NaN to the persisted store, and the next render
  // did bible[NaN].chapters — a crash, not a blank screen.
  const effect = source.read.slice(source.read.indexOf('if (params.b == null'));
  assert.match(effect, /Number\.isInteger\(b\) \|\| !Number\.isInteger\(c\)/);
  assert.match(effect, /b < 0 \|\| b >= bible\.length/);
  assert.match(effect, /c < 0 \|\| c >= bible\[b\]\.chapters\.length/);
  const guarded = effect.indexOf('setPos(b, c)');
  assert.ok(guarded > effect.indexOf('bible[b].chapters.length'), 'validate before writing');
});

test('the reader clamps to a real position instead of indexing NaN', () => {
  assert.match(source.read, /Number\.isInteger\(value\) \? Math\.min\(Math\.max\(value, 0\), max\) : 0/);
  assert.match(source.read, /const verses = bk\?\.chapters\[cIdx\]/, 'the lookup must be optional');
});

test('an unknown prayer is not silently swapped for another', () => {
  assert.ok(
    !/prayers\.find\(\(p\) => p\.id === id\) \?\? prayers\[0\]/.test(codeOnly(source.player)),
    'the player must not fall back to a different prayer',
  );
  // The hooks moved into an inner component so the guard can return early.
  assert.match(source.player, /function PlayerScreen\(\{ prayer \}/);
  assert.match(source.player, /return <PlayerScreen prayer=\{prayer\} \/>/);
});

test('every dead end speaks all six languages', () => {
  const keys = [
    'notFound.back',
    'notFound.planTitle',
    'notFound.planBody',
    'notFound.planAction',
    'notFound.dayTitle',
    'notFound.dayBody',
    'notFound.dayAction',
    'notFound.prayerTitle',
    'notFound.prayerBody',
    'notFound.prayerAction',
    'notFound.passageTitle',
    'notFound.passageBody',
    'notFound.passageAction',
    'notFound.routeTitle',
    'notFound.routeBody',
    'notFound.routeAction',
  ];
  for (const locale of LOCALES) {
    const dict = translations[locale] as Record<string, string>;
    for (const key of keys) {
      assert.ok(dict[key], `${locale} is missing ${key}`);
      if (locale !== 'en') {
        assert.notEqual(
          dict[key],
          (translations.en as Record<string, string>)[key],
          `${locale}.${key} is still English`,
        );
      }
    }
  }
});
