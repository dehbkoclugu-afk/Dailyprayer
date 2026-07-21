/** Guided prayer library. `plus` marks premium content. */
export interface GuidedPrayer {
  id: string;
  title: string;
  category: 'morning' | 'anxiety' | 'gratitude' | 'sleep' | 'family' | 'strength';
  minutes: number;
  plus: boolean;
  /** paragraphs shown/read in the player */
  script: string[];
}

export const prayers: GuidedPrayer[] = [
  {
    id: 'morning-light',
    title: 'Morning Light',
    category: 'morning',
    minutes: 3,
    plus: false,
    script: [
      'Take a slow breath in… and out. Before the day asks anything of you, be here.',
      'Lord, thank You for this morning — for breath, for another beginning.',
      'I give You the hours ahead: my work, my words, the people I will meet.',
      'Where I am anxious, be my peace. Where I am tired, be my strength.',
      'Let me walk through this day unhurried, aware that You are near. Amen.',
    ],
  },
  {
    id: 'calm-the-storm',
    title: 'Calm the Storm',
    category: 'anxiety',
    minutes: 4,
    plus: false,
    script: [
      'Place a hand over your heart. Feel it beat — you are alive, and you are held.',
      'Jesus, You slept through a storm and silenced it with a word. Speak to mine.',
      'I name my worry now… and I place it in Your hands.',
      '“Peace, be still.” Let those words settle over my mind like calm water.',
      'I will not be carried by fear today. I am carried by You. Amen.',
    ],
  },
  {
    id: 'grateful-heart',
    title: 'A Grateful Heart',
    category: 'gratitude',
    minutes: 3,
    plus: false,
    script: [
      'Think of one good thing from today — however small. Hold it for a moment.',
      'Father, every good gift comes from You. Thank You.',
      'Thank You for what I prayed for and received — and for what I was spared.',
      'Teach me to notice grace hiding in ordinary hours.',
      'Let gratitude be the note my day ends on. Amen.',
    ],
  },
  {
    id: 'into-rest',
    title: 'Into Rest',
    category: 'sleep',
    minutes: 8,
    plus: true,
    script: [
      'Let the day end. You have done what you could — and that is enough.',
      'Lord, as I lay down, I release what is unfinished into Your keeping.',
      'Watch over the people I love while we sleep.',
      '“In peace I will both lay myself down and sleep, for You alone make me live in safety.”',
      'Slow my breathing… quiet my thoughts… and hold me until morning. Amen.',
    ],
  },
  {
    id: 'bless-my-family',
    title: 'Bless My Family',
    category: 'family',
    minutes: 5,
    plus: true,
    script: [
      'Bring the faces of your family to mind, one by one.',
      'Father, bless each one — in health, in heart, in faith.',
      'Heal what is strained between us; soften what has hardened.',
      'Make our home a place of patience and laughter.',
      'Bind us together in Your love. Amen.',
    ],
  },
  {
    id: 'courage-for-today',
    title: 'Courage for Today',
    category: 'strength',
    minutes: 4,
    plus: true,
    script: [
      'Stand tall for a moment. Breathe deep.',
      'Lord, You did not give me a spirit of fear, but of power, love, and a sound mind.',
      'Give me courage for the conversation, the task, the step I keep avoiding.',
      'When I falter, remind me: You go before me.',
      'I will be strong and courageous — not alone, but with You. Amen.',
    ],
  },
];

export const prayerCategories: { key: GuidedPrayer['category']; label: string; icon: string }[] = [
  { key: 'morning', label: 'Morning', icon: 'sunny-outline' },
  { key: 'anxiety', label: 'Anxiety', icon: 'rainy-outline' },
  { key: 'gratitude', label: 'Gratitude', icon: 'heart-outline' },
  { key: 'sleep', label: 'Sleep', icon: 'moon-outline' },
  { key: 'family', label: 'Family', icon: 'home-outline' },
  { key: 'strength', label: 'Strength', icon: 'flame-outline' },
];
