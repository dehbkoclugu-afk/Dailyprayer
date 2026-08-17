import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migratedSurfaces = [
  '../app/(tabs)/today.tsx',
  '../app/(tabs)/bible.tsx',
  '../app/(tabs)/pray.tsx',
  '../app/paywall.tsx',
  '../app/player.tsx',
  '../src/components/PlanDayArtwork.tsx',
  '../src/components/ProgressRing.tsx',
  '../src/components/ToastHost.tsx',
];

test('roadmap surfaces consume semantic colors, scrims and press states', async () => {
  for (const path of migratedSurfaces) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /#[0-9A-F]{6}/i, `${path} contains a raw color`);
    assert.doesNotMatch(source, /pressed\s*\?\s*0\.(?:6|7|85)\b/, `${path} contains an ad-hoc press opacity`);
    assert.doesNotMatch(source, /backgroundColor:\s*['"]rgba\(0,0,0,/, `${path} contains a direct scrim`);
  }
});

test('ArtSlot callers use the semantic scrim API', async () => {
  const paths = [
    ...migratedSurfaces,
    '../app/search.tsx',
    '../app/library.tsx',
    '../app/plan/[id]/index.tsx',
    '../src/components/RitualCard.tsx',
    '../src/components/VerseCard.tsx',
  ];
  for (const path of paths) {
    const source = await readFile(new URL(path, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /<ArtSlot[^>]*\bvariant=/, `${path} uses the legacy ArtSlot API`);
  }
});

test('verse artwork stays visible in both themes beneath a copy-focused gradient', async () => {
  const source = await readFile(new URL('../src/components/VerseCard.tsx', import.meta.url), 'utf8');
  assert.match(source, /scrim="none"/);
  assert.match(source, /colors=\{dawn/);
  assert.match(source, /locations=\{\[0, 0\.52, 1\]\}/);
});

test('guided prayer keeps exactly one animated line and uses quiet section dots', async () => {
  const source = await readFile(new URL('../app/player.tsx', import.meta.url), 'utf8');
  assert.match(source, /key=\{line\}/);
  assert.doesNotMatch(source, /exiting=/);
  assert.doesNotMatch(source, /\{section \+ 1\}\/3/);
  assert.match(source, /width: section === activeSection \? 10 : 7/);
});

test('prayer copy has no stray spaces before commas', async () => {
  const source = await readFile(new URL('../src/data/prayers.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /\s+,/);
});

test('reading-plan artwork uses a bottom-only gradient instead of stacked fog', async () => {
  const catalog = await readFile(new URL('../app/(tabs)/bible.tsx', import.meta.url), 'utf8');
  const plan = await readFile(new URL('../app/plan/[id]/index.tsx', import.meta.url), 'utf8');
  const rows = await readFile(new URL('../src/components/PlanDayArtwork.tsx', import.meta.url), 'utf8');

  for (const source of [catalog, plan]) {
    assert.match(source, /scrim="none"/);
    assert.match(source, /locations=\{\[0, 0\.5, 1\]\}/);
    assert.doesNotMatch(source, /gradient\[0\].*CC/);
    assert.doesNotMatch(source, /gradient\[1\].*F2/);
  }
  assert.match(rows, /backgroundColor: artworkScrims\.soft/);
  assert.doesNotMatch(rows, /backgroundColor: artworkScrims\.strong/);
});

test('Today rhythm header shows completion ratio only in ProgressRing', async () => {
  const source = await readFile(new URL('../app/(tabs)/today.tsx', import.meta.url), 'utf8');
  assert.match(source, /right=\{<ProgressRing done=\{doneCount\} total=\{4\} size=\{46\} \/>\}/);
  assert.doesNotMatch(source, /today\.completed['"]\}\s*·\s*\{doneCount\}/);
});

test('tab navigation reserves filled icons and a marker for selected state', async () => {
  const source = await readFile(new URL('../app/(tabs)/_layout.tsx', import.meta.url), 'utf8');
  assert.match(source, /function TabIcon/);
  assert.match(source, /focused\s*\?\s*filled\s*:\s*outline/);
  assert.match(source, /testID="active-tab-marker"/);
  for (const pair of [
    ['sunny-outline', 'sunny'],
    ['book-outline', 'book'],
    ['flame-outline', 'flame'],
    ['create-outline', 'create'],
    ['person-outline', 'person'],
  ]) {
    assert.ok(pair.every((name) => source.includes(name)), `missing ${pair.join('/')} icon pair`);
  }
});

test('navigation layouts use only the three motion patterns with Reduce Motion', async () => {
  const root = await readFile(new URL('../app/_layout.tsx', import.meta.url), 'utf8');
  const tabs = await readFile(new URL('../app/(tabs)/_layout.tsx', import.meta.url), 'utf8');
  assert.match(root, /useReducedMotion\(\)/);
  assert.match(tabs, /useReducedMotion\(\)/);
  assert.match(root, /resolveMotionPattern\('sharedAxis'/);
  assert.match(root, /resolveMotionPattern\('container'/);
  assert.match(tabs, /resolveMotionPattern\('fadeThrough'/);
  assert.doesNotMatch(`${root}\n${tabs}`, /resolveMotionPattern\('(?!sharedAxis|fadeThrough|container)[^']+'/);
});
