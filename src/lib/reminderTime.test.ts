import assert from 'node:assert/strict';
import test from 'node:test';
import {
  displayReminderTime,
  eveningNudgeTime,
  parseStoredReminderTime,
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

test('strict stored-time parser rejects sentinels and malformed values', () => {
  assert.deepEqual(parseStoredReminderTime('21:00'), { hour: 21, minute: 0 });
  assert.equal(parseStoredReminderTime('none'), null);
  assert.equal(parseStoredReminderTime('7:5'), null);
  assert.equal(parseStoredReminderTime(null), null);
});

test('evening nudge never fires before a late daily reminder', () => {
  assert.deepEqual(eveningNudgeTime('07:30'), { hour: 20, minute: 30 });
  assert.deepEqual(eveningNudgeTime(null), { hour: 20, minute: 30 });
  assert.deepEqual(eveningNudgeTime('21:00'), { hour: 22, minute: 0 });
  assert.deepEqual(eveningNudgeTime('22:45'), { hour: 23, minute: 0 });
});
