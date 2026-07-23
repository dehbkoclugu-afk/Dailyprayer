import { dayOfYear } from '@/lib/dates';
import { verses, type DailyVerse } from '@/data/verses';
import { devotionals, type Devotional } from '@/data/devotionals';
import { useUserStore, type QuizAnswers } from '@/state/useUserStore';

type Theme = DailyVerse['theme'];

/**
 * Quiz answers steer which verse themes surface each morning. Both the goals
 * they chose and the struggles they named contribute; order is irrelevant
 * because we still rotate within the matched pool by day-of-year, so the verse
 * changes daily while staying tuned to their season.
 */
const GOAL_THEMES: Record<string, Theme[]> = {
  habit: ['faith', 'strength'],
  closer: ['love', 'faith'],
  peace: ['peace', 'anxiety'],
  sleep: ['rest', 'peace'],
  bible: ['guidance', 'faith'],
  gratitude: ['gratitude', 'joy'],
};

const STRUGGLE_THEMES: Record<string, Theme[]> = {
  anxiety: ['anxiety', 'peace'],
  loneliness: ['comfort', 'love'],
  grief: ['comfort', 'hope'],
  direction: ['guidance', 'trust'],
  consistency: ['strength', 'faith'],
};

/** The set of verse themes a person's answers point toward (may be empty). */
export function preferredThemes(quiz: QuizAnswers): Theme[] {
  const set = new Set<Theme>();
  quiz.goals.forEach((g) => GOAL_THEMES[g]?.forEach((th) => set.add(th)));
  quiz.struggles.forEach((s) => STRUGGLE_THEMES[s]?.forEach((th) => set.add(th)));
  return [...set];
}

export function useDailyContent(): { verse: DailyVerse; devotional: Devotional } {
  const quiz = useUserStore((s) => s.quiz);
  const n = dayOfYear();

  // Personalize the pool when we have signal; otherwise fall back to the full
  // theme-interleaved rotation so brand-new users still get a verse.
  const themes = preferredThemes(quiz);
  const pool = themes.length ? verses.filter((v) => themes.includes(v.theme)) : verses;
  const verse = pool[n % pool.length];

  return {
    verse,
    devotional: devotionals[n % devotionals.length],
  };
}
