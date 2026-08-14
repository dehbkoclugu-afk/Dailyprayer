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
