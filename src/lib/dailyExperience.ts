import type { JournalEntry } from '@/state/useJournalStore';
import type { RitualStep } from '@/state/useStreakStore';

export const DAILY_STEPS: readonly RitualStep[] = [
  'verse',
  'devotional',
  'prayer',
  'gratitude',
];

export function nextDailyStep(done: readonly RitualStep[]): RitualStep | null {
  return DAILY_STEPS.find((step) => !done.includes(step)) ?? null;
}

export function shouldExpandTonight(hour: number): boolean {
  return hour >= 18 || hour < 5;
}

export function prayerSection(line: number, total: number): 0 | 1 | 2 {
  if (total <= 1) return 2;
  return Math.min(2, Math.floor((Math.max(0, line) * 3) / total)) as 0 | 1 | 2;
}

export interface JournalDayGroup {
  day: string;
  month: string;
  startsMonth: boolean;
  entries: JournalEntry[];
}

export function groupJournalDays(entries: readonly JournalEntry[]): JournalDayGroup[] {
  const byDay = new Map<string, JournalEntry[]>();
  for (const entry of [...entries].sort((a, b) => b.createdAt - a.createdAt)) {
    const group = byDay.get(entry.day) ?? [];
    group.push(entry);
    byDay.set(entry.day, group);
  }

  let previousMonth = '';
  return [...byDay.entries()].map(([day, dayEntries]) => {
    const month = day.slice(0, 7);
    const startsMonth = month !== previousMonth;
    previousMonth = month;
    return { day, month, startsMonth, entries: dayEntries };
  });
}

export function countRecentActiveDays(
  activeDays: readonly string[],
  now: Date = new Date(),
  windowDays = 7,
): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - (windowDays - 1));
  const startKey = [
    start.getFullYear(),
    String(start.getMonth() + 1).padStart(2, '0'),
    String(start.getDate()).padStart(2, '0'),
  ].join('-');
  const endKey = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  return new Set(activeDays.filter((day) => day >= startKey && day <= endKey)).size;
}

export function streakTier(count: number): 'start' | 'growing' | 'strong' {
  if (count >= 7) return 'strong';
  if (count >= 3) return 'growing';
  return 'start';
}
