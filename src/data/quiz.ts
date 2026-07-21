/** Onboarding quiz — personalization → plan reveal → paywall (category-proven funnel). */
export interface QuizStep {
  key: 'tradition' | 'goals' | 'struggles' | 'experience' | 'prayerTime';
  question: string;
  subtitle?: string;
  multi: boolean;
  options: { value: string; label: string; icon: string }[];
  /** social-proof interstitial shown after answering */
  affirmation?: string;
}

export const quizSteps: QuizStep[] = [
  {
    key: 'tradition',
    question: 'Which tradition feels like home?',
    subtitle: 'We’ll tune your prayers and plans to it.',
    multi: false,
    options: [
      { value: 'catholic', label: 'Catholic', icon: 'rose-outline' },
      { value: 'protestant', label: 'Protestant', icon: 'book-outline' },
      { value: 'orthodox', label: 'Orthodox', icon: 'flame-outline' },
      { value: 'nondenominational', label: 'Non-denominational', icon: 'heart-outline' },
      { value: 'exploring', label: 'Just exploring', icon: 'compass-outline' },
    ],
  },
  {
    key: 'goals',
    question: 'What do you hope grows in you?',
    subtitle: 'Choose all that apply.',
    multi: true,
    options: [
      { value: 'habit', label: 'A daily prayer habit', icon: 'calendar-outline' },
      { value: 'closer', label: 'Feeling closer to God', icon: 'sparkles-outline' },
      { value: 'peace', label: 'Peace & less anxiety', icon: 'leaf-outline' },
      { value: 'sleep', label: 'Better sleep', icon: 'moon-outline' },
      { value: 'bible', label: 'Understanding the Bible', icon: 'library-outline' },
      { value: 'gratitude', label: 'A grateful heart', icon: 'heart-outline' },
    ],
    affirmation: 'You’re in good company — 73% of members joined for the very same reason.',
  },
  {
    key: 'struggles',
    question: 'What weighs on you lately?',
    subtitle: 'Your answer stays private. It shapes your plan.',
    multi: true,
    options: [
      { value: 'anxiety', label: 'Anxiety or worry', icon: 'rainy-outline' },
      { value: 'loneliness', label: 'Loneliness', icon: 'person-outline' },
      { value: 'grief', label: 'Grief or loss', icon: 'water-outline' },
      { value: 'direction', label: 'Finding direction', icon: 'compass-outline' },
      { value: 'consistency', label: 'Staying consistent', icon: 'repeat-outline' },
      { value: 'none', label: 'I’m doing okay', icon: 'sunny-outline' },
    ],
    affirmation: 'Thank you for trusting us with that. Scripture meets people exactly here.',
  },
  {
    key: 'experience',
    question: 'How familiar is prayer for you?',
    multi: false,
    options: [
      { value: 'new', label: 'I’m just beginning', icon: 'sparkles-outline' },
      { value: 'returning', label: 'Returning after a while', icon: 'refresh-outline' },
      { value: 'regular', label: 'I pray regularly', icon: 'flame-outline' },
    ],
  },
  {
    key: 'prayerTime',
    question: 'When would you like a daily nudge?',
    subtitle: 'A gentle reminder — never spam.',
    multi: false,
    options: [
      { value: '07:30', label: 'Morning · 7:30', icon: 'sunny-outline' },
      { value: '12:30', label: 'Midday · 12:30', icon: 'partly-sunny-outline' },
      { value: '21:00', label: 'Evening · 21:00', icon: 'moon-outline' },
      { value: 'none', label: 'No reminders', icon: 'notifications-off-outline' },
    ],
  },
];
