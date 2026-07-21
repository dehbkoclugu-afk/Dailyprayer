/**
 * Built-in Bible sample — Yorumsuz Türkçe Çeviri (YTC), © İsmail Serinken &
 * eBible.org, CC-BY-ND 4.0 (verbatim, with attribution).
 * v1 ships selected chapters offline; the full canon loads via bundled data at
 * build time (phase 2) behind this same interface.
 */
export interface BibleChapter {
  book: string;
  chapter: number;
  verses: string[];
}

export const books = [
  'Genesis', 'Psalms', 'Proverbs', 'Isaiah', 'Matthew', 'Mark', 'Luke', 'John',
  'Romans', 'Philippians', 'James', '1 Peter', 'Revelation',
] as const;

export const sampleChapters: BibleChapter[] = [
  {
    book: 'Mezmur',
    chapter: 23,
    verses: [
      'David’in mezmuru Yahve benim çobanımdır, hiç eksiğim olmaz.',
      'Beni yeşil çayırlarda yatırır. Sakin suların yanına götürür.',
      'Canımı onarır. Adı uğruna doğruluk yollarında bana rehberlik eder.',
      'Ölüm gölgesindeki vadiden geçsem bile, kötülükten hiç korkmam, çünkü sen benimlesin. Senin asan, değneğin, onlar rahatlatır beni.',
      'Düşmanlarımın huzurunda, önüme sofra kurarsın. Başımı yağla meshedersin. Kâsem taşmakta.',
      'Kesinlikle hayatımın bütün günlerinde iyilik ve sevgi izleyecek beni, ve daima Yahve’nin evinde oturacağım.',
    ],
  },
  {
    book: 'Yuhanna',
    chapter: 1,
    verses: [
      'Başlangıçta Söz vardı ve Söz Tanrı\'yla birlikteydi ve Söz Tanrı’ydı.',
      'O, başlangıçta Tanrı’yla birlikteydi.',
      'Her şey O’nun aracılığıyla oldu. Olmuş olanların hiçbiri O\'nsuz olmadı.',
      'Yaşam O’ndaydı ve yaşam insanların ışığıydı.',
      'Işık karanlıkta parlar ve karanlık onu yenemedi.',
    ],
  },
  {
    book: 'Filipililer',
    chapter: 4,
    verses: [
      'Bu nedenle, ey sevgililer, özlediğim kardeşlerim, sevincim ve başımın tacı sizsiniz. Böylece Efendi’de dimdik durun, sevgili kardeşlerim.',
      'Evodiya’ya ve Sintihi’ye rica ediyorum, Efendi’de aynı düşüncede olun.',
      'Evet, gerçek ortağım, sana da yalvarırım, bu kadınlara yardım et. Çünkü onlar benimle, Klement’le ve yaşam kitabında adları olan öteki emektaşlarımla birlikte Müjde\'de benimle birlikte çalıştılar.',
      'Her zaman Efendi’de sevinin! Yine diyorum, “Sevinin!”',
      'Nezaketiniz bütün insanlar tarafından bilinsin. Efendi yakındır.',
      'Hiçbir şeyde kaygılanmayın. Ama her şeyde dua ve dilekle, şükran dolu bir yürekle isteklerinizi Tanrı’ya bildirin.',
    ],
  },
];

export function getChapter(book: string, chapter: number): BibleChapter | undefined {
  return sampleChapters.find((c) => c.book === book && c.chapter === chapter);
}
