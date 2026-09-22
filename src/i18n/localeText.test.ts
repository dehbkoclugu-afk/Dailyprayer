import assert from 'node:assert/strict';
import test from 'node:test';
import { localeUpperCase } from './localeText.ts';

test('uppercases UI labels with locale-specific casing', () => {
  assert.equal(localeUpperCase('iyi geceler', 'tr'), 'İYİ GECELER');
  assert.equal(localeUpperCase('continue', 'en'), 'CONTINUE');
});
