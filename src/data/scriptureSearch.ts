import type { FullBook } from './bibleFull';

export interface ScriptureHit {
  book: number;
  chapter: number;
  verse: number;
  ref: string;
  text: string;
  at: number;
}

const lower = (value: string) => value.toLocaleLowerCase('tr');
const yieldToUI = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Cooperative search: a book is the largest uninterrupted unit. Yielding between
 * books keeps typing, keyboard animation and screen readers responsive on low-end
 * devices without shipping a native search dependency.
 */
export async function searchScripture(
  bible: FullBook[],
  query: string,
  filter: 'all' | 'old' | 'new' | number,
  limit = 300,
): Promise<ScriptureHit[]> {
  const needle = lower(query);
  const out: ScriptureHit[] = [];
  for (let b = 0; b < bible.length; b++) {
    if (typeof filter === 'number' && b !== filter) continue;
    if (filter === 'old' && b >= 39) continue;
    if (filter === 'new' && b < 39) continue;
    const book = bible[b];
    for (let c = 0; c < book.chapters.length; c++) {
      for (let v = 0; v < book.chapters[c].length; v++) {
        const text = book.chapters[c][v][1];
        const at = lower(text).indexOf(needle);
        if (at !== -1) {
          out.push({ book: b, chapter: c, verse: v, ref: `${book.name} ${c + 1}:${book.chapters[c][v][0]}`, text, at });
          if (out.length >= limit) return out;
        }
      }
    }
    await yieldToUI();
  }
  return out;
}
