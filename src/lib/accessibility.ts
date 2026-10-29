export function accessibleVerseLabel(reference: string, text: string): string {
  return `${reference}. ${text}`;
}

export function shouldAutoAdvancePrayer(
  paused: boolean,
  lastLine: boolean,
  screenReaderEnabled: boolean | null,
): boolean {
  return !paused && !lastLine && screenReaderEnabled === false;
}

export function categoryChipOffset(index: number, estimatedWidth = 112): number {
  return Math.max(0, index * estimatedWidth - 24);
}
