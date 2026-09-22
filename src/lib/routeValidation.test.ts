import assert from 'node:assert/strict';
import test from 'node:test';
import { integerParam, singleParam, validPlanDay, validReaderPosition } from './routeValidation.ts';

test('rejects arrays, blanks, decimals and non-numeric route values', () => {
  assert.equal(singleParam(['peace-7']), null);
  assert.equal(singleParam(''), null);
  assert.equal(integerParam('1.5'), null);
  assert.equal(integerParam('-1'), null);
  assert.equal(integerParam('wat'), null);
});

test('accepts only a day inside the selected plan', () => {
  assert.equal(validPlanDay('0', 7), 0);
  assert.equal(validPlanDay('6', 7), 6);
  assert.equal(validPlanDay('7', 7), null);
  assert.equal(validPlanDay(undefined, 7), null);
});

test('accepts only existing reader books and chapters', () => {
  const chapters = [50, 40];
  assert.deepEqual(validReaderPosition('1', '39', chapters), { book: 1, chapter: 39 });
  assert.equal(validReaderPosition('2', '0', chapters), null);
  assert.equal(validReaderPosition('1', '40', chapters), null);
  assert.equal(validReaderPosition('x', '0', chapters), null);
});
