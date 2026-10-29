const STORED_TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Strict 'HH:mm' parser; null for anything else (including 'none'). */
export function parseStoredReminderTime(value: string | null | undefined): { hour: number; minute: number } | null {
  const match = value?.match(STORED_TIME);
  return match ? { hour: Number(match[1]), minute: Number(match[2]) } : null;
}

export function parseReminderTime(value: string | null, fallback = new Date()): Date {
  const result = new Date(fallback);
  const parsed = parseStoredReminderTime(value);
  if (!parsed) return result;
  result.setHours(parsed.hour, parsed.minute, 0, 0);
  return result;
}

export function toStoredReminderTime(value: Date): string {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

export function displayReminderTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' })
    .format(parseReminderTime(value));
}

const DEFAULT_EVENING = { hour: 20, minute: 30 };

/** Evening nudge time: 20:30, or an hour after a late reminder so it never comes first. */
export function eveningNudgeTime(reminder: string | null): { hour: number; minute: number } {
  const parsed = parseStoredReminderTime(reminder);
  if (!parsed) return DEFAULT_EVENING;
  const reminderMinutes = parsed.hour * 60 + parsed.minute;
  const defaultMinutes = DEFAULT_EVENING.hour * 60 + DEFAULT_EVENING.minute;
  if (reminderMinutes < defaultMinutes) return DEFAULT_EVENING;
  const nudge = Math.min(reminderMinutes + 60, 23 * 60);
  return { hour: Math.floor(nudge / 60), minute: nudge % 60 };
}
