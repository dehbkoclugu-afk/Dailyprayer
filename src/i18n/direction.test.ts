import assert from 'node:assert/strict';
import test from 'node:test';
import { APPLICATION_LOCALE_CANDIDATES } from './applicationLocales.ts';
import {
  getApplicationDirection,
  getDirectionalIconName,
  isApplicationRTL,
} from './direction.ts';

test('Arabic and Persian are RTL and every other application candidate is LTR', () => {
  for (const candidate of APPLICATION_LOCALE_CANDIDATES) {
    const expectedDirection = candidate.tag === 'ar' || candidate.tag === 'fa' ? 'rtl' : 'ltr';
    assert.equal(getApplicationDirection(candidate.tag), expectedDirection, candidate.tag);
    assert.equal(isApplicationRTL(candidate.tag), expectedDirection === 'rtl', candidate.tag);
  }
});

test('Chinese and Serbian script variants remain LTR', () => {
  for (const locale of ['zh-Hans', 'zh-Hant', 'sr-Latn', 'sr-Cyrl'] as const) {
    assert.equal(getApplicationDirection(locale), 'ltr', locale);
  }
});

test('directional back and forward icons mirror only in RTL', () => {
  assert.equal(getDirectionalIconName('chevron-back', 'en'), 'chevron-back');
  assert.equal(getDirectionalIconName('chevron-forward', 'en'), 'chevron-forward');
  assert.equal(getDirectionalIconName('arrow-back', 'tr'), 'arrow-back');
  assert.equal(getDirectionalIconName('arrow-forward', 'tr'), 'arrow-forward');

  assert.equal(getDirectionalIconName('chevron-back', 'ar'), 'chevron-forward');
  assert.equal(getDirectionalIconName('chevron-forward', 'ar'), 'chevron-back');
  assert.equal(getDirectionalIconName('arrow-back', 'fa'), 'arrow-forward');
  assert.equal(getDirectionalIconName('arrow-forward', 'fa'), 'arrow-back');
});

test('playback controls never mirror', () => {
  assert.equal(getDirectionalIconName('play-skip-back', 'ar'), 'play-skip-back');
  assert.equal(getDirectionalIconName('play-skip-forward', 'fa'), 'play-skip-forward');
});
