import { dayOfYear } from '@/lib/dates';
import { getVerses, type DailyVerse } from '@/data/verses';
import { getDevotionals, type Devotional } from '@/data/devotionals';
import { useT } from '@/i18n';

export function useDailyContent(): { verse: DailyVerse; devotional: Devotional } {
  const { locale } = useT();
  const n = dayOfYear();
  const verses = getVerses(locale);
  const devotionals = getDevotionals(locale);
  return {
    verse: verses[n % verses.length],
    devotional: devotionals[n % devotionals.length],
  };
}
