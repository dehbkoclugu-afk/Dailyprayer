import { useT } from '@/i18n';
import type { Locale } from '@/i18n/translations';

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
  {
    id: 'gratitude-evening',
    title: 'Counting the Gifts',
    category: 'gratitude',
    minutes: 4,
    plus: true,
    script: [
      'Let the day settle. Breathe out what it asked of you.',
      'Father, before I name what I lack, let me name what I was given.',
      'Thank You for the ordinary mercies I almost walked past today.',
      'Thank You for the people who make my life warmer.',
      'A grateful heart is a full heart. Fill mine tonight. Amen.',
    ],
  },
  {
    id: 'still-waters',
    title: 'Still Waters',
    category: 'anxiety',
    minutes: 5,
    plus: true,
    script: [
      'Unclench your hands. Let your breath slow with each line.',
      'Shepherd, You lead me beside still waters. Lead me there now.',
      'The thoughts racing in me — I set them down at Your feet, one by one.',
      'You restore my soul. Restore what today has worn thin.',
      'I will not be afraid, for You are with me. Amen.',
    ],
  },
  {
    id: 'morning-surrender',
    title: 'Before the Day',
    category: 'morning',
    minutes: 4,
    plus: true,
    script: [
      'The day is not yet spent. Meet it here, with God, before anything else.',
      'Lord, this day is Yours before it is mine.',
      'Go before me into every room I will enter, every word I will speak.',
      'Where I am tempted to rush, teach me to walk.',
      'Order my hours, and keep my heart near Yours. Amen.',
    ],
  },
  {
    id: 'peace-of-christ',
    title: 'Peace That Guards',
    category: 'anxiety',
    minutes: 3,
    plus: false,
    script: [
      'Place both feet on the ground. You are here. God is here.',
      'Jesus, You left Your peace with us — not as the world gives, but real and deep.',
      'Let that peace guard my heart and mind today like a sentry at the gate.',
      'What I cannot control, I release to You.',
      'Your peace is enough. I rest in it. Amen.',
    ],
  },
  {
    id: 'gratitude-morning',
    title: 'First Thanks',
    category: 'gratitude',
    minutes: 3,
    plus: false,
    script: [
      'Before the to-do list, one pause. One breath of thanks.',
      'Father, thank You for waking me to another day of grace.',
      'Thank You for breath, for light, for a fresh page.',
      'Let gratitude, not hurry, set the tone of my morning.',
      'I begin today thankful. Amen.',
    ],
  },
  {
    id: 'rest-for-the-weary',
    title: 'Lay It Down',
    category: 'sleep',
    minutes: 6,
    plus: true,
    script: [
      'The day is over. You have done what you could, and it is enough.',
      'Lord, I lay down every unfinished thing into Your keeping.',
      'The worries I would carry into the dark — I leave them with You.',
      'You give sleep to those You love. Receive me now.',
      'In peace I lie down and sleep, for You alone keep me safe. Amen.',
    ],
  },
  {
    id: 'for-my-children',
    title: 'Over Those I Love',
    category: 'family',
    minutes: 4,
    plus: true,
    script: [
      'Bring each person you love to mind. Hold their face for a moment.',
      'Father, watch over the ones entrusted to me.',
      'Guard their going out and their coming in.',
      'Where I fail them, let Your grace cover the gap.',
      'Keep them in Your hand, closer than I ever could. Amen.',
    ],
  },
  {
    id: 'strength-to-forgive',
    title: 'Strength to Forgive',
    category: 'strength',
    minutes: 5,
    plus: true,
    script: [
      'Breathe. This one is hard, and God knows it.',
      'Lord, You forgave me at great cost. Give me strength to forgive.',
      'I bring the name, the memory, the wound — I hold it out to You.',
      'Free me from carrying what was never mine to carry.',
      'Heal what forgiveness opens. Make me whole. Amen.',
    ],
  },
  {
    id: 'sleep-psalm',
    title: 'Under His Wings',
    category: 'sleep',
    minutes: 7,
    plus: true,
    script: [
      'Feel the weight of the day leave your shoulders.',
      'You who dwell in the shelter of the Most High will rest in His shadow.',
      'Lord, cover me tonight as a bird covers its young.',
      'No fear of the night, no dread of tomorrow — only Your keeping.',
      'I will not be afraid, for You never sleep. Good night, Father. Amen.',
    ],
  },
  {
    id: 'when-i-am-weak',
    title: 'When I Am Weak',
    category: 'strength',
    minutes: 4,
    plus: false,
    script: [
      'You do not have to pretend to be strong here.',
      'Lord, You said Your power is made perfect in weakness.',
      'So here is my weakness — I stop hiding it from You.',
      'Be strong in exactly the place I have nothing left.',
      'Your grace is sufficient for me. That is enough. Amen.',
    ],
  },
  {
    id: 'thankful-in-hard-times',
    title: 'Even Now, Thank You',
    category: 'gratitude',
    minutes: 4,
    plus: true,
    script: [
      'This is a harder gratitude. Breathe, and stay honest.',
      'Father, even now — in this — I look for Your hand.',
      'Thank You for not leaving me alone in it.',
      'Thank You that this season is not the end of the story.',
      'I choose thanks, not because it is easy, but because You are good. Amen.',
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

/** Turkish title/script overlays keyed by prayer id. `en` (above) is the fallback. */
const TR: Record<string, { title: string; script: string[] }> = {
  'morning-light': {
    title: 'Sabah Işığı',
    script: [
      'Yavaşça bir nefes al… ver. Gün senden bir şey istemeden önce, burada ol.',
      'Rab, bu sabah için teşekkür ederim — nefes için, yeni bir başlangıç için.',
      'Önümdeki saatleri Sana veriyorum: işimi, sözlerimi, karşılaşacağım insanları.',
      'Kaygılı olduğum yerde huzurum ol. Yorgun olduğum yerde gücüm ol.',
      'Bu günü telaşsız, Senin yakın olduğunu bilerek yürümeme izin ver. Âmin.',
    ],
  },
  'calm-the-storm': {
    title: 'Fırtınayı Dindir',
    script: [
      'Elini kalbinin üzerine koy. Attığını hisset — yaşıyorsun ve tutuluyorsun.',
      'İsa, bir fırtınanın içinde uyudun ve onu tek sözle susturdun. Benimkine de söyle.',
      'Endişemi şimdi adlandırıyorum… ve onu Senin ellerine bırakıyorum.',
      '“Sus, sakin ol.” Bu sözler zihnimin üzerine durgun su gibi çöksün.',
      'Bugün korkuyla sürüklenmeyeceğim. Beni Sen taşıyorsun. Âmin.',
    ],
  },
  'grateful-heart': {
    title: 'Şükreden Bir Kalp',
    script: [
      'Bugünden güzel bir şey düşün — ne kadar küçük olursa olsun. Bir an onu tut.',
      'Baba, her iyi armağan Senden gelir. Teşekkür ederim.',
      'Dua edip aldıklarım için — ve esirgendiğim şeyler için teşekkür ederim.',
      'Sıradan saatlerde saklanan lütfu fark etmeyi öğret bana.',
      'Şükran, günümün bittiği nota olsun. Âmin.',
    ],
  },
  'into-rest': {
    title: 'Dinlenmeye',
    script: [
      'Gün bitsin. Elinden geleni yaptın — ve bu yeterli.',
      'Rab, uzanırken, bitmemiş olanı Senin korumana bırakıyorum.',
      'Biz uyurken sevdiğim insanları koru.',
      '“Esenlik içinde yatar uyurum, çünkü beni güvenlikte yaşatan yalnız Sensin.”',
      'Nefesimi yavaşlat… düşüncelerimi dindir… ve sabaha dek beni tut. Âmin.',
    ],
  },
  'bless-my-family': {
    title: 'Aileme Bereket',
    script: [
      'Ailenin yüzlerini birer birer aklına getir.',
      'Baba, her birini bereketle — sağlıkta, yürekte, imanda.',
      'Aramızda gerginleşeni iyileştir; katılaşanı yumuşat.',
      'Evimizi sabrın ve kahkahanın yeri yap.',
      'Bizi sevginle birbirimize bağla. Âmin.',
    ],
  },
  'courage-for-today': {
    title: 'Bugün İçin Cesaret',
    script: [
      'Bir an dik dur. Derin nefes al.',
      'Rab, bana korku ruhu değil, güç, sevgi ve sağduyu ruhu verdin.',
      'Sürekli ertelediğim konuşma, görev, adım için bana cesaret ver.',
      'Sendelediğimde bana hatırlat: Sen önümden gidiyorsun.',
      'Güçlü ve cesur olacağım — yalnız değil, Seninle. Âmin.',
    ],
  },
  'gratitude-evening': {
    title: 'Armağanları Sayarken',
    script: [
      'Gün otursun. Senden istediğini bir nefeste ver.',
      'Baba, eksiğimi adlandırmadan önce, bana verileni adlandırayım.',
      'Bugün neredeyse yanından geçtiğim sıradan merhametler için teşekkür ederim.',
      'Hayatımı ısıtan insanlar için teşekkür ederim.',
      'Şükreden bir kalp dolu bir kalptir. Bu gece benimkini doldur. Âmin.',
    ],
  },
  'still-waters': {
    title: 'Durgun Sular',
    script: [
      'Ellerini gevşet. Her satırla nefesin yavaşlasın.',
      'Çoban, beni durgun suların yanına götürürsün. Şimdi oraya götür.',
      'İçimde koşuşan düşünceleri birer birer ayaklarının dibine bırakıyorum.',
      'Canımı onarırsın. Bugünün yıprattığını onar.',
      'Korkmayacağım, çünkü Sen benimlesin. Âmin.',
    ],
  },
  'morning-surrender': {
    title: 'Gün Başlamadan',
    script: [
      'Gün henüz tükenmedi. Onu burada, her şeyden önce Tanrı’yla karşıla.',
      'Rab, bu gün benim olmadan önce Senindir.',
      'Gireceğim her odaya, söyleyeceğim her söze benden önce git.',
      'Aceleye kapıldığım yerde, yürümeyi öğret bana.',
      'Saatlerimi düzenle, kalbimi Seninkine yakın tut. Âmin.',
    ],
  },
  'peace-of-christ': {
    title: 'Koruyan Huzur',
    script: [
      'İki ayağını da yere bas. Buradasın. Tanrı burada.',
      'İsa, huzurunu bize bıraktın — dünyanın verdiği gibi değil, gerçek ve derin.',
      'O huzur bugün kalbimi ve zihnimi kapıdaki bir nöbetçi gibi korusun.',
      'Denetleyemediğimi Sana bırakıyorum.',
      'Senin huzurun yeter. Onda dinleniyorum. Âmin.',
    ],
  },
  'gratitude-morning': {
    title: 'İlk Şükran',
    script: [
      'Yapılacaklar listesinden önce, bir duraklama. Bir şükran nefesi.',
      'Baba, beni bir lütuf gününe daha uyandırdığın için teşekkür ederim.',
      'Nefes için, ışık için, taze bir sayfa için teşekkür ederim.',
      'Sabahımın tonunu telaş değil, şükran belirlesin.',
      'Bugüne şükrederek başlıyorum. Âmin.',
    ],
  },
  'rest-for-the-weary': {
    title: 'Bırak Gitsin',
    script: [
      'Gün bitti. Elinden geleni yaptın ve bu yeterli.',
      'Rab, bitmemiş her şeyi Senin korumana bırakıyorum.',
      'Karanlığa taşıyacağım endişeleri Seninle bırakıyorum.',
      'Sevdiklerine uyku verirsin. Şimdi beni de kabul et.',
      'Esenlik içinde yatar uyurum, çünkü beni güvende tutan yalnız Sensin. Âmin.',
    ],
  },
  'for-my-children': {
    title: 'Sevdiklerimin Üzerine',
    script: [
      'Sevdiğin her kişiyi aklına getir. Bir an yüzünü tut.',
      'Baba, bana emanet edilenleri koru.',
      'Gidişlerini ve gelişlerini gözet.',
      'Onları yüzüstü bıraktığım yerde, lütfun boşluğu kapatsın.',
      'Onları benim asla yapamayacağım kadar yakın, Senin elinde tut. Âmin.',
    ],
  },
  'strength-to-forgive': {
    title: 'Bağışlama Gücü',
    script: [
      'Nefes al. Bu zor bir şey ve Tanrı bunu biliyor.',
      'Rab, beni büyük bir bedelle bağışladın. Bana bağışlama gücü ver.',
      'İsmi, anıyı, yarayı getiriyorum — onu Sana uzatıyorum.',
      'Taşımak bana düşmeyen şeyi taşımaktan beni özgür kıl.',
      'Bağışlamanın açtığını iyileştir. Beni bütün kıl. Âmin.',
    ],
  },
  'sleep-psalm': {
    title: 'Kanatlarının Altında',
    script: [
      'Günün ağırlığının omuzlarından indiğini hisset.',
      'Yüceler Yücesi’nin barınağında oturan, O’nun gölgesinde dinlenecek.',
      'Rab, bir kuşun yavrusunu örttüğü gibi bu gece beni ört.',
      'Gecenin korkusu yok, yarının kaygısı yok — yalnız Senin korumanda.',
      'Korkmayacağım, çünkü Sen hiç uyumazsın. İyi geceler, Baba. Âmin.',
    ],
  },
  'when-i-am-weak': {
    title: 'Güçsüz Olduğumda',
    script: [
      'Burada güçlü görünmek zorunda değilsin.',
      'Rab, gücünün güçsüzlükte tamamlandığını söyledin.',
      'İşte güçsüzlüğüm — onu Senden saklamayı bırakıyorum.',
      'Hiçbir şeyimin kalmadığı yerde tam da orada güçlü ol.',
      'Lütfun bana yeter. Bu yeterli. Âmin.',
    ],
  },
  'thankful-in-hard-times': {
    title: 'Şimdi Bile, Teşekkürler',
    script: [
      'Bu daha zor bir şükran. Nefes al ve dürüst kal.',
      'Baba, şimdi bile — bunun içinde — Senin elini arıyorum.',
      'Beni bunun içinde yalnız bırakmadığın için teşekkür ederim.',
      'Bu dönemin hikâyenin sonu olmadığı için teşekkür ederim.',
      'Şükrü seçiyorum, kolay olduğu için değil, Sen iyi olduğun için. Âmin.',
    ],
  },
};

/** Guided prayers localized to the active locale (English fallback). */
export function getPrayers(locale: Locale): GuidedPrayer[] {
  if (locale === 'en') return prayers;
  return prayers.map((p) => {
    const o = locale === 'tr' ? TR[p.id] : undefined;
    return o ? { ...p, title: o.title, script: o.script } : p;
  });
}

/** Reactive prayers for components. */
export function usePrayers(): GuidedPrayer[] {
  const { locale } = useT();
  return getPrayers(locale);
}
