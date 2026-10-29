import type { AppLocale } from './applicationLocales';
import type { HighlightColor } from '@/theme/highlights';

interface ReaderAccessibilityCopy {
  openVerseActions: string;
  colors: Record<HighlightColor, string>;
}

const READER_ACCESSIBILITY_COPY = {
  en: { openVerseActions: 'Open verse actions', colors: { gold: 'Gold', rose: 'Rose', green: 'Green', blue: 'Blue' } },
  tr: { openVerseActions: 'Ayet işlemlerini aç', colors: { gold: 'Altın', rose: 'Pembe', green: 'Yeşil', blue: 'Mavi' } },
  es: { openVerseActions: 'Abrir acciones del versículo', colors: { gold: 'Dorado', rose: 'Rosa', green: 'Verde', blue: 'Azul' } },
  pt: { openVerseActions: 'Abrir ações do versículo', colors: { gold: 'Dourado', rose: 'Rosa', green: 'Verde', blue: 'Azul' } },
  fr: { openVerseActions: 'Ouvrir les actions du verset', colors: { gold: 'Doré', rose: 'Rose', green: 'Vert', blue: 'Bleu' } },
  nl: { openVerseActions: 'Versacties openen', colors: { gold: 'Goud', rose: 'Roze', green: 'Groen', blue: 'Blauw' } },
  it: { openVerseActions: 'Apri le azioni del versetto', colors: { gold: 'Oro', rose: 'Rosa', green: 'Verde', blue: 'Blu' } },
  de: { openVerseActions: 'Versaktionen öffnen', colors: { gold: 'Gold', rose: 'Rosa', green: 'Grün', blue: 'Blau' } },
  ar: { openVerseActions: 'فتح إجراءات الآية', colors: { gold: 'ذهبي', rose: 'وردي', green: 'أخضر', blue: 'أزرق' } },
  my: { openVerseActions: 'ကျမ်းပိုဒ် လုပ်ဆောင်ချက်များကို ဖွင့်ပါ', colors: { gold: 'ရွှေရောင်', rose: 'ပန်းရောင်', green: 'အစိမ်းရောင်', blue: 'အပြာရောင်' } },
  'zh-Hans': { openVerseActions: '打开经文操作', colors: { gold: '金色', rose: '粉色', green: '绿色', blue: '蓝色' } },
  'zh-Hant': { openVerseActions: '開啟經文操作', colors: { gold: '金色', rose: '粉紅色', green: '綠色', blue: '藍色' } },
  hr: { openVerseActions: 'Otvori radnje retka', colors: { gold: 'Zlatna', rose: 'Ružičasta', green: 'Zelena', blue: 'Plava' } },
  cs: { openVerseActions: 'Otevřít akce verše', colors: { gold: 'Zlatá', rose: 'Růžová', green: 'Zelená', blue: 'Modrá' } },
  eo: { openVerseActions: 'Malfermi versajn agojn', colors: { gold: 'Ora', rose: 'Rozkolora', green: 'Verda', blue: 'Blua' } },
  ht: { openVerseActions: 'Louvri aksyon vèsè a', colors: { gold: 'Lò', rose: 'Woz', green: 'Vèt', blue: 'Ble' } },
  haw: { openVerseActions: 'Wehe i nā hana paukū', colors: { gold: 'Gula', rose: 'ʻĀkala', green: 'ʻŌmaʻomaʻo', blue: 'Polū' } },
  ja: { openVerseActions: '聖句の操作を開く', colors: { gold: 'ゴールド', rose: 'ピンク', green: '緑', blue: '青' } },
  ko: { openVerseActions: '말씀 동작 열기', colors: { gold: '금색', rose: '분홍색', green: '초록색', blue: '파란색' } },
  la: { openVerseActions: 'Actiones versiculi aperi', colors: { gold: 'Aureus', rose: 'Roseus', green: 'Viridis', blue: 'Caeruleus' } },
  fa: { openVerseActions: 'باز کردن کنش‌های آیه', colors: { gold: 'طلایی', rose: 'صورتی', green: 'سبز', blue: 'آبی' } },
  ro: { openVerseActions: 'Deschide acțiunile versetului', colors: { gold: 'Auriu', rose: 'Roz', green: 'Verde', blue: 'Albastru' } },
  ru: { openVerseActions: 'Открыть действия со стихом', colors: { gold: 'Золотой', rose: 'Розовый', green: 'Зелёный', blue: 'Синий' } },
  'sr-Latn': { openVerseActions: 'Otvori radnje stiha', colors: { gold: 'Zlatna', rose: 'Roze', green: 'Zelena', blue: 'Plava' } },
  'sr-Cyrl': { openVerseActions: 'Отвори радње стиха', colors: { gold: 'Златна', rose: 'Розе', green: 'Зелена', blue: 'Плава' } },
  to: { openVerseActions: 'Fakaava ʻa e ngaahi ngaue ki he veesi', colors: { gold: 'Koula', rose: 'Pingikī', green: 'Lanumata', blue: 'Pulū' } },
  uk: { openVerseActions: 'Відкрити дії з віршем', colors: { gold: 'Золотий', rose: 'Рожевий', green: 'Зелений', blue: 'Синій' } },
  vi: { openVerseActions: 'Mở thao tác câu Kinh Thánh', colors: { gold: 'Vàng', rose: 'Hồng', green: 'Xanh lá', blue: 'Xanh dương' } },
  sq: { openVerseActions: 'Hap veprimet e vargut', colors: { gold: 'Artë', rose: 'Rozë', green: 'Gjelbër', blue: 'Blu' } },
  da: { openVerseActions: 'Åbn vershandlinger', colors: { gold: 'Guld', rose: 'Rosa', green: 'Grøn', blue: 'Blå' } },
  fi: { openVerseActions: 'Avaa jakeen toiminnot', colors: { gold: 'Kulta', rose: 'Roosa', green: 'Vihreä', blue: 'Sininen' } },
  hu: { openVerseActions: 'Igevers műveleteinek megnyitása', colors: { gold: 'Arany', rose: 'Rózsaszín', green: 'Zöld', blue: 'Kék' } },
  lv: { openVerseActions: 'Atvērt panta darbības', colors: { gold: 'Zelta', rose: 'Rozā', green: 'Zaļa', blue: 'Zila' } },
  mi: { openVerseActions: 'Whakatuwhera i ngā mahi irava', colors: { gold: 'Kōura', rose: 'Māwhero', green: 'Kākāriki', blue: 'Kahurangi' } },
  no: { openVerseActions: 'Åpne vershandlinger', colors: { gold: 'Gull', rose: 'Rosa', green: 'Grønn', blue: 'Blå' } },
  pl: { openVerseActions: 'Otwórz działania wersetu', colors: { gold: 'Złoty', rose: 'Różowy', green: 'Zielony', blue: 'Niebieski' } },
  sv: { openVerseActions: 'Öppna versåtgärder', colors: { gold: 'Guld', rose: 'Rosa', green: 'Grön', blue: 'Blå' } },
  tl: { openVerseActions: 'Buksan ang mga kilos sa talata', colors: { gold: 'Ginto', rose: 'Rosas', green: 'Berde', blue: 'Asul' } },
} satisfies Record<AppLocale, ReaderAccessibilityCopy>;

export function getReaderAccessibilityCopy(locale: AppLocale): ReaderAccessibilityCopy {
  return READER_ACCESSIBILITY_COPY[locale];
}
