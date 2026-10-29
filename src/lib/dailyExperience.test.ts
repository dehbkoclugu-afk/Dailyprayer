import assert from 'node:assert/strict';
import test from 'node:test';
import {
  countRecentActiveDays,
  groupJournalDays,
  nextDailyStep,
  prayerSection,
  shouldExpandTonight,
  streakTier,
} from './dailyExperience.ts';

test('daily rhythm always selects exactly the first unfinished step', () => {
  assert.equal(nextDailyStep([]), 'verse');
  assert.equal(nextDailyStep(['verse', 'prayer']), 'devotional');
  assert.equal(nextDailyStep(['verse', 'devotional', 'prayer', 'gratitude']), null);
});

test('Tonight expands only during the evening and overnight window', () => {
  assert.equal(shouldExpandTonight(4), true);
  assert.equal(shouldExpandTonight(12), false);
  assert.equal(shouldExpandTonight(17), false);
  assert.equal(shouldExpandTonight(18), true);
});

test('prayer progress resolves into beginning, middle, and closing thirds', () => {
  assert.equal(prayerSection(0, 6), 0);
  assert.equal(prayerSection(2, 6), 1);
  assert.equal(prayerSection(5, 6), 2);
});

test('journal entries group by day while preserving newest-first order', () => {
  const groups = groupJournalDays([
    { id: 'a', day: '2026-08-13', kind: 'gratitude', text: 'a', createdAt: 1 },
    { id: 'b', day: '2026-08-14', kind: 'gratitude', text: 'b', createdAt: 3 },
    { id: 'c', day: '2026-08-14', kind: 'gratitude', text: 'c', createdAt: 2 },
  ]);
  assert.deepEqual(groups.map((group) => group.day), ['2026-08-14', '2026-08-13']);
  assert.deepEqual(groups[0].entries.map((entry) => entry.id), ['b', 'c']);
  assert.equal(groups[0].startsMonth, true);
  assert.equal(groups[1].startsMonth, false);
});

test('profile context counts unique recent days and assigns useful tiers', () => {
  const now = new Date(2026, 7, 14, 12);
  assert.equal(countRecentActiveDays(['2026-08-08', '2026-08-09', '2026-08-09', '2026-08-14'], now), 3);
  assert.equal(streakTier(1), 'start');
  assert.equal(streakTier(3), 'growing');
  assert.equal(streakTier(7), 'strong');
});
