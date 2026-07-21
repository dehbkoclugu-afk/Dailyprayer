/**
 * Daily verses — World English Bible (public domain).
 * Rotates by day-of-year; expand toward 365 entries before launch.
 */
export interface DailyVerse {
  text: string;
  reference: string;
  theme: string;
}

export const verses: DailyVerse[] = [
  { text: 'Be still, and know that I am God.', reference: 'Psalm 46:10', theme: 'peace' },
  { text: 'I can do all things through Christ, who strengthens me.', reference: 'Philippians 4:13', theme: 'strength' },
  { text: 'Yahweh is my shepherd; I shall lack nothing.', reference: 'Psalm 23:1', theme: 'trust' },
  { text: 'Come to me, all you who labor and are heavily burdened, and I will give you rest.', reference: 'Matthew 11:28', theme: 'rest' },
  { text: 'For I know the thoughts that I think toward you, says Yahweh — thoughts of peace, and not of evil, to give you hope and a future.', reference: 'Jeremiah 29:11', theme: 'hope' },
  { text: 'Trust in Yahweh with all your heart, and don’t lean on your own understanding.', reference: 'Proverbs 3:5', theme: 'trust' },
  { text: 'In nothing be anxious, but in everything, by prayer and petition with thanksgiving, let your requests be made known to God.', reference: 'Philippians 4:6', theme: 'anxiety' },
  { text: 'Your word is a lamp to my feet, and a light for my path.', reference: 'Psalm 119:105', theme: 'guidance' },
  { text: 'But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles.', reference: 'Isaiah 40:31', theme: 'strength' },
  { text: 'This is the day that Yahweh has made. We will rejoice and be glad in it!', reference: 'Psalm 118:24', theme: 'joy' },
  { text: 'Cast all your worries on him, because he cares for you.', reference: '1 Peter 5:7', theme: 'anxiety' },
  { text: 'The light shines in the darkness, and the darkness hasn’t overcome it.', reference: 'John 1:5', theme: 'hope' },
  { text: 'Love is patient and is kind. Love doesn’t envy. Love doesn’t brag, is not proud.', reference: '1 Corinthians 13:4', theme: 'love' },
  { text: 'Give thanks in everything, for this is the will of God in Christ Jesus toward you.', reference: '1 Thessalonians 5:18', theme: 'gratitude' },
];
