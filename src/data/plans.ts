import type { AssetId } from '@/assets/registry';

/** Reading plans. Day content references the built-in reader or devotional text. */
export interface ReadingPlan {
  id: string;
  title: string;
  days: number;
  plus: boolean;
  tagline: string;
  gradient: [string, string];
  /** A13 cover art; the gradient above is washed over it for text legibility. */
  art: AssetId;
}

export const plans: ReadingPlan[] = [
  {
    id: 'peace-7',
    title: 'Seven Days of Peace',
    days: 7,
    plus: false,
    tagline: 'For anxious seasons — one calming passage a day.',
    gradient: ['#2B4C7E', '#0E1220'],
    art: 'A13-plan-cover',
  },
  {
    id: 'gratitude-7',
    title: 'The Grateful Week',
    days: 7,
    plus: true,
    tagline: 'Rewire your eyes to see grace everywhere.',
    gradient: ['#7A5C2E', '#0E1220'],
    art: 'A13-gratitude7',
  },
  {
    id: 'psalms-30',
    title: '30 Days in the Psalms',
    days: 30,
    plus: true,
    tagline: 'The prayer book of the Bible, one psalm at a time.',
    gradient: ['#54346E', '#0E1220'],
    art: 'A13-psalms30',
  },
  {
    id: 'gospels-90',
    title: 'The Life of Jesus in 90 Days',
    days: 90,
    plus: true,
    tagline: 'Walk through all four Gospels.',
    gradient: ['#2E5E4E', '#0E1220'],
    art: 'A13-gospels90',
  },
  {
    id: 'bible-365',
    title: 'Bible in a Year',
    days: 365,
    plus: true,
    tagline: 'The whole story — 20 minutes a day.',
    gradient: ['#8A4B2E', '#0E1220'],
    art: 'A13-bible365',
  },
];
