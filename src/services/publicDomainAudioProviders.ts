const BOOK_CODES = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
] as const;

const cache = new Map<string, string[]>();

export function extractTrustedMp3Urls(html: string, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const match of html.matchAll(/(?:href|data-path)\s*=\s*["']([^"']+\.mp3(?:\?[^"']*)?)["']/gi)) {
    const url = new URL(match[1], base);
    if (url.protocol !== 'https:' || url.hostname !== base.hostname || !url.pathname.startsWith(base.pathname) || seen.has(url.href)) continue;
    seen.add(url.href);
    urls.push(url.href);
  }
  return urls;
}

export function resolveEbibleChapterUrl(id: 'turytc', bookIndex: number, chapterIndex: number): string {
  const code = BOOK_CODES[bookIndex];
  if (!code || !Number.isInteger(chapterIndex) || chapterIndex < 0) throw new Error('Invalid audio chapter');
  return `https://ebible.org/${id}/mp3/${code}${String(chapterIndex + 1).padStart(2, '0')}.mp3`;
}

async function catalog(url: string, fetcher: typeof fetch): Promise<string[]> {
  const hit = cache.get(url);
  if (hit) return hit;
  const response = await fetcher(url);
  if (!response.ok) throw new Error('Audio catalog unavailable');
  const urls = extractTrustedMp3Urls(await response.text(), url);
  if (!urls.length) throw new Error('Audio catalog empty');
  cache.set(url, urls);
  return urls;
}

export async function resolveSermonOnlineChapterUrl(baseUrl: string, bookIndex: number, chapterIndex: number, fetcher: typeof fetch = fetch): Promise<string> {
  if (!Number.isInteger(bookIndex) || bookIndex < 0 || bookIndex > 65 || !Number.isInteger(chapterIndex) || chapterIndex < 0) throw new Error('Invalid audio chapter');
  const prefix = `${String(bookIndex + 1).padStart(2, '0')}${String(chapterIndex + 1).padStart(3, '0')}`;
  const url = (await catalog(baseUrl, fetcher)).find((item) => decodeURIComponent(new URL(item).pathname.split('/').pop() ?? '').startsWith(prefix));
  if (!url) throw new Error('Audio chapter unavailable');
  return url;
}

export async function resolveSpanishChapterUrl(bookIndex: number, chapterIndex: number, fetcher: typeof fetch = fetch): Promise<string> {
  const page = 'https://publicdomainaudiobibles.com/RVA1909.html';
  let playlists = cache.get(page);
  if (!playlists) {
    const response = await fetcher(page);
    if (!response.ok) throw new Error('Audio catalog unavailable');
    playlists = [...(await response.text()).matchAll(/https:\/\/www\.publicdomainaudiobibles\.com\/playlist\/[^"']+\.xml/gi)].map((match) => match[0]);
    cache.set(page, playlists);
  }
  const playlist = playlists[bookIndex];
  if (!playlist) throw new Error('Audio book unavailable');
  const response = await fetcher(playlist);
  if (!response.ok) throw new Error('Audio catalog unavailable');
  const urls = extractTrustedMp3Urls(await response.text(), 'https://publicdomainaudiobibles.com/');
  const url = urls[chapterIndex];
  if (!url) throw new Error('Audio chapter unavailable');
  return url;
}

export async function resolveFrenchChapterUrl(bookIndex: number, chapterIndex: number, fetcher: typeof fetch = fetch): Promise<string> {
  const metadataUrl = 'https://archive.org/metadata/french_audiobible';
  let urls = cache.get(metadataUrl);
  if (!urls) {
    const response = await fetcher(metadataUrl);
    if (!response.ok) throw new Error('Audio catalog unavailable');
    const metadata = await response.json() as { files?: { name?: string; format?: string }[] };
    urls = (metadata.files ?? [])
      .filter((file) => file.format === 'VBR MP3' && file.name?.toLowerCase().endsWith('.mp3'))
      .map((file) => `https://archive.org/download/french_audiobible/${encodeURIComponent(file.name!)}`);
    cache.set(metadataUrl, urls);
  }
  const prefix = `${String(bookIndex + 1).padStart(2, '0')}_`;
  const suffix = `_${String(chapterIndex + 1).padStart(3, '0')}.mp3`;
  const url = urls.find((item) => decodeURIComponent(item).split('/').pop()?.startsWith(prefix) && decodeURIComponent(item).endsWith(suffix));
  if (!url) throw new Error('Audio chapter unavailable');
  return url;
}

export function clearPublicDomainAudioCache() {
  cache.clear();
}
