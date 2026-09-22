export function singleParam(value: string | string[] | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function integerParam(value: string | string[] | undefined): number | null {
  const raw = singleParam(value);
  if (raw == null || !/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function validPlanDay(day: string | string[] | undefined, dayCount: number): number | null {
  const parsed = integerParam(day);
  return parsed != null && parsed >= 0 && parsed < dayCount ? parsed : null;
}

export function validReaderPosition(
  book: string | string[] | undefined,
  chapter: string | string[] | undefined,
  chapterCounts: readonly number[],
): { book: number; chapter: number } | null {
  const b = integerParam(book);
  const c = integerParam(chapter);
  if (b == null || c == null || b < 0 || b >= chapterCounts.length) return null;
  if (c < 0 || c >= chapterCounts[b]) return null;
  return { book: b, chapter: c };
}
