/** Onboarding quiz , personalization → plan reveal → paywall (category-proven funnel). */
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

/** Structure (keys, order, icons) shared across every locale , text lives in `text`. */
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
      affirmation: 'You’re in good company , 73% of members joined for the very same reason.',
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
      subtitle: 'A gentle reminder , never spam.',
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
      affirmation: 'İyi bir topluluktasın , üyelerin %73’ü tam da aynı sebeple katıldı.',
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
      subtitle: 'Nazik bir hatırlatma , asla spam değil.',
      labels: {
        '07:30': 'Sabah · 7:30',
        '12:30': 'Öğle · 12:30',
        '21:00': 'Akşam · 21:00',
        none: 'Hatırlatma yok',
      },
    },
  ],
  es: [
    {
      question: '¿Qué tradición sientes como tu hogar?',
      subtitle: 'Ajustaremos tus oraciones y planes a ella.',
      labels: {
        catholic: 'Católica',
        protestant: 'Protestante',
        orthodox: 'Ortodoxa',
        nondenominational: 'No confesional',
        exploring: 'Solo explorando',
      },
    },
    {
      question: '¿Qué esperas que crezca en ti?',
      subtitle: 'Elige todas las que correspondan.',
      affirmation: 'Estás en buena compañía: el 73 % de los miembros se unió por la misma razón.',
      labels: {
        habit: 'Un hábito diario de oración',
        closer: 'Sentirme más cerca de Dios',
        peace: 'Paz y menos ansiedad',
        sleep: 'Dormir mejor',
        bible: 'Entender la Biblia',
        gratitude: 'Un corazón agradecido',
      },
    },
    {
      question: '¿Qué te pesa últimamente?',
      subtitle: 'Tu respuesta es privada. Da forma a tu plan.',
      affirmation: 'Gracias por confiárnoslo. La Escritura encuentra a las personas justo aquí.',
      labels: {
        anxiety: 'Ansiedad o preocupación',
        loneliness: 'Soledad',
        grief: 'Duelo o pérdida',
        direction: 'Encontrar rumbo',
        consistency: 'Ser constante',
        none: 'Estoy bien',
      },
    },
    {
      question: '¿Qué tan familiar es la oración para ti?',
      labels: {
        new: 'Apenas empiezo',
        returning: 'Vuelvo después de un tiempo',
        regular: 'Oro con regularidad',
      },
    },
    {
      question: '¿Cuándo quieres un recordatorio diario?',
      subtitle: 'Un recordatorio suave, nunca spam.',
      labels: {
        '07:30': 'Mañana · 7:30',
        '12:30': 'Mediodía · 12:30',
        '21:00': 'Noche · 21:00',
        none: 'Sin recordatorios',
      },
    },
  ],
  pt: [
    {
      question: 'Qual tradição você sente como o seu lar?',
      subtitle: 'Vamos ajustar suas orações e planos a ela.',
      labels: {
        catholic: 'Católica',
        protestant: 'Protestante',
        orthodox: 'Ortodoxa',
        nondenominational: 'Não denominacional',
        exploring: 'Apenas explorando',
      },
    },
    {
      question: 'O que você espera que cresça em você?',
      subtitle: 'Escolha todas as que se aplicam.',
      affirmation: 'Você está em boa companhia , 73% dos membros entraram pelo mesmo motivo.',
      labels: {
        habit: 'Um hábito diário de oração',
        closer: 'Sentir-me mais perto de Deus',
        peace: 'Paz e menos ansiedade',
        sleep: 'Dormir melhor',
        bible: 'Entender a Bíblia',
        gratitude: 'Um coração grato',
      },
    },
    {
      question: 'O que tem pesado em você ultimamente?',
      subtitle: 'Sua resposta é privada. Ela molda o seu plano.',
      affirmation: 'Obrigado por confiar isso a nós. A Escritura encontra as pessoas exatamente aqui.',
      labels: {
        anxiety: 'Ansiedade ou preocupação',
        loneliness: 'Solidão',
        grief: 'Luto ou perda',
        direction: 'Encontrar direção',
        consistency: 'Manter a constância',
        none: 'Estou bem',
      },
    },
    {
      question: 'Quão familiar é a oração para você?',
      labels: {
        new: 'Estou apenas começando',
        returning: 'Voltando depois de um tempo',
        regular: 'Oro regularmente',
      },
    },
    {
      question: 'Quando você gostaria de um lembrete diário?',
      subtitle: 'Um lembrete gentil , nunca spam.',
      labels: {
        '07:30': 'Manhã · 7:30',
        '12:30': 'Meio-dia · 12:30',
        '21:00': 'Noite · 21:00',
        none: 'Sem lembretes',
      },
    },
  ],
  fr: [
    {
      question: 'Quelle tradition ressens-tu comme un foyer ?',
      subtitle: 'Nous adapterons tes prières et tes plans en conséquence.',
      labels: {
        catholic: 'Catholique',
        protestant: 'Protestante',
        orthodox: 'Orthodoxe',
        nondenominational: 'Non confessionnelle',
        exploring: 'Je découvre simplement',
      },
    },
    {
      question: 'Qu’espères-tu voir grandir en toi ?',
      subtitle: 'Choisis tout ce qui s’applique.',
      affirmation: 'Tu es en bonne compagnie , 73 % des membres nous ont rejoints pour la même raison.',
      labels: {
        habit: 'Une habitude de prière quotidienne',
        closer: 'Me sentir plus proche de Dieu',
        peace: 'La paix et moins d’anxiété',
        sleep: 'Un meilleur sommeil',
        bible: 'Comprendre la Bible',
        gratitude: 'Un cœur reconnaissant',
      },
    },
    {
      question: 'Qu’est-ce qui te pèse ces derniers temps ?',
      subtitle: 'Ta réponse reste privée. Elle façonne ton plan.',
      affirmation: 'Merci de nous confier cela. L’Écriture rejoint les gens exactement ici.',
      labels: {
        anxiety: 'L’anxiété ou l’inquiétude',
        loneliness: 'La solitude',
        grief: 'Le deuil ou la perte',
        direction: 'Trouver ma direction',
        consistency: 'Rester régulier',
        none: 'Je vais bien',
      },
    },
    {
      question: 'La prière t’est-elle familière ?',
      labels: {
        new: 'Je débute tout juste',
        returning: 'Je reviens après un temps',
        regular: 'Je prie régulièrement',
      },
    },
    {
      question: 'Quand souhaites-tu un rappel quotidien ?',
      subtitle: 'Un rappel doux , jamais de spam.',
      labels: {
        '07:30': 'Matin · 7:30',
        '12:30': 'Midi · 12:30',
        '21:00': 'Soir · 21:00',
        none: 'Aucun rappel',
      },
    },
  ],
  de: [
    {
      question: 'Welche Tradition fühlt sich wie Zuhause an?',
      subtitle: 'Wir stimmen deine Gebete und Pläne darauf ab.',
      labels: {
        catholic: 'Katholisch',
        protestant: 'Evangelisch',
        orthodox: 'Orthodox',
        nondenominational: 'Konfessionslos',
        exploring: 'Ich schaue mich nur um',
      },
    },
    {
      question: 'Was soll in dir wachsen?',
      subtitle: 'Wähle alles Zutreffende.',
      affirmation: 'Du bist in guter Gesellschaft , 73 % der Mitglieder sind aus demselben Grund beigetreten.',
      labels: {
        habit: 'Eine tägliche Gebetsgewohnheit',
        closer: 'Gott näher fühlen',
        peace: 'Frieden und weniger Angst',
        sleep: 'Besserer Schlaf',
        bible: 'Die Bibel verstehen',
        gratitude: 'Ein dankbares Herz',
      },
    },
    {
      question: 'Was belastet dich in letzter Zeit?',
      subtitle: 'Deine Antwort bleibt privat. Sie formt deinen Plan.',
      affirmation: 'Danke, dass du uns das anvertraust. Die Schrift begegnet den Menschen genau hier.',
      labels: {
        anxiety: 'Angst oder Sorge',
        loneliness: 'Einsamkeit',
        grief: 'Trauer oder Verlust',
        direction: 'Orientierung finden',
        consistency: 'Dranbleiben',
        none: 'Mir geht es gut',
      },
    },
    {
      question: 'Wie vertraut ist dir das Gebet?',
      labels: {
        new: 'Ich fange gerade erst an',
        returning: 'Ich kehre nach einer Weile zurück',
        regular: 'Ich bete regelmäßig',
      },
    },
    {
      question: 'Wann möchtest du eine tägliche Erinnerung?',
      subtitle: 'Eine sanfte Erinnerung , niemals Spam.',
      labels: {
        '07:30': 'Morgens · 7:30',
        '12:30': 'Mittags · 12:30',
        '21:00': 'Abends · 21:00',
        none: 'Keine Erinnerungen',
      },
    },
  ],
  it: [
    { question: 'Quale tradizione senti più vicina a casa?', subtitle: 'Adatteremo le tue preghiere e i tuoi piani a questa scelta.', labels: { catholic: 'Cattolica', protestant: 'Protestante', orthodox: 'Ortodossa', nondenominational: 'Non confessionale', exploring: 'Sto solo esplorando' } },
    { question: 'Cosa speri cresca dentro di te?', subtitle: 'Scegli tutte le opzioni che senti tue.', affirmation: 'Sei in buona compagnia: il 73% dei membri è qui per lo stesso motivo.', labels: { habit: 'Un’abitudine quotidiana di preghiera', closer: 'Sentirmi più vicino a Dio', peace: 'Più pace e meno ansia', sleep: 'Dormire meglio', bible: 'Comprendere la Bibbia', gratitude: 'Un cuore riconoscente' } },
    { question: 'Cosa ti pesa di più ultimamente?', subtitle: 'La tua risposta resta privata e aiuta a dare forma al tuo piano.', affirmation: 'Grazie per la fiducia. La Scrittura incontra le persone proprio qui.', labels: { anxiety: 'Ansia o preoccupazione', loneliness: 'Solitudine', grief: 'Lutto o perdita', direction: 'Trovare una direzione', consistency: 'Essere costante', none: 'Sto bene' } },
    { question: 'Quanto ti è familiare la preghiera?', labels: { new: 'Sto appena iniziando', returning: 'Sto tornando dopo un periodo', regular: 'Prego regolarmente' } },
    { question: 'Quando vorresti un piccolo promemoria quotidiano?', subtitle: 'Un promemoria discreto, mai spam.', labels: { '07:30': 'Mattina · 7:30', '12:30': 'Mezzogiorno · 12:30', '21:00': 'Sera · 21:00', none: 'Nessun promemoria' } },
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
