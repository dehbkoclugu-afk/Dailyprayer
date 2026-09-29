export type ScriptureFilter = 'all' | 'old' | 'new' | `book:${number}`;

export function newTestamentStart(bookCodes: readonly string[]) {
  const matthew = bookCodes.indexOf('MAT');
  return matthew >= 0 ? matthew : Math.min(39, bookCodes.length);
}

export function filterIncludesBook(filter: ScriptureFilter, bookIndex: number, testamentStart: number) {
  if (filter === 'all') return true;
  if (filter === 'old') return bookIndex < testamentStart;
  if (filter === 'new') return bookIndex >= testamentStart;
  return bookIndex === Number(filter.slice(5));
}

export function searchSnippet(text: string, matchAt: number, matchLength: number, radius = 54) {
  const start = Math.max(0, matchAt - radius);
  const end = Math.min(text.length, matchAt + matchLength + radius);
  return {
    pre: `${start > 0 ? '…' : ''}${text.slice(start, matchAt)}`,
    match: text.slice(matchAt, matchAt + matchLength),
    post: `${text.slice(matchAt + matchLength, end)}${end < text.length ? '…' : ''}`,
  };
}
