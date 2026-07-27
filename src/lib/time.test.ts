import assert from 'node:assert/strict';
import test from 'node:test';
import { formatTime, parseTime, prefers24Hour, toDate, toStoredTime } from './time.ts';

test('parses a stored time', () => {
  assert.deepEqual(parseTime('07:30'), { hour: 7, minute: 30 });
  assert.deepEqual(parseTime('00:00'), { hour: 0, minute: 0 });
  assert.deepEqual(parseTime('23:59'), { hour: 23, minute: 59 });
  assert.deepEqual(parseTime('7:05'), { hour: 7, minute: 5 });
});

test('rejects anything that is not a time', () => {
  // 'none' is the stored value for "no reminder" and must not parse as midnight.
  for (const value of ['none', '', null, undefined, '24:00', '12:60', '-1:00', '7:5', 'abc', '07-30']) {
    assert.equal(parseTime(value), null, `${String(value)} should not parse`);
  }
});

test('round-trips through the storage format', () => {
  for (const value of ['00:00', '07:30', '12:00', '21:00', '23:59']) {
    assert.equal(toStoredTime(parseTime(value)!), value);
  }
  assert.equal(toStoredTime({ hour: 7, minute: 5 }), '07:05');
});

test('builds a Date on the given day with seconds cleared', () => {
  const date = toDate({ hour: 21, minute: 5 }, new Date(2026, 6, 26, 13, 44, 33, 500));
  assert.equal(date.getHours(), 21);
  assert.equal(date.getMinutes(), 5);
  assert.equal(date.getSeconds(), 0);
  assert.equal(date.getMilliseconds(), 0);
  assert.equal(date.getDate(), 26, 'the day must not shift');
});

test('displays in the locale’s own clock convention', () => {
  // The point of item 17: the stored value is always 24-hour, the display is not.
  const morning = formatTime('07:30', 'en-US');
  assert.match(morning ?? '', /7:30/);
  assert.match(morning ?? '', /AM/i, 'a 12-hour locale should show a meridiem');

  const evening = formatTime('21:00', 'en-US');
  assert.match(evening ?? '', /9:00/);
  assert.match(evening ?? '', /PM/i);

  for (const locale of ['tr-TR', 'de-DE', 'fr-FR']) {
    const formatted = formatTime('21:00', locale) ?? '';
    assert.match(formatted, /21[:.]00/, `${locale} should stay on a 24-hour clock`);
    assert.doesNotMatch(formatted, /AM|PM/i, `${locale} should have no meridiem`);
  }
});

test('formatting never returns an empty string for a real time', () => {
  for (const value of ['00:00', '07:30', '12:00', '23:59']) {
    const formatted = formatTime(value, 'en-GB');
    assert.ok(formatted && formatted.length > 0, `${value} formatted to nothing`);
  }
});

test('formatting a non-time returns null so callers can show "off"', () => {
  for (const value of ['none', '', null, undefined]) {
    assert.equal(formatTime(value, 'en-US'), null);
  }
});

test('detects which clock a locale reads', () => {
  assert.equal(prefers24Hour('en-US'), false);
  for (const locale of ['tr-TR', 'de-DE', 'fr-FR', 'es-ES', 'pt-BR']) {
    assert.equal(prefers24Hour(locale), true, `${locale} should be 24-hour`);
  }
  // Unanswerable locale must not silently claim 12-hour, which would mislabel times.
  assert.equal(prefers24Hour('not a locale!'), true);
});

test('an unusable locale falls back to the stored 24-hour string', () => {
  // Intl throws on a malformed tag; the row must still render something truthful.
  assert.equal(formatTime('07:30', 'not a locale!'), '07:30');
});
