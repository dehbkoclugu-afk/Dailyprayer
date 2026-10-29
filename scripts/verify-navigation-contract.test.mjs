import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('Android predictive back is enabled', async () => {
  const config = JSON.parse(await read('app.json'));
  assert.equal(config.expo.android.predictiveBackGestureEnabled, true);
  assert.match(
    await read('app/_layout.tsx'),
    /<Stack\.Screen name="player" options=\{\{ presentation: 'modal' \}\} \/>/,
    'the player must remain a dismissible native stack modal',
  );
});

test('reader and reader action sheets handle the Android back request', async () => {
  for (const path of [
    'app/read.tsx',
    'src/components/OptionSheet.tsx',
    'src/components/ReadingSettingsSheet.tsx',
    'src/components/VerseActionSheet.tsx',
  ]) {
    const source = await read(path);
    const modalCount = source.match(/<Modal\b/g)?.length ?? 0;
    const backHandlerCount = source.match(/\bonRequestClose=/g)?.length ?? 0;
    assert.equal(backHandlerCount, modalCount, `${path} must close every modal on Android back`);
  }
});

test('secondary screens use the shared top app bar', async () => {
  for (const path of [
    'app/search.tsx',
    'app/library.tsx',
    'app/plan/[id]/[day].tsx',
    'app/devotional.tsx',
    'app/legal.tsx',
  ]) {
    assert.match(await read(path), /<TopAppBar\b/, `${path} must use TopAppBar`);
  }
});
