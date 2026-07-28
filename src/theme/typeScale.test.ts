import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fonts, reader, type } from './typography.ts';

/**
 * Guards roadmap item 31: text sizes come from a role, not from a literal.
 *
 * There were twenty-one distinct `fontSize` values across 163 call sites, crossed
 * with five weights. Nothing chose between them, so the same kind of text was 13
 * on one screen and 14 on the next, and "make supporting text bigger" meant
 * finding every one of them — which is exactly what item 32 asks for next.
 *
 * Two rules, both readable from source:
 *
 *  1. No `fontSize` literal outside this module. A number at a call site is a
 *     decision made in the wrong place.
 *  2. No raw font-family string outside this module, for the same reason —
 *     `fonts.sans` is findable, `'Figtree_400Regular'` is not. The font loader
 *     in app/_layout.tsx is the one legitimate exception: expo-font is given the
 *     real names, and that is what the tokens resolve to.
 *
 * What this cannot check is whether a call site picked the *right* role — a
 * caption using `type.title` passes. The rendered result was checked in a browser
 * across 13 views instead (`scripts/measure-tap-targets.mjs` fails on page errors
 * and on any control that shrank).
 */

const ROOTS = ['app', 'src'];

/** expo-font must be handed the real family names; the tokens resolve to these. */
const FONT_LOADER = 'app/_layout.tsx';

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

test('every role carries both a size and a leading', () => {
  // A size with no line height is half a decision, and the half that gets left to
  // the platform is the one that differs between iOS and Android.
  for (const [role, style] of Object.entries(type)) {
    assert.ok(style.fontSize > 0, `${role} has no fontSize`);
    assert.ok(style.lineHeight >= style.fontSize, `${role} leading is tighter than its size`);
    assert.ok(
      Object.values(fonts).includes(style.fontFamily),
      `${role} uses a family that is not a token`,
    );
  }
});

test('the scale has no two roles of the same family and size', () => {
  // Two names for one style is the drift this item exists to remove.
  const seen = new Map<string, string>();
  for (const [role, style] of Object.entries(type)) {
    const key = `${style.fontFamily}@${style.fontSize}`;
    const first = seen.get(key);
    assert.equal(first, undefined, `${role} duplicates ${first}`);
    seen.set(key, role);
  }
});

test('no call site sets a font size of its own', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/fontSize:\s*(\d+)/g)) {
      offenders.push(`${file}:${source.slice(0, match.index).split('\n').length} fontSize: ${match[1]}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `font sizes declared outside the scale:\n${offenders.join('\n')}\n` +
      'Spread a role from @/theme/typography instead, e.g. { ...type.callout, color: t.ink }.',
  );
});

test('no call site names a font family directly', () => {
  const offenders: string[] = [];
  for (const file of sourceFiles()) {
    if (file === FONT_LOADER) continue;
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/['"](Fraunces|Figtree)_\w+['"]/g)) {
      offenders.push(`${file}:${source.slice(0, match.index).split('\n').length} ${match[0]}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `raw font families outside the tokens:\n${offenders.join('\n')}\n` +
      `Use fonts.* from @/theme/typography (${FONT_LOADER} is exempt — it loads them).`,
  );
});

test('the loader registers exactly the families the tokens resolve to', () => {
  // A token pointing at a family nobody loaded renders as the system font, which
  // looks like a design decision rather than a missing file.
  const loader = readFileSync(FONT_LOADER, 'utf8');
  for (const family of new Set(Object.values(fonts))) {
    assert.ok(loader.includes(family), `${family} is a token but is never loaded`);
  }
});

test('the reader keeps its own base sizes, and keeps them here', () => {
  // Scripture is the one text with a user-facing size control, so it is a base
  // times a multiplier rather than a fixed step — but the bases were four more
  // literals buried in read.tsx.
  assert.ok(reader.body > type.body.fontSize, 'sustained reading should not be smaller than UI body');
  assert.ok(reader.line > reader.body, 'reading leading must be looser than its size');
  assert.ok(reader.dropCapRatio > 1, 'a drop cap is larger than the text it opens');

  const source = readFileSync('app/read.tsx', 'utf8');
  assert.match(source, /reader\.body \* fontScale/, 'the reader stopped using the shared base');
  assert.match(source, /reader\.dropCapRatio/, 'the drop cap ratio drifted back into the screen');
});
