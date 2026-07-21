/**
 * Generates src/data/verses.ts with authentic World English Bible (public
 * domain) text for a curated ~360-day reference list.
 *
 * Source: local WEB JSON (TehShrike/world-english-bible), cloned into
 * scratchpad. Set WEB_JSON_DIR to the json/ folder. No network, no rate limits.
 *   WEB_JSON_DIR=/path/to/web-bible/json node scripts/fetch-verses.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const JSON_DIR =
  process.env.WEB_JSON_DIR ??
  '/tmp/claude-0/-home-user-Dailyprayer/f91ded5e-aea9-5d96-8382-fec692f22844/scratchpad/web-bible/json';

// theme -> references. Themes key the A5 verse-art series.
const CURATED = {
  peace: ['Psalm 46:10','John 14:27','Philippians 4:6-7','Isaiah 26:3','Psalm 4:8','Matthew 5:9','Colossians 3:15','Romans 15:13','Psalm 29:11','Isaiah 54:10','John 16:33','2 Thessalonians 3:16','Psalm 85:8','Numbers 6:24-26','Psalm 119:165','Romans 12:18','James 3:18','Isaiah 32:17','Mark 4:39','Romans 5:1','Ephesians 2:14','Psalm 37:37','Isaiah 55:12','Psalm 34:14','Hebrews 12:14','Matthew 11:29','Psalm 3:5','Isaiah 48:18'],
  strength: ['Philippians 4:13','Isaiah 40:31','Psalm 46:1','Isaiah 41:10','2 Corinthians 12:9','Psalm 28:7','Nehemiah 8:10','Ephesians 6:10','Psalm 18:32','Isaiah 40:29','Habakkuk 3:19','Psalm 73:26','1 Chronicles 16:11','Psalm 27:1','Exodus 15:2','Deuteronomy 31:6','Psalm 118:14','2 Timothy 1:7','Isaiah 12:2','Psalm 138:3','Colossians 1:11','1 Corinthians 16:13','Psalm 31:24','Joshua 1:9','Zechariah 4:6','1 Peter 5:10','Psalm 59:16','Psalm 105:4'],
  trust: ['Proverbs 3:5-6','Psalm 23:1','Jeremiah 17:7','Psalm 56:3','Isaiah 26:4','Psalm 37:5','Psalm 9:10','Nahum 1:7','Psalm 62:8','Proverbs 29:25','Psalm 20:7','Psalm 112:7','Psalm 125:1','Romans 8:28','Psalm 31:14','Psalm 13:5','Psalm 40:4','Psalm 84:12','Proverbs 16:3','Psalm 32:10','John 14:1','Psalm 143:8','Psalm 91:2','2 Samuel 22:31','Hebrews 13:6','Psalm 33:21'],
  rest: ['Matthew 11:28','Psalm 23:2-3','Exodus 33:14','Psalm 62:1','Mark 6:31','Hebrews 4:9-10','Psalm 127:2','Jeremiah 31:25','Psalm 116:7','Isaiah 30:15','Psalm 91:1','Matthew 11:29-30','Genesis 2:2-3','Isaiah 40:11','Psalm 37:7','Ecclesiastes 4:6','Psalm 131:2','Zephaniah 3:17','Psalm 55:6','Jeremiah 6:16'],
  hope: ['Jeremiah 29:11','Romans 15:13','Psalm 42:11','Lamentations 3:22-23','Romans 5:5','Hebrews 11:1','Psalm 71:14','Romans 8:24-25','1 Peter 1:3','Psalm 130:5','Proverbs 23:18','Romans 12:12','Psalm 33:18','Micah 7:7','Hebrews 6:19','Psalm 39:7','Titus 2:13','Psalm 147:11','Lamentations 3:25','Job 11:18','Psalm 62:5','Zechariah 9:12','Romans 8:38-39','1 Corinthians 13:13','Colossians 1:27','Psalm 25:5','Proverbs 13:12','Psalm 27:14'],
  anxiety: ['Philippians 4:6','1 Peter 5:7','Matthew 6:34','Psalm 55:22','Matthew 6:25-26','Isaiah 41:13','Psalm 94:19','Psalm 34:4','Proverbs 12:25','Matthew 6:27','Psalm 46:1-2','Luke 12:25-26','Psalm 56:3-4','Isaiah 43:1-2','Deuteronomy 31:8','Psalm 121:1-2','Romans 8:31','Psalm 118:6','Isaiah 35:4','Psalm 23:4'],
  guidance: ['Psalm 119:105','Proverbs 3:6','Psalm 32:8','Isaiah 30:21','Psalm 25:4-5','James 1:5','Psalm 48:14','Proverbs 16:9','Isaiah 58:11','Psalm 37:23','John 16:13','Psalm 73:24','Proverbs 11:14','Psalm 143:10','Isaiah 42:16','Luke 1:79','Psalm 23:3','Proverbs 4:11','Jeremiah 33:3','Psalm 25:9','Psalm 16:11','Proverbs 2:6','Psalm 27:11','Isaiah 2:3'],
  joy: ['Psalm 118:24','Psalm 16:11','John 15:11','Psalm 30:5','Galatians 5:22','Psalm 126:5','James 1:2-3','Psalm 100:1-2','John 16:22','Psalm 47:1','Habakkuk 3:18','Psalm 4:7','1 Thessalonians 5:16','Psalm 32:11','Luke 2:10','Psalm 92:4','Isaiah 61:10','Proverbs 17:22','Psalm 63:5','Psalm 5:11','John 17:13','Acts 2:28','Psalm 71:23','Psalm 98:4'],
  love: ['1 Corinthians 13:4-5','John 3:16','1 John 4:19','John 15:12','1 John 4:7','Romans 5:8','1 Corinthians 13:13','John 13:34-35','Ephesians 3:17-19','1 John 4:16','Psalm 86:15','Jeremiah 31:3','1 Peter 4:8','Song of Solomon 8:7','Romans 13:10','Colossians 3:14','1 John 3:1','Psalm 103:8','Ephesians 2:4-5','Galatians 2:20','Psalm 36:7','Mark 12:30-31','Deuteronomy 7:9','John 15:13','Proverbs 10:12','1 John 4:18'],
  gratitude: ['1 Thessalonians 5:18','Psalm 107:1','Psalm 100:4','Colossians 3:17','Psalm 118:1','Psalm 9:1','Colossians 2:6-7','Psalm 136:1','Ephesians 5:20','Psalm 95:2','James 1:17','2 Corinthians 9:15','Psalm 103:2','Psalm 69:30','1 Chronicles 16:34','Psalm 116:12','Hebrews 12:28','Psalm 92:1','Psalm 75:1','Psalm 111:1'],
  comfort: ['Psalm 23:4','2 Corinthians 1:3-4','Matthew 5:4','Psalm 34:18','Isaiah 49:13','Psalm 147:3','Isaiah 66:13','Psalm 119:76','Revelation 21:4','Psalm 71:21','Isaiah 51:12','Psalm 94:19','Isaiah 61:2-3','Psalm 116:8','Psalm 86:17','Isaiah 40:1','Psalm 30:11','Romans 8:18','Psalm 56:8','Isaiah 25:8'],
  faith: ['Hebrews 11:1','Mark 11:24','2 Corinthians 5:7','Matthew 17:20','Romans 10:17','James 1:6','Ephesians 2:8-9','Mark 9:23','Hebrews 11:6','1 Peter 1:8-9','John 20:29','Matthew 21:22','James 2:17','1 John 5:4','Habakkuk 2:4','Psalm 27:13','Mark 5:36','Hebrews 10:23','2 Timothy 4:7','1 Corinthians 2:5'],
  forgiveness: ['1 John 1:9','Ephesians 4:32','Psalm 103:12','Colossians 3:13','Matthew 6:14','Isaiah 1:18','Micah 7:18-19','Psalm 32:5','Luke 6:37','Acts 3:19','Isaiah 43:25','Matthew 18:21-22','Psalm 51:10','Hebrews 8:12','Mark 11:25','Psalm 86:5','Romans 8:1','Psalm 130:3-4'],
};

// Map spoken book names -> WEB json filenames.
const FILE = (book) => book.toLowerCase().replace(/\s+/g, '') + '.json';
const NAME_FIX = { 'psalm': 'psalms', 'song of solomon': 'songofsolomon', 'songofsolomon': 'songofsolomon' };

const cache = new Map();
function loadBook(book) {
  const key = NAME_FIX[book.toLowerCase()] ?? book.toLowerCase().replace(/\s+/g, '');
  if (cache.has(key)) return cache.get(key);
  const path = join(JSON_DIR, `${key}.json`);
  if (!existsSync(path)) throw new Error(`no file ${key}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  cache.set(key, data);
  return data;
}

function parseRef(ref) {
  // "1 Corinthians 13:4-5" -> { book, chapter, v1, v2 }
  const m = ref.match(/^(\d?\s?[A-Za-z ]+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) throw new Error(`bad ref ${ref}`);
  const [, book, ch, a, b] = m;
  return { book: book.trim(), chapter: +ch, v1: +a, v2: b ? +b : +a };
}

function verseText(ref) {
  const { book, chapter, v1, v2 } = parseRef(ref);
  const data = loadBook(book);
  const parts = [];
  for (const node of data) {
    if (
      (node.type === 'line text' || node.type === 'paragraph text') &&
      node.chapterNumber === chapter &&
      node.verseNumber >= v1 &&
      node.verseNumber <= v2 &&
      typeof node.value === 'string'
    ) {
      parts.push(node.value);
    }
  }
  const text = parts.join(' ').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
  if (!text) throw new Error(`empty ${ref}`);
  return text;
}

const entries = [];
const failed = [];
const seen = new Set();
for (const [theme, refs] of Object.entries(CURATED)) {
  for (const ref of refs) {
    if (seen.has(ref)) continue; // a verse belongs to its first theme only
    seen.add(ref);
    try {
      entries.push({ text: verseText(ref), reference: ref, theme });
    } catch (e) {
      failed.push(`${ref}: ${e.message}`);
    }
  }
}

// Interleave themes so consecutive days vary.
const byTheme = {};
for (const e of entries) (byTheme[e.theme] ??= []).push(e);
const pools = Object.values(byTheme);
const interleaved = [];
let added = true;
while (added) {
  added = false;
  for (const pool of pools) {
    const item = pool.shift();
    if (item) { interleaved.push(item); added = true; }
  }
}

const themeUnion = Object.keys(CURATED).map((t) => `'${t}'`).join(' | ');
const body = interleaved
  .map((e) => `  { text: ${JSON.stringify(e.text)}, reference: ${JSON.stringify(e.reference)}, theme: '${e.theme}' },`)
  .join('\n');

const OUT = new URL('../src/data/verses.ts', import.meta.url).pathname;
writeFileSync(
  OUT,
  `/**
 * Daily verses — World English Bible (public domain).
 * GENERATED by scripts/fetch-verses.mjs from the WEB JSON source — edit the
 * curated reference list in that script, not this file. ${interleaved.length} entries,
 * theme-interleaved for day-of-year rotation.
 */
export interface DailyVerse {
  text: string;
  reference: string;
  theme: ${themeUnion};
}

export const verses: DailyVerse[] = [
${body}
];
`,
);

console.log(`Wrote ${interleaved.length} verses to src/data/verses.ts`);
if (failed.length) {
  console.log(`Failed (${failed.length}):`);
  failed.forEach((f) => console.log(' -', f));
}
