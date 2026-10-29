import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('release bundle budgets cover JS, all assets, a single bitmap and bundled Scripture', async () => {
  const budget = JSON.parse(await readFile(new URL('../config/bundle-budget.json', import.meta.url), 'utf8'));
  assert.equal(budget.maxBundleBytes, 60 * 1024 * 1024);
  assert.ok(budget.maxAssetBytes > budget.maxSingleAssetBytes);
  assert.ok(budget.maxBundledScriptureBytes < 30 * 1024 * 1024);
});

test('budget scanner counts extensionless Expo export assets', async () => {
  const source = await readFile(new URL('./verify-bundle-budget.mjs', import.meta.url), 'utf8');
  assert.match(source, /includes\('assets'\)/);
  assert.match(source, /!bundlePaths\.has\(path\)/);
});
