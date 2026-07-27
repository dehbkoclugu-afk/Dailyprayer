/**
 * Reminder times.
 *
 * Stored as 24-hour `HH:MM` because that is unambiguous and sorts; *displayed* in
 * whatever the device uses, so a reader on a 12-hour locale sees "7:30 AM" and one
 * on a 24-hour locale sees "07:30" (roadmap item 17). The stored value never
 * changes with the display format.
 */

export interface TimeOfDay {
  hour: number;
  minute: number;
}

/** `'07:30'` → `{ hour: 7, minute: 30 }`. Null for anything malformed or "none". */
export function parseTime(value: string | null | undefined): TimeOfDay | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

/** `{ hour: 7, minute: 30 }` → `'07:30'`. The storage format, always 24-hour. */
export function toStoredTime({ hour, minute }: TimeOfDay): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hour)}:${pad(minute)}`;
}

/**
 * Whether this locale reads the clock in 24-hour form.
 *
 * The native Android picker needs to be told; iOS follows the system setting on
 * its own. Defaults to 24-hour if Intl cannot answer, matching the stored format.
 */
export function prefers24Hour(locale?: string): boolean {
  try {
    const resolved = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions();
    if (typeof resolved.hour12 === 'boolean') return !resolved.hour12;
    return resolved.hourCycle === 'h23' || resolved.hourCycle === 'h24';
  } catch {
    return true;
  }
}

/** A Date on an arbitrary day, for feeding the native picker. */
export function toDate(time: TimeOfDay, base = new Date()): Date {
  const date = new Date(base);
  date.setHours(time.hour, time.minute, 0, 0);
  return date;
}

/**
 * Format for display in the device's own clock convention.
 *
 * `locale` is passed through to Intl; leaving it undefined uses the runtime
 * default, which is what respects the user's 12/24-hour setting. Falls back to the
 * stored 24-hour string if Intl is unavailable or the value is malformed, so the
 * row never renders empty.
 */
export function formatTime(value: string | null | undefined, locale?: string): string | null {
  const time = parseTime(value);
  if (!time) return null;
  try {
    // timeStyle gives the locale's own canonical short time — "07:30" in Turkish,
    // "7:30 AM" in US English — rather than a pattern we impose on every language.
    return new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(
      toDate(time, new Date(2000, 0, 1)),
    );
  } catch {
    return toStoredTime(time);
  }
}
