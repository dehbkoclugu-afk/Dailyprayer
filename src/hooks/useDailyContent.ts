import { dayOfYear } from '@/lib/dates';
import { verses, type DailyVerse } from '@/data/verses';
import { devotionals, type Devotional } from '@/data/devotionals';

export function useDailyContent(): { verse: DailyVerse; devotional: Devotional } {
  const n = dayOfYear();
  return {
    verse: verses[n % verses.length],
    devotional: devotionals[n % devotionals.length],
  };
}
