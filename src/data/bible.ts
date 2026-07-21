/**
 * Built-in Bible sample — World English Bible (public domain).
 * v1 ships selected books offline; the full canon loads via bundled JSON at
 * build time (scripts/fetch-web-bible, phase 2) behind this same interface.
 */
export interface BibleChapter {
  book: string;
  chapter: number;
  verses: string[];
}

export const books = [
  'Genesis', 'Psalms', 'Proverbs', 'Isaiah', 'Matthew', 'Mark', 'Luke', 'John',
  'Romans', 'Philippians', 'James', '1 Peter', 'Revelation',
] as const;

export const sampleChapters: BibleChapter[] = [
  {
    book: 'Psalms',
    chapter: 23,
    verses: [
      'Yahweh is my shepherd; I shall lack nothing.',
      'He makes me lie down in green pastures. He leads me beside still waters.',
      'He restores my soul. He guides me in the paths of righteousness for his name’s sake.',
      'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me. Your rod and your staff, they comfort me.',
      'You prepare a table before me in the presence of my enemies. You anoint my head with oil. My cup runs over.',
      'Surely goodness and loving kindness shall follow me all the days of my life, and I will dwell in Yahweh’s house forever.',
    ],
  },
  {
    book: 'John',
    chapter: 1,
    verses: [
      'In the beginning was the Word, and the Word was with God, and the Word was God.',
      'The same was in the beginning with God.',
      'All things were made through him. Without him, nothing was made that has been made.',
      'In him was life, and the life was the light of men.',
      'The light shines in the darkness, and the darkness hasn’t overcome it.',
    ],
  },
  {
    book: 'Philippians',
    chapter: 4,
    verses: [
      'Therefore, my brothers, beloved and longed for, my joy and crown, stand firm in the Lord in this way, my beloved.',
      'I exhort Euodia, and I exhort Syntyche, to think the same way in the Lord.',
      'Rejoice in the Lord always! Again I will say, “Rejoice!”',
      'Let your gentleness be known to all men. The Lord is at hand.',
      'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.',
      'And the peace of God, which surpasses all understanding, will guard your hearts and your thoughts in Christ Jesus.',
    ],
  },
];

export function getChapter(book: string, chapter: number): BibleChapter | undefined {
  return sampleChapters.find((c) => c.book === book && c.chapter === chapter);
}
