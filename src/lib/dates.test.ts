import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dayKey, nextStreak, dayOfYear, greetingFor } from './dates.ts';

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

test('dayOfYear advances with the local calendar across a daylight-saving change', () => {
  // Run in a zone that shifts its clock, independent of the machine's own timezone.
  const source = `
    const { dayOfYear, dayKey } = await import('${new URL('./dates.ts', import.meta.url).pathname}');
    const days = new Map();
    for (let hour = 0; hour < 24; hour += 1) {
      for (const day of [7, 8, 9]) {
        const at = new Date(2026, 2, day, hour, 30);
        const seen = days.get(dayKey(at));
        if (seen !== undefined && seen !== dayOfYear(at)) throw new Error('day of year moved within one calendar day');
        days.set(dayKey(at), dayOfYear(at));
      }
    }
    const indices = [...days.values()];
    if (new Set(indices).size !== days.size) throw new Error('two calendar days share one content index');
    for (let i = 1; i < indices.length; i += 1) {
      if (indices[i] - indices[i - 1] !== 1) throw new Error('content index skipped or repeated a day');
    }
  `;
  const result = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '--eval', source], {
    env: { ...process.env, TZ: 'America/New_York' },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
});

test('greetingFor buckets hours', () => {
  assert.equal(greetingFor(6), 'morning');
  assert.equal(greetingFor(13), 'afternoon');
  assert.equal(greetingFor(21), 'evening');
});
