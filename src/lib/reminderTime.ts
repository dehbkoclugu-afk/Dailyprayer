const STORED_TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseReminderTime(value: string | null, fallback = new Date()): Date {
  const result = new Date(fallback);
  const match = value?.match(STORED_TIME);
  if (!match) return result;
  result.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return result;
}

export function toStoredReminderTime(value: Date): string {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

export function displayReminderTime(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' })
    .format(parseReminderTime(value));
}
