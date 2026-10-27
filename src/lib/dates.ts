/** Pure date helpers for streaks and daily content rotation (local time). */

export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function yesterdayKey(d: Date = new Date()): string {
  return dayKey(addDays(d, -1));
}

/**
 * 0-based day of year, used to rotate 365-day content. Calendar fields are
 * compared in UTC so daylight-saving shifts never repeat or skip a day.
 */
export function dayOfYear(d: Date = new Date()): number {
  const today = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const start = Date.UTC(d.getFullYear(), 0, 1);
  return Math.round((today - start) / 86_400_000);
}

/** Calendar-day arithmetic in local time (DST-safe, unlike adding milliseconds). */
export function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

/** Milliseconds until the next local midnight (used to refresh day-bound UI). */
export function msUntilNextDay(d: Date = new Date()): number {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return next.getTime() - d.getTime();
}

export function greetingFor(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Given the last day the streak was ticked and the current streak count,
 * returns the new count for a tick happening "today".
 */
export function nextStreak(
  lastTickDay: string | null,
  count: number,
  today: Date = new Date(),
): number {
  const todayK = dayKey(today);
  if (lastTickDay === todayK) return count; // already ticked
  if (lastTickDay === yesterdayKey(today)) return count + 1;
  return 1; // broken or first day
}
