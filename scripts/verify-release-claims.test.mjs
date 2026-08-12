import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyReleaseClaims } from './verify-release-claims.mjs';

test('current release claims match runtime evidence', () => {
  assert.deepEqual(verifyReleaseClaims(), []);
});

test('fails closed when runtime behavior drifts', () => {
  const failures = verifyReleaseClaims({
    readFile(path) {
      if (path === 'src/services/purchases.ts') return 'drifted';
      return new URL(`../${path}`, import.meta.url).pathname
        ? requireRead(path)
        : '';
    },
  });
  assert.ok(failures.some((failure) => failure.includes('store-prices-only')));
  assert.ok(failures.some((failure) => failure.includes('trial-eligibility')));
});

import { readFileSync } from 'node:fs';
function requireRead(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}
