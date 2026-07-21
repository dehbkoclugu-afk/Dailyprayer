/** Onboarding quiz — personalization → plan reveal → paywall (category-proven funnel). */
import type { Locale } from '@/i18n/translations';

export interface QuizStep {
  key: 'tradition' | 'goals' | 'struggles' | 'experience' | 'prayerTime';
  question: string;
  subtitle?: string;
  multi: boolean;
  options: { value: string; label: string; icon: string }[];
  /** social-proof interstitial shown after answering */
  affirmation?: string;
}

/** Structure (keys, order, icons) shared across every locale — text lives in `text`. */
interface StepBase {
  key: QuizStep['key'];
  multi: boolean;
  options: { value: string; icon: string }[];
}

const base: StepBase[] = [
  {
    key: 'tradition',
    multi: false,
    options: [
      { value: 'catholic', icon: 'rose-outline' },
      { value: 'protestant', icon: 'book-outline' },
      { value: 'orthodox', icon: 'flame-outline' },
      { value: 'nondenominational', icon: 'heart-outline' },
      { value: 'exploring', icon: 'compass-outline' },
    ],
  },
  {
    key: 'goals',
    multi: true,
    options: [
      { value: 'habit', icon: 'calendar-outline' },
      { value: 'closer', icon: 'sparkles-outline' },
      { value: 'peace', icon: 'leaf-outline' },
      { value: 'sleep', icon: 'moon-outline' },
      { value: 'bible', icon: 'library-outline' },
      { value: 'gratitude', icon: 'heart-outline' },
    ],
  },
  {
    key: 'struggles',
    multi: true,
    options: [
      { value: 'anxiety', icon: 'rainy-outline' },
      { value: 'loneliness', icon: 'person-outline' },
      { value: 'grief', icon: 'water-outline' },
      { value: 'direction', icon: 'compass-outline' },
      { value: 'consistency', icon: 'repeat-outline' },
      { value: 'none', icon: 'sunny-outline' },
    ],
  },
  {
    key: 'experience',
    multi: false,
    options: [
      { value: 'new', icon: 'sparkles-outline' },
      { value: 'returning', icon: 'refresh-outline' },
      { value: 'regular', icon: 'flame-outline' },
    ],
  },
  {
    key: 'prayerTime',
    multi: false,
    options: [
      { value: '07:30', icon: 'sunny-outline' },
      { value: '12:30', icon: 'partly-sunny-outline' },
      { value: '21:00', icon: 'moon-outline' },
      { value: 'none', icon: 'notifications-off-outline' },
    ],
  },
];

interface StepText {
  question: string;
  subtitle?: string;
  affirmation?: string;
  labels: Record<string, string>;
}

/** `en` is the source of truth and the fallback for any locale not listed. */
const text: Partial<Record<Locale, StepText[]>> = {
  en: [
    {
      question: 'Which tradition feels like home?',
      subtitle: 'We’ll tune your prayers and plans to it.',
      labels: {
        catholic: 'Catholic',
        protestant: 'Protestant',
        orthodox: 'Orthodox',
        nondenominational: 'Non-denominational',
        exploring: 'Just exploring',
      },
    },
    {
      question: 'What do you hope grows in you?',
      subtitle: 'Choose all that apply.',
      affirmation: 'You’re in good company — 73% of members joined for the very same reason.',
      labels: {
        habit: 'A daily prayer habit',
        closer: 'Feeling closer to God',
        peace: 'Peace & less anxiety',
        sleep: 'Better sleep',
        bible: 'Understanding the Bible',
        gratitude: 'A grateful heart',
      },
    },
    {
      question: 'What weighs on you lately?',
      subtitle: 'Your answer stays private. It shapes your plan.',
      affirmation: 'Thank you for trusting us with that. Scripture meets people exactly here.',
      labels: {
        anxiety: 'Anxiety or worry',
        loneliness: 'Loneliness',
        grief: 'Grief or loss',
        direction: 'Finding direction',
        consistency: 'Staying consistent',
        none: 'I’m doing okay',
      },
    },
    {
      question: 'How familiar is prayer for you?',
      labels: {
        new: 'I’m just beginning',
        returning: 'Returning after a while',
        regular: 'I pray regularly',
      },
    },
    {
      question: 'When would you like a daily nudge?',
      subtitle: 'A gentle reminder — never spam.',
      labels: {
        '07:30': 'Morning · 7:30',
        '12:30': 'Midday · 12:30',
        '21:00': 'Evening · 21:00',
        none: 'No reminders',
      },
    },
  ],
  tr: [
    {
      question: 'Hangi gelenek sana yuva gibi geliyor?',
      subtitle: 'Dualarını ve planlarını buna göre ayarlarız.',
      labels: {
        catholic: 'Katolik',
        protestant: 'Protestan',
        orthodox: 'Ortodoks',
        nondenominational: 'Bağımsız / mezhepsiz',
        exploring: 'Sadece keşfediyorum',
      },
    },
    {
      question: 'İçinde neyin büyümesini istiyorsun?',
      subtitle: 'Uygun olanların hepsini seç.',
      affirmation: 'İyi bir topluluktasın — üyelerin %73’ü tam da aynı sebeple katıldı.',
      labels: {
        habit: 'Günlük bir dua alışkanlığı',
        closer: 'Tanrı’ya daha yakın hissetmek',
        peace: 'Huzur ve daha az kaygı',
        sleep: 'Daha iyi uyku',
        bible: 'İncil’i anlamak',
        gratitude: 'Şükreden bir kalp',
      },
    },
    {
      question: 'Son zamanlarda içini ne ağırlaştırıyor?',
      subtitle: 'Cevabın gizli kalır. Planını şekillendirir.',
      affirmation: 'Bunu bizimle paylaştığın için teşekkürler. Kutsal metin insanı tam da burada karşılar.',
      labels: {
        anxiety: 'Kaygı ya da endişe',
        loneliness: 'Yalnızlık',
        grief: 'Yas ya da kayıp',
        direction: 'Yön bulmak',
        consistency: 'İstikrarlı kalmak',
        none: 'İyiyim',
      },
    },
    {
      question: 'Dua sana ne kadar tanıdık?',
      labels: {
        new: 'Daha yeni başlıyorum',
        returning: 'Bir aradan sonra dönüyorum',
        regular: 'Düzenli dua ederim',
      },
    },
    {
      question: 'Günlük nazik bir hatırlatmayı ne zaman istersin?',
      subtitle: 'Nazik bir hatırlatma — asla spam değil.',
      labels: {
        '07:30': 'Sabah · 7:30',
        '12:30': 'Öğle · 12:30',
        '21:00': 'Akşam · 21:00',
        none: 'Hatırlatma yok',
      },
    },
  ],
};

/** Localized quiz steps for the active locale, falling back to English. */
export function getQuizSteps(locale: Locale): QuizStep[] {
  const tx = text[locale] ?? text.en!;
  return base.map((b, i) => {
    const s = tx[i] ?? text.en![i];
    return {
      key: b.key,
      multi: b.multi,
      question: s.question,
      subtitle: s.subtitle,
      affirmation: s.affirmation,
      options: b.options.map((o) => ({
        value: o.value,
        icon: o.icon,
        label: s.labels[o.value] ?? text.en![i].labels[o.value] ?? o.value,
      })),
    };
  });
}
