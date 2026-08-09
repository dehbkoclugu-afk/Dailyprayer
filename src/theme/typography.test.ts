import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { type } from './typography.ts';

/**
 * Guards roadmap item 31: a typographic role used in more than one place has to
 * come from `type` (aliased `ty` at call sites), not be rebuilt from raw values
 * at each site.
 *
 * The concrete case: the small-caps label above a hero title — "VERSE OF THE
 * DAY", "CONTINUE READING", "CHAPTER 23" — was the same four raw values
 * (`fontSize: 11, letterSpacing: 2.5, textTransform: 'uppercase', fontFamily:
 * fonts.sansSemiBold`) written out independently in five files. Nothing kept
 * them in sync; the next screen to add one, or the next edit to any of the
 * five, was free to drift.
 *
 * This does not attempt the item's full scope — resolving *every* scattered
 * `fontSize` value in the app into a semantic role is a design decision (which
 * of 14 different raw sizes deserves its own name, and which two that happen to
 * share a pixel value are actually different roles) that visual regression on
 * ~150 sites is the wrong way to make unsupervised. What is guarded here is the
 * one cluster that was an exact, verbatim duplicate with no contextual
 * variation — pure deduplication, not a new design call.
 */

const ROOTS = ['app', 'src'];

function sourceFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx$/.test(entry)) out.push(path);
    }
  };
  for (const root of ROOTS) walk(root);
  return out;
}

test('the overline role exists and matches what it replaced', () => {
  assert.equal(type.overline.fontSize, 11);
  assert.equal(type.overline.letterSpacing, 2.5);
  assert.equal(type.overline.textTransform, 'uppercase');
});

test('no file rebuilds the overline label from raw values', () => {
  // The old shape: fontSize 11 and letterSpacing 2.5 declared within a few
  // lines of each other, outside typography.ts itself.
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    if (file.endsWith('typography.ts')) continue;
    const source = readFileSync(file, 'utf8');
    for (const m of source.matchAll(/fontSize:\s*11,/g)) {
      const window = source.slice(m.index, m.index + 120);
      if (/letterSpacing:\s*2\.5/.test(window)) offenders.push(file);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `overline label rebuilt from raw values instead of type.overline:\n${offenders.join('\n')}`,
  );
});

test('every known overline usage was migrated', () => {
  const sites = [
    'app/read.tsx',
    'app/(tabs)/today.tsx',
    'app/(tabs)/bible.tsx',
    'src/components/VerseCard.tsx',
  ];
  for (const file of sites) {
    const source = readFileSync(file, 'utf8');
    assert.match(source, /ty\.overline/, `${file} should use type.overline`);
  }
  // today.tsx has two (the header date/greeting area and the sleep-prayer card).
  const today = readFileSync(join('app', '(tabs)', 'today.tsx'), 'utf8');
  assert.equal([...today.matchAll(/ty\.overline/g)].length, 2);
});
