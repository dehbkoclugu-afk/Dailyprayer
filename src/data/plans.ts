import type { AssetId } from '@/assets/registry';
import { useT } from '@/i18n';
import type { Locale } from '@/i18n/translations';

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
    tagline: 'For anxious seasons , one calming passage a day.',
    gradient: ['#2B4C7E', '#0E1220'],
    art: 'A13-peace7',
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
    tagline: 'The whole story , 20 minutes a day.',
    gradient: ['#8A4B2E', '#0E1220'],
    art: 'A13-bible365',
  },
];

/** Localized title/tagline overlays. `en` (the base above) is the fallback. */
const TR: Record<string, { title: string; tagline: string }> = {
  'peace-7': {
    title: 'Yedi Günlük Huzur',
    tagline: 'Kaygılı dönemler için , günde bir yatıştırıcı bölüm.',
  },
  'gratitude-7': {
    title: 'Şükran Haftası',
    tagline: 'Gözlerini her yerde lütfu görmeye alıştır.',
  },
  'psalms-30': {
    title: 'Mezmurlarda 30 Gün',
    tagline: 'İncil’in dua kitabı , her seferinde bir mezmur.',
  },
  'gospels-90': {
    title: '90 Günde İsa’nın Yaşamı',
    tagline: 'Dört İncil’in tamamında yürü.',
  },
  'bible-365': {
    title: 'Bir Yılda İncil',
    tagline: 'Bütün hikâye , günde 20 dakika.',
  },
};

const ES: Record<string, { title: string; tagline: string }> = {
  'peace-7': { title: 'Siete días de paz', tagline: 'Para tiempos de ansiedad: un pasaje sereno cada día.' },
  'gratitude-7': { title: 'La semana de la gratitud', tagline: 'Aprende a reconocer la gracia en todas partes.' },
  'psalms-30': { title: '30 días en los Salmos', tagline: 'El libro de oración de la Biblia, un salmo cada día.' },
  'gospels-90': { title: 'La vida de Jesús en 90 días', tagline: 'Recorre los cuatro Evangelios.' },
  'bible-365': { title: 'La Biblia en un año', tagline: 'Toda la historia, 20 minutos al día.' },
};

const PT: Record<string, { title: string; tagline: string }> = {
  'peace-7': { title: 'Sete dias de paz', tagline: 'Para tempos de ansiedade: uma passagem serena por dia.' },
  'gratitude-7': { title: 'A semana da gratidão', tagline: 'Treine seus olhos para reconhecer a graça em toda parte.' },
  'psalms-30': { title: '30 dias nos Salmos', tagline: 'O livro de oração da Bíblia, um salmo por dia.' },
  'gospels-90': { title: 'A vida de Jesus em 90 dias', tagline: 'Percorra os quatro Evangelhos.' },
  'bible-365': { title: 'A Bíblia em um ano', tagline: 'Toda a história, 20 minutos por dia.' },
};

const FR: Record<string, { title: string; tagline: string }> = {
  'peace-7': { title: 'Sept jours de paix', tagline: 'Pour les périodes d’anxiété : un passage apaisant par jour.' },
  'gratitude-7': { title: 'La semaine de gratitude', tagline: 'Apprenez à reconnaître la grâce partout autour de vous.' },
  'psalms-30': { title: '30 jours dans les Psaumes', tagline: 'Le livre de prière de la Bible, un psaume par jour.' },
  'gospels-90': { title: 'La vie de Jésus en 90 jours', tagline: 'Parcourez les quatre Évangiles.' },
  'bible-365': { title: 'La Bible en un an', tagline: 'Toute l’histoire, 20 minutes par jour.' },
};

const DE: Record<string, { title: string; tagline: string }> = {
  'peace-7': { title: 'Sieben Tage Frieden', tagline: 'Für unruhige Zeiten: jeden Tag ein beruhigender Abschnitt.' },
  'gratitude-7': { title: 'Eine Woche Dankbarkeit', tagline: 'Übe, Gottes Gnade überall wahrzunehmen.' },
  'psalms-30': { title: '30 Tage in den Psalmen', tagline: 'Das Gebetbuch der Bibel, jeden Tag ein Psalm.' },
  'gospels-90': { title: 'Das Leben Jesu in 90 Tagen', tagline: 'Gehe durch alle vier Evangelien.' },
  'bible-365': { title: 'Die Bibel in einem Jahr', tagline: 'Die ganze Geschichte, 20 Minuten am Tag.' },
};

const IT: Record<string, { title: string; tagline: string }> = {
  'peace-7': { title: 'Sette Giorni di Pace', tagline: 'Per i periodi di ansia: un brano rasserenante al giorno.' },
  'gratitude-7': { title: 'La Settimana della Gratitudine', tagline: 'Allena lo sguardo a riconoscere la grazia ovunque.' },
  'psalms-30': { title: '30 Giorni nei Salmi', tagline: 'Il libro di preghiera della Bibbia, un salmo alla volta.' },
  'gospels-90': { title: 'La Vita di Gesù in 90 Giorni', tagline: 'Attraversa tutti e quattro i Vangeli.' },
  'bible-365': { title: 'La Bibbia in un Anno', tagline: 'L’intera storia, 20 minuti al giorno.' },
};

const NL: Record<string, { title: string; tagline: string }> = {
  'peace-7': { title: 'Zeven Dagen van Vrede', tagline: 'Voor onrustige tijden: elke dag één kalmerend gedeelte.' },
  'gratitude-7': { title: 'De Dankbare Week', tagline: 'Train je blik om overal genade te zien.' },
  'psalms-30': { title: '30 Dagen in de Psalmen', tagline: 'Het gebedenboek van de Bijbel, één psalm tegelijk.' },
  'gospels-90': { title: 'Het Leven van Jezus in 90 Dagen', tagline: 'Lees door alle vier de evangeliën.' },
  'bible-365': { title: 'De Bijbel in een Jaar', tagline: 'Het hele verhaal, 20 minuten per dag.' },
};

const OVERLAYS: Record<Exclude<Locale, 'en'>, Record<string, { title: string; tagline: string }>> = {
  tr: TR,
  es: ES,
  pt: PT,
  fr: FR,
  de: DE,
  it: IT,
  nl: NL,
};

/** Reading plans localized to the active locale (English fallback). */
export function getPlans(locale: Locale): ReadingPlan[] {
  if (locale === 'en') return plans;
  const overlay = OVERLAYS[locale];
  return plans.map((p) => {
    const o = overlay?.[p.id];
    return o ? { ...p, title: o.title, tagline: o.tagline } : p;
  });
}

/** Reactive plans for components. */
export function usePlans(): ReadingPlan[] {
  const { locale } = useT();
  return getPlans(locale);
}
