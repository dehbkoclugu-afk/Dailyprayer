import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { TERMS_OF_SERVICE } from './legal.ts';

test('Terms disclose global Scripture sourcing and sensitive rights limits', () => {
  assert.match(TERMS_OF_SERVICE, /40 checksum-pinned source\s+editions/);
  assert.match(TERMS_OF_SERVICE, /Yorumsuz Türkçe Çeviri/);
  assert.match(TERMS_OF_SERVICE, /© 2023-2025 İsmail\s+Serinken and eBible\.org/);
  assert.match(TERMS_OF_SERVICE, /CC BY-ND 4\.0/);
  assert.match(TERMS_OF_SERVICE, /not public domain/i);
  assert.match(TERMS_OF_SERVICE, /https:\/\/ebible\.org\/turytc\/copyright\.htm/);
  assert.match(TERMS_OF_SERVICE, /https:\/\/www\.crosswire\.org\/sword\/modules/);
  assert.match(TERMS_OF_SERVICE, /https:\/\/github\.com\/seven1m\/open-bibles/);
  assert.match(TERMS_OF_SERVICE, /Public-domain status can depend on\s+jurisdiction/);
  assert.doesNotMatch(TERMS_OF_SERVICE, /All Scripture.*public domain/i);
});

test('hosted Terms mirror the Scripture disclosure', () => {
  const hosted = readFileSync('docs/legal/terms-of-service.md', 'utf8');
  assert.match(hosted, /40 checksum-pinned source\s+editions/);
  assert.match(hosted, /Yorumsuz Türkçe Çeviri/);
  assert.match(hosted, /CC BY-ND 4\.0/);
  assert.match(hosted, /not public domain/i);
});
