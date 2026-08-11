import assert from 'node:assert/strict';
import test from 'node:test';
import {
  displayReminderTime,
  parseReminderTime,
  toStoredReminderTime,
} from './reminderTime.ts';

test('parses strict HH:mm into a local Date and falls back on invalid storage', () => {
  const fallback = new Date(2026, 0, 2, 9, 15, 30);
  const parsed = parseReminderTime('07:05', fallback);
  assert.equal(parsed.getHours(), 7);
  assert.equal(parsed.getMinutes(), 5);
  assert.equal(parsed.getSeconds(), 0);

  const invalid = parseReminderTime('25:90', fallback);
  assert.equal(invalid.getHours(), 9);
  assert.equal(invalid.getMinutes(), 15);
  assert.notEqual(invalid, fallback);
});

test('stores zero-padded local time and displays the locale clock convention', () => {
  const value = new Date(2026, 0, 2, 7, 5);
  assert.equal(toStoredReminderTime(value), '07:05');
  assert.match(displayReminderTime('07:05', 'en-US'), /7:05.*AM/i);
  const british = displayReminderTime('07:05', 'en-GB');
  assert.match(british, /7:05/);
  assert.doesNotMatch(british, /AM|PM/i);
});
