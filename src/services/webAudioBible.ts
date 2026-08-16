const BASE_URL = 'https://ebible.org/eng-web/audio/';

/** Canonical Protestant order, matching every bundled Lumen Bible. */
export const WEB_AUDIO_BOOK_DIRECTORIES = [
  '01_Genesis', '02_Exodus', '03_Leviticus', '04_Numbers', '05_Deuteronomy',
  '06_Joshua', '07_Judges', '08_Ruth', '09_First_Samuel', '10_Second_Samuel',
  '11_First_Kings', '12_Second_Kings', '13_First_Chronicles', '14_Second_Chronicles',
  '15_Ezra', '16_Nehemiah', '17_Esther', '18_Job', '19_Psalms', '20_Proverbs',
  '21_Ecclesiastes', '22_Song_of_Solomon', '23_Isaiah', '24_Jeremiah',
  '25_Lamentations', '26_Ezekiel', '27_Daniel', '28_Hosea', '29_Joel', '30_Amos',
  '31_Obadiah', '32_Jonah', '33_Micah', '34_Nahum', '35_Habakkuk', '36_Zephaniah',
  '37_Haggai', '38_Zechariah', '39_Malachi', '40_Matthew', '41_Mark', '42_Luke',
  '43_John', '44_Acts', '45_Romans', '46_First_Corinthians', '47_Second_Corinthians',
  '48_Galatians', '49_Ephesians', '50_Philippians', '51_Colossians',
  '52_First_Thessalonians', '53_Second_Thessalonians', '54_First_Timothy',
  '55_Second_Timothy', '56_Titus', '57_Philemon', '58_Hebrews', '59_James',
  '60_First_Peter', '61_Second_Peter', '62_First_John', '63_Second_John',
  '64_Third_John', '65_Jude', '66_Revelations',
] as const;

const cache = new Map<string, string[]>();

export function extractWebAudioUrls(html: string, directory: string): string[] {
  const directoryUrl = new URL(`${directory}/`, BASE_URL);
  const urls: string[] = [];
  const seen = new Set<string>();
  const links = html.matchAll(/href\s*=\s*["']([^"']+\.mp3(?:\?[^"']*)?)["']/gi);

  for (const match of links) {
    const url = new URL(match[1], directoryUrl);
    if (
      url.protocol !== 'https:'
      || url.hostname !== 'ebible.org'
      || !url.pathname.startsWith(directoryUrl.pathname)
      || seen.has(url.href)
    ) continue;
    seen.add(url.href);
    urls.push(url.href);
  }
  return urls;
}

export async function resolveWebAudioChapterUrl(
  bookIndex: number,
  chapterIndex: number,
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const directory = WEB_AUDIO_BOOK_DIRECTORIES[bookIndex];
  if (!directory || !Number.isInteger(chapterIndex) || chapterIndex < 0) {
    throw new Error('Invalid audio chapter');
  }

  let urls = cache.get(directory);
  if (!urls) {
    const response = await fetcher(`${BASE_URL}${directory}/`);
    if (!response.ok) throw new Error('Audio catalog unavailable');
    urls = extractWebAudioUrls(await response.text(), directory);
    if (urls.length === 0) throw new Error('Audio catalog empty');
    cache.set(directory, urls);
  }

  const url = urls[chapterIndex];
  if (!url) throw new Error('Audio chapter unavailable');
  return url;
}

export function clearWebAudioCache() {
  cache.clear();
}
