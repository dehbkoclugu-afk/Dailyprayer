import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('bundled Bible payloads remain behind locale-scoped lazy loader functions', async () => {
  const source = await readFile(new URL('../src/data/bibleFull.ts', import.meta.url), 'utf8');
  for (const locale of ['tr', 'en', 'es', 'de']) {
    assert.match(source, new RegExp(`${locale}: \\(\\) => require\\('./bible-full\\.${locale}\\.json'\\)`));
  }
  assert.match(source, /if \(activeLocale !== locale\)/);
  assert.match(source, /delete cache\[cachedLocale\]/);
  assert.doesNotMatch(source, /^import .*bible-full\..*\.json/m);
});
