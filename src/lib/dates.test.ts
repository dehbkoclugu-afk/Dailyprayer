import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, dayKey, nextStreak, dayOfYear, greetingFor, msUntilNextDay } from './dates.ts';

test('dayKey formats local date', () => {
  assert.equal(dayKey(new Date(2026, 6, 21)), '2026-07-21');
});

test('nextStreak increments after consecutive day', () => {
  const today = new Date(2026, 6, 21);
  assert.equal(nextStreak('2026-07-20', 4, today), 5);
});

test('nextStreak is idempotent same day', () => {
  const today = new Date(2026, 6, 21);
  assert.equal(nextStreak('2026-07-21', 4, today), 4);
});

test('nextStreak resets after gap', () => {
  const today = new Date(2026, 6, 21);
  assert.equal(nextStreak('2026-07-18', 9, today), 1);
  assert.equal(nextStreak(null, 0, today), 1);
});

test('dayOfYear rotates content', () => {
  assert.equal(dayOfYear(new Date(2026, 0, 1)), 0);
  assert.equal(dayOfYear(new Date(2026, 0, 31)), 30);
});

test('greetingFor buckets hours', () => {
  assert.equal(greetingFor(6), 'morning');
  assert.equal(greetingFor(13), 'afternoon');
  assert.equal(greetingFor(21), 'evening');
});

test('dayOfYear advances exactly once per calendar day across DST changes', () => {
  // Runs in whatever TZ the test process uses; CI also runs it under DST zones.
  let previous = dayOfYear(new Date(2026, 0, 1, 0, 30));
  for (let day = 2; day <= 365; day++) {
    const early = dayOfYear(new Date(2026, 0, day, 0, 30));
    const late = dayOfYear(new Date(2026, 0, day, 23, 30));
    assert.equal(early, previous + 1, `day ${day} early`);
    assert.equal(late, early, `day ${day} late`);
    previous = early;
  }
});

test('addDays and msUntilNextDay use calendar days', () => {
  assert.equal(dayKey(addDays(new Date(2026, 2, 28, 12), 2)), '2026-03-30');
  assert.equal(msUntilNextDay(new Date(2026, 6, 21, 23, 0)), 3_600_000);
});
