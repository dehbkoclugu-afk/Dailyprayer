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
      'Lord, thank You for this morning , for breath, for another beginning.',
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
      'Place a hand over your heart. Feel it beat , you are alive, and you are held.',
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
      'Think of one good thing from today , however small. Hold it for a moment.',
      'Father, every good gift comes from You. Thank You.',
      'Thank You for what I prayed for and received , and for what I was spared.',
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
      'Let the day end. You have done what you could , and that is enough.',
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
      'Father, bless each one , in health, in heart, in faith.',
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
      'I will be strong and courageous , not alone, but with You. Amen.',
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
      'The thoughts racing in me , I set them down at Your feet, one by one.',
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
      'Jesus, You left Your peace with us , not as the world gives, but real and deep.',
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
      'The worries I would carry into the dark , I leave them with You.',
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
      'I bring the name, the memory, the wound , I hold it out to You.',
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
      'No fear of the night, no dread of tomorrow , only Your keeping.',
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
      'So here is my weakness , I stop hiding it from You.',
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
      'Father, even now , in this , I look for Your hand.',
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
      'Rab, bu sabah için teşekkür ederim , nefes için, yeni bir başlangıç için.',
      'Önümdeki saatleri Sana veriyorum: işimi, sözlerimi, karşılaşacağım insanları.',
      'Kaygılı olduğum yerde huzurum ol. Yorgun olduğum yerde gücüm ol.',
      'Bu günü telaşsız, Senin yakın olduğunu bilerek yürümeme izin ver. Âmin.',
    ],
  },
  'calm-the-storm': {
    title: 'Fırtınayı Dindir',
    script: [
      'Elini kalbinin üzerine koy. Attığını hisset , yaşıyorsun ve tutuluyorsun.',
      'İsa, bir fırtınanın içinde uyudun ve onu tek sözle susturdun. Benimkine de söyle.',
      'Endişemi şimdi adlandırıyorum… ve onu Senin ellerine bırakıyorum.',
      '“Sus, sakin ol.” Bu sözler zihnimin üzerine durgun su gibi çöksün.',
      'Bugün korkuyla sürüklenmeyeceğim. Beni Sen taşıyorsun. Âmin.',
    ],
  },
  'grateful-heart': {
    title: 'Şükreden Bir Kalp',
    script: [
      'Bugünden güzel bir şey düşün , ne kadar küçük olursa olsun. Bir an onu tut.',
      'Baba, her iyi armağan Senden gelir. Teşekkür ederim.',
      'Dua edip aldıklarım için , ve esirgendiğim şeyler için teşekkür ederim.',
      'Sıradan saatlerde saklanan lütfu fark etmeyi öğret bana.',
      'Şükran, günümün bittiği nota olsun. Âmin.',
    ],
  },
  'into-rest': {
    title: 'Dinlenmeye',
    script: [
      'Gün bitsin. Elinden geleni yaptın , ve bu yeterli.',
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
      'Baba, her birini bereketle , sağlıkta, yürekte, imanda.',
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
      'Güçlü ve cesur olacağım , yalnız değil, Seninle. Âmin.',
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
      'İsa, huzurunu bize bıraktın , dünyanın verdiği gibi değil, gerçek ve derin.',
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
      'İsmi, anıyı, yarayı getiriyorum , onu Sana uzatıyorum.',
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
      'Gecenin korkusu yok, yarının kaygısı yok , yalnız Senin korumanda.',
      'Korkmayacağım, çünkü Sen hiç uyumazsın. İyi geceler, Baba. Âmin.',
    ],
  },
  'when-i-am-weak': {
    title: 'Güçsüz Olduğumda',
    script: [
      'Burada güçlü görünmek zorunda değilsin.',
      'Rab, gücünün güçsüzlükte tamamlandığını söyledin.',
      'İşte güçsüzlüğüm , onu Senden saklamayı bırakıyorum.',
      'Hiçbir şeyimin kalmadığı yerde tam da orada güçlü ol.',
      'Lütfun bana yeter. Bu yeterli. Âmin.',
    ],
  },
  'thankful-in-hard-times': {
    title: 'Şimdi Bile, Teşekkürler',
    script: [
      'Bu daha zor bir şükran. Nefes al ve dürüst kal.',
      'Baba, şimdi bile , bunun içinde , Senin elini arıyorum.',
      'Beni bunun içinde yalnız bırakmadığın için teşekkür ederim.',
      'Bu dönemin hikâyenin sonu olmadığı için teşekkür ederim.',
      'Şükrü seçiyorum, kolay olduğu için değil, Sen iyi olduğun için. Âmin.',
    ],
  },
};

type Overlay = Record<string, { title: string; script: string[] }>;

const ES: Overlay = {
  'morning-light': {
    title: 'Luz de la Mañana',
    script: [
      'Respira lento… y suelta. Antes de que el día te pida algo, quédate aquí.',
      'Señor, gracias por esta mañana: por el aliento, por un nuevo comienzo.',
      'Te entrego las horas que vienen: mi trabajo, mis palabras, las personas que encontraré.',
      'Donde estoy ansioso, sé mi paz. Donde estoy cansado, sé mi fuerza.',
      'Déjame andar este día sin prisa, consciente de que estás cerca. Amén.',
    ],
  },
  'calm-the-storm': {
    title: 'Calma la Tormenta',
    script: [
      'Pon una mano sobre tu corazón. Siente su latido: estás vivo y eres sostenido.',
      'Jesús, dormiste en medio de una tormenta y la calmaste con una palabra. Háblale a la mía.',
      'Nombro mi inquietud ahora… y la pongo en tus manos.',
      '“Calla, enmudece.” Que esas palabras se posen sobre mi mente como agua serena.',
      'Hoy no me llevará el miedo. Me llevas tú. Amén.',
    ],
  },
  'grateful-heart': {
    title: 'Un Corazón Agradecido',
    script: [
      'Piensa en algo bueno de hoy, por pequeño que sea. Sostenlo un momento.',
      'Padre, todo buen regalo viene de ti. Gracias.',
      'Gracias por lo que pedí y recibí, y por aquello de lo que fui librado.',
      'Enséñame a notar la gracia escondida en las horas comunes.',
      'Que la gratitud sea la nota con que termine mi día. Amén.',
    ],
  },
  'into-rest': {
    title: 'Hacia el Descanso',
    script: [
      'Deja que el día termine. Hiciste lo que pudiste, y es suficiente.',
      'Señor, al acostarme, suelto en tu cuidado lo que quedó sin terminar.',
      'Cuida a las personas que amo mientras dormimos.',
      '“En paz me acostaré y así también dormiré, porque solo tú, Señor, me haces vivir seguro.”',
      'Aquieta mi respiración… calma mis pensamientos… y sostenme hasta la mañana. Amén.',
    ],
  },
  'bless-my-family': {
    title: 'Bendice a Mi Familia',
    script: [
      'Trae a tu mente los rostros de tu familia, uno por uno.',
      'Padre, bendice a cada uno: en salud, en corazón, en fe.',
      'Sana lo que está tenso entre nosotros; ablanda lo que se ha endurecido.',
      'Haz de nuestro hogar un lugar de paciencia y risas.',
      'Únenos en tu amor. Amén.',
    ],
  },
  'courage-for-today': {
    title: 'Valor para Hoy',
    script: [
      'Ponte erguido un momento. Respira hondo.',
      'Señor, no me diste un espíritu de temor, sino de poder, amor y dominio propio.',
      'Dame valor para la conversación, la tarea, el paso que sigo evitando.',
      'Cuando vacile, recuérdame: tú vas delante de mí.',
      'Seré fuerte y valiente, no solo, sino contigo. Amén.',
    ],
  },
  'gratitude-evening': {
    title: 'Contando los Regalos',
    script: [
      'Deja que el día repose. Exhala lo que te pidió.',
      'Padre, antes de nombrar lo que me falta, déjame nombrar lo que recibí.',
      'Gracias por las misericordias comunes que casi pasé de largo hoy.',
      'Gracias por las personas que hacen mi vida más cálida.',
      'Un corazón agradecido es un corazón lleno. Llena el mío esta noche. Amén.',
    ],
  },
  'still-waters': {
    title: 'Aguas Tranquilas',
    script: [
      'Abre las manos. Que tu respiración se calme con cada línea.',
      'Pastor, tú me guías junto a aguas tranquilas. Guíame allí ahora.',
      'Los pensamientos que corren en mí, los dejo a tus pies, uno por uno.',
      'Tú restauras mi alma. Restaura lo que hoy dejó gastado.',
      'No temeré, porque tú estás conmigo. Amén.',
    ],
  },
  'morning-surrender': {
    title: 'Antes del Día',
    script: [
      'El día aún no se ha gastado. Recíbelo aquí, con Dios, antes que nada.',
      'Señor, este día es tuyo antes de ser mío.',
      'Ve delante de mí a cada sala en que entre, a cada palabra que diga.',
      'Donde me tiente la prisa, enséñame a caminar.',
      'Ordena mis horas y guarda mi corazón cerca del tuyo. Amén.',
    ],
  },
  'peace-of-christ': {
    title: 'La Paz que Guarda',
    script: [
      'Apoya ambos pies en el suelo. Estás aquí. Dios está aquí.',
      'Jesús, nos dejaste tu paz, no como la da el mundo, sino real y profunda.',
      'Que esa paz guarde hoy mi corazón y mi mente como un centinela a la puerta.',
      'Lo que no puedo controlar, te lo entrego.',
      'Tu paz basta. Descanso en ella. Amén.',
    ],
  },
  'gratitude-morning': {
    title: 'Primer Gracias',
    script: [
      'Antes de la lista de tareas, una pausa. Un respiro de gratitud.',
      'Padre, gracias por despertarme a otro día de gracia.',
      'Gracias por el aliento, por la luz, por una página en blanco.',
      'Que la gratitud, y no la prisa, marque el tono de mi mañana.',
      'Comienzo hoy agradecido. Amén.',
    ],
  },
  'rest-for-the-weary': {
    title: 'Déjalo Ir',
    script: [
      'El día terminó. Hiciste lo que pudiste, y es suficiente.',
      'Señor, dejo en tu cuidado todo lo que quedó sin terminar.',
      'Las preocupaciones que llevaría a la oscuridad, las dejo contigo.',
      'Tú das sueño a los que amas. Recíbeme ahora.',
      'En paz me acuesto y duermo, porque solo tú me guardas seguro. Amén.',
    ],
  },
  'for-my-children': {
    title: 'Sobre los que Amo',
    script: [
      'Trae a tu mente a cada persona que amas. Sostén su rostro un momento.',
      'Padre, cuida a los que me has confiado.',
      'Guarda su salida y su entrada.',
      'Donde yo les falle, que tu gracia cubra la brecha.',
      'Guárdalos en tu mano, más cerca de lo que yo jamás podría. Amén.',
    ],
  },
  'strength-to-forgive': {
    title: 'Fuerza para Perdonar',
    script: [
      'Respira. Esto es difícil, y Dios lo sabe.',
      'Señor, tú me perdonaste a gran precio. Dame fuerza para perdonar.',
      'Traigo el nombre, el recuerdo, la herida; te los ofrezco.',
      'Líbrame de cargar lo que nunca me tocó cargar.',
      'Sana lo que el perdón abre. Hazme íntegro. Amén.',
    ],
  },
  'sleep-psalm': {
    title: 'Bajo Sus Alas',
    script: [
      'Siente cómo el peso del día deja tus hombros.',
      'El que habita al abrigo del Altísimo morará bajo su sombra.',
      'Señor, cúbreme esta noche como un ave cubre a sus crías.',
      'Sin temor a la noche, sin miedo al mañana, solo tu cuidado.',
      'No temeré, porque tú nunca duermes. Buenas noches, Padre. Amén.',
    ],
  },
  'when-i-am-weak': {
    title: 'Cuando Soy Débil',
    script: [
      'Aquí no tienes que fingir que eres fuerte.',
      'Señor, dijiste que tu poder se perfecciona en la debilidad.',
      'Así que aquí está mi debilidad: dejo de escondértela.',
      'Sé fuerte justo donde ya no me queda nada.',
      'Tu gracia me basta. Con eso alcanza. Amén.',
    ],
  },
  'thankful-in-hard-times': {
    title: 'Aun Ahora, Gracias',
    script: [
      'Esta es una gratitud más difícil. Respira y mantente sincero.',
      'Padre, aun ahora, en esto, busco tu mano.',
      'Gracias por no dejarme solo en ello.',
      'Gracias porque esta etapa no es el final de la historia.',
      'Elijo dar gracias, no porque sea fácil, sino porque tú eres bueno. Amén.',
    ],
  },
};

const PT: Overlay = {
  'morning-light': {
    title: 'Luz da Manhã',
    script: [
      'Respire devagar… e solte. Antes que o dia lhe peça algo, esteja aqui.',
      'Senhor, obrigado por esta manhã: pelo fôlego, por um novo começo.',
      'Entrego-te as horas que virão: meu trabalho, minhas palavras, as pessoas que encontrarei.',
      'Onde estou ansioso, sê a minha paz. Onde estou cansado, sê a minha força.',
      'Deixa-me atravessar este dia sem pressa, ciente de que estás perto. Amém.',
    ],
  },
  'calm-the-storm': {
    title: 'Acalma a Tempestade',
    script: [
      'Ponha a mão sobre o coração. Sinta-o bater: você está vivo e é sustentado.',
      'Jesus, dormiste em meio a uma tempestade e a acalmaste com uma palavra. Fala à minha.',
      'Nomeio a minha inquietação agora… e a coloco em tuas mãos.',
      '“Cala-te, aquieta-te.” Que essas palavras pousem sobre a minha mente como água serena.',
      'Hoje não serei levado pelo medo. Sou levado por ti. Amém.',
    ],
  },
  'grateful-heart': {
    title: 'Um Coração Grato',
    script: [
      'Pense em algo bom de hoje, por menor que seja. Segure-o por um momento.',
      'Pai, todo bom presente vem de ti. Obrigado.',
      'Obrigado pelo que pedi e recebi, e por aquilo de que fui poupado.',
      'Ensina-me a notar a graça escondida nas horas comuns.',
      'Que a gratidão seja a nota com que meu dia termina. Amém.',
    ],
  },
  'into-rest': {
    title: 'Ao Descanso',
    script: [
      'Deixe o dia terminar. Você fez o que pôde, e isso basta.',
      'Senhor, ao me deitar, entrego ao teu cuidado o que ficou por terminar.',
      'Cuida das pessoas que amo enquanto dormimos.',
      '“Em paz me deito e durmo, porque só tu, Senhor, me fazes repousar seguro.”',
      'Acalma a minha respiração… silencia os meus pensamentos… e me sustém até a manhã. Amém.',
    ],
  },
  'bless-my-family': {
    title: 'Abençoa a Minha Família',
    script: [
      'Traga à mente os rostos da sua família, um por um.',
      'Pai, abençoa cada um: na saúde, no coração, na fé.',
      'Cura o que está tenso entre nós; amolece o que se endureceu.',
      'Faz do nosso lar um lugar de paciência e riso.',
      'Une-nos no teu amor. Amém.',
    ],
  },
  'courage-for-today': {
    title: 'Coragem para Hoje',
    script: [
      'Fique ereto por um momento. Respire fundo.',
      'Senhor, não me deste um espírito de medo, mas de poder, amor e equilíbrio.',
      'Dá-me coragem para a conversa, a tarefa, o passo que continuo evitando.',
      'Quando eu vacilar, lembra-me: tu vais adiante de mim.',
      'Serei forte e corajoso, não sozinho, mas contigo. Amém.',
    ],
  },
  'gratitude-evening': {
    title: 'Contando as Dádivas',
    script: [
      'Deixe o dia repousar. Expire o que ele lhe pediu.',
      'Pai, antes de nomear o que me falta, deixa-me nomear o que recebi.',
      'Obrigado pelas misericórdias comuns que quase deixei passar hoje.',
      'Obrigado pelas pessoas que tornam a minha vida mais calorosa.',
      'Um coração grato é um coração cheio. Enche o meu esta noite. Amém.',
    ],
  },
  'still-waters': {
    title: 'Águas Tranquilas',
    script: [
      'Abra as mãos. Que a sua respiração se acalme a cada linha.',
      'Pastor, tu me guias a águas tranquilas. Guia-me até lá agora.',
      'Os pensamentos que correm em mim, deixo-os aos teus pés, um por um.',
      'Tu restauras a minha alma. Restaura o que hoje desgastou.',
      'Não temerei, porque tu estás comigo. Amém.',
    ],
  },
  'morning-surrender': {
    title: 'Antes do Dia',
    script: [
      'O dia ainda não se gastou. Recebe-o aqui, com Deus, antes de tudo.',
      'Senhor, este dia é teu antes de ser meu.',
      'Vai adiante de mim a cada sala em que eu entrar, a cada palavra que eu disser.',
      'Onde a pressa me tentar, ensina-me a caminhar.',
      'Ordena as minhas horas e guarda o meu coração perto do teu. Amém.',
    ],
  },
  'peace-of-christ': {
    title: 'A Paz que Guarda',
    script: [
      'Apoie os dois pés no chão. Você está aqui. Deus está aqui.',
      'Jesus, deixaste-nos a tua paz, não como o mundo a dá, mas real e profunda.',
      'Que essa paz guarde hoje o meu coração e a minha mente como uma sentinela à porta.',
      'O que não posso controlar, entrego a ti.',
      'A tua paz basta. Nela descanso. Amém.',
    ],
  },
  'gratitude-morning': {
    title: 'Primeiro Obrigado',
    script: [
      'Antes da lista de tarefas, uma pausa. Um fôlego de gratidão.',
      'Pai, obrigado por me acordar para mais um dia de graça.',
      'Obrigado pelo fôlego, pela luz, por uma página em branco.',
      'Que a gratidão, e não a pressa, defina o tom da minha manhã.',
      'Começo hoje grato. Amém.',
    ],
  },
  'rest-for-the-weary': {
    title: 'Deixe Ir',
    script: [
      'O dia acabou. Você fez o que pôde, e isso basta.',
      'Senhor, entrego ao teu cuidado tudo o que ficou por terminar.',
      'As preocupações que eu levaria para o escuro, deixo-as contigo.',
      'Tu dás sono aos que amas. Recebe-me agora.',
      'Em paz me deito e durmo, porque só tu me guardas seguro. Amém.',
    ],
  },
  'for-my-children': {
    title: 'Sobre os que Amo',
    script: [
      'Traga à mente cada pessoa que você ama. Segure o rosto dela por um momento.',
      'Pai, cuida dos que me foram confiados.',
      'Guarda a sua saída e a sua entrada.',
      'Onde eu falhar com eles, que a tua graça cubra a falha.',
      'Guarda-os na tua mão, mais perto do que eu jamais poderia. Amém.',
    ],
  },
  'strength-to-forgive': {
    title: 'Força para Perdoar',
    script: [
      'Respire. Isto é difícil, e Deus sabe disso.',
      'Senhor, tu me perdoaste a grande preço. Dá-me força para perdoar.',
      'Trago o nome, a lembrança, a ferida; ofereço-os a ti.',
      'Livra-me de carregar o que nunca me coube carregar.',
      'Cura o que o perdão abre. Faz-me inteiro. Amém.',
    ],
  },
  'sleep-psalm': {
    title: 'Sob Suas Asas',
    script: [
      'Sinta o peso do dia deixar os seus ombros.',
      'Aquele que habita no abrigo do Altíssimo descansará à sua sombra.',
      'Senhor, cobre-me esta noite como uma ave cobre os seus filhotes.',
      'Sem medo da noite, sem receio do amanhã, apenas o teu cuidado.',
      'Não temerei, porque tu nunca dormes. Boa noite, Pai. Amém.',
    ],
  },
  'when-i-am-weak': {
    title: 'Quando Sou Fraco',
    script: [
      'Aqui você não precisa fingir ser forte.',
      'Senhor, disseste que o teu poder se aperfeiçoa na fraqueza.',
      'Então aqui está a minha fraqueza: paro de escondê-la de ti.',
      'Sê forte exatamente onde nada me resta.',
      'A tua graça me basta. Isso é suficiente. Amém.',
    ],
  },
  'thankful-in-hard-times': {
    title: 'Mesmo Agora, Obrigado',
    script: [
      'Esta é uma gratidão mais difícil. Respire e permaneça sincero.',
      'Pai, mesmo agora, nisto, procuro a tua mão.',
      'Obrigado por não me deixares sozinho nisso.',
      'Obrigado porque esta fase não é o fim da história.',
      'Escolho agradecer, não porque seja fácil, mas porque tu és bom. Amém.',
    ],
  },
};

const FR: Overlay = {
  'morning-light': {
    title: 'Lumière du Matin',
    script: [
      'Inspire lentement… et relâche. Avant que le jour ne te demande quoi que ce soit, sois ici.',
      'Seigneur, merci pour ce matin : pour le souffle, pour un nouveau commencement.',
      'Je te confie les heures à venir : mon travail, mes paroles, les personnes que je rencontrerai.',
      'Là où je suis anxieux, sois ma paix. Là où je suis fatigué, sois ma force.',
      'Laisse-moi traverser ce jour sans hâte, conscient que tu es proche. Amen.',
    ],
  },
  'calm-the-storm': {
    title: 'Apaise la Tempête',
    script: [
      'Pose une main sur ton cœur. Sens-le battre : tu es vivant, et tu es tenu.',
      'Jésus, tu as dormi dans une tempête et l’as calmée d’une parole. Parle à la mienne.',
      'Je nomme mon inquiétude maintenant… et je la remets entre tes mains.',
      '“Silence, tais-toi.” Que ces mots se posent sur mon esprit comme une eau calme.',
      'Aujourd’hui, je ne serai pas emporté par la peur. C’est toi qui me portes. Amen.',
    ],
  },
  'grateful-heart': {
    title: 'Un Cœur Reconnaissant',
    script: [
      'Pense à une bonne chose d’aujourd’hui, si petite soit-elle. Garde-la un instant.',
      'Père, tout bon présent vient de toi. Merci.',
      'Merci pour ce que j’ai demandé et reçu, et pour ce dont j’ai été épargné.',
      'Apprends-moi à remarquer la grâce cachée dans les heures ordinaires.',
      'Que la reconnaissance soit la note sur laquelle mon jour s’achève. Amen.',
    ],
  },
  'into-rest': {
    title: 'Vers le Repos',
    script: [
      'Laisse le jour finir. Tu as fait ce que tu pouvais, et cela suffit.',
      'Seigneur, en me couchant, je remets à ta garde ce qui reste inachevé.',
      'Veille sur ceux que j’aime pendant que nous dormons.',
      '“En paix, je me couche et aussitôt je m’endors, car toi seul, Seigneur, me fais reposer en sécurité.”',
      'Ralentis mon souffle… apaise mes pensées… et tiens-moi jusqu’au matin. Amen.',
    ],
  },
  'bless-my-family': {
    title: 'Bénis Ma Famille',
    script: [
      'Amène à ton esprit les visages de ta famille, un à un.',
      'Père, bénis chacun : dans la santé, dans le cœur, dans la foi.',
      'Guéris ce qui est tendu entre nous ; adoucis ce qui s’est durci.',
      'Fais de notre foyer un lieu de patience et de rire.',
      'Unis-nous dans ton amour. Amen.',
    ],
  },
  'courage-for-today': {
    title: 'Du Courage pour Aujourd’hui',
    script: [
      'Tiens-toi droit un instant. Respire profondément.',
      'Seigneur, tu ne m’as pas donné un esprit de peur, mais de force, d’amour et de sagesse.',
      'Donne-moi du courage pour la conversation, la tâche, le pas que je continue d’éviter.',
      'Quand je faiblis, rappelle-moi : tu marches devant moi.',
      'Je serai fort et courageux, non pas seul, mais avec toi. Amen.',
    ],
  },
  'gratitude-evening': {
    title: 'Compter les Dons',
    script: [
      'Laisse le jour se poser. Expire ce qu’il t’a demandé.',
      'Père, avant de nommer ce qui me manque, laisse-moi nommer ce qui m’a été donné.',
      'Merci pour les grâces ordinaires que j’ai presque dépassées aujourd’hui.',
      'Merci pour ceux qui rendent ma vie plus chaleureuse.',
      'Un cœur reconnaissant est un cœur plein. Remplis le mien ce soir. Amen.',
    ],
  },
  'still-waters': {
    title: 'Eaux Paisibles',
    script: [
      'Desserre les mains. Que ton souffle ralentisse à chaque ligne.',
      'Berger, tu me conduis près des eaux paisibles. Conduis-moi là maintenant.',
      'Les pensées qui s’emballent en moi, je les dépose à tes pieds, une à une.',
      'Tu restaures mon âme. Restaure ce que ce jour a usé.',
      'Je ne craindrai pas, car tu es avec moi. Amen.',
    ],
  },
  'morning-surrender': {
    title: 'Avant le Jour',
    script: [
      'Le jour n’est pas encore consumé. Rencontre-le ici, avec Dieu, avant toute chose.',
      'Seigneur, ce jour est à toi avant d’être à moi.',
      'Va devant moi dans chaque pièce où j’entrerai, chaque parole que je dirai.',
      'Là où je suis tenté de me précipiter, apprends-moi à marcher.',
      'Ordonne mes heures, et garde mon cœur près du tien. Amen.',
    ],
  },
  'peace-of-christ': {
    title: 'La Paix qui Garde',
    script: [
      'Pose les deux pieds au sol. Tu es ici. Dieu est ici.',
      'Jésus, tu nous as laissé ta paix, non comme le monde la donne, mais réelle et profonde.',
      'Que cette paix garde aujourd’hui mon cœur et mon esprit comme une sentinelle à la porte.',
      'Ce que je ne peux pas maîtriser, je te le remets.',
      'Ta paix suffit. Je m’y repose. Amen.',
    ],
  },
  'gratitude-morning': {
    title: 'Premier Merci',
    script: [
      'Avant la liste des tâches, une pause. Un souffle de gratitude.',
      'Père, merci de m’éveiller à un nouveau jour de grâce.',
      'Merci pour le souffle, pour la lumière, pour une page neuve.',
      'Que la gratitude, et non la hâte, donne le ton à mon matin.',
      'Je commence ce jour reconnaissant. Amen.',
    ],
  },
  'rest-for-the-weary': {
    title: 'Dépose-le',
    script: [
      'Le jour est fini. Tu as fait ce que tu pouvais, et cela suffit.',
      'Seigneur, je remets à ta garde tout ce qui reste inachevé.',
      'Les soucis que je porterais dans la nuit, je les laisse avec toi.',
      'Tu donnes le sommeil à ceux que tu aimes. Reçois-moi maintenant.',
      'En paix je me couche et je dors, car toi seul me gardes en sécurité. Amen.',
    ],
  },
  'for-my-children': {
    title: 'Sur Ceux que J’aime',
    script: [
      'Amène à ton esprit chaque personne que tu aimes. Tiens son visage un instant.',
      'Père, veille sur ceux qui m’ont été confiés.',
      'Garde leur départ et leur arrivée.',
      'Là où je leur manque, que ta grâce comble le vide.',
      'Garde-les dans ta main, plus près que je ne le pourrais jamais. Amen.',
    ],
  },
  'strength-to-forgive': {
    title: 'La Force de Pardonner',
    script: [
      'Respire. Celui-ci est difficile, et Dieu le sait.',
      'Seigneur, tu m’as pardonné à grand prix. Donne-moi la force de pardonner.',
      'J’apporte le nom, le souvenir, la blessure ; je te les tends.',
      'Libère-moi de porter ce qui ne m’a jamais appartenu.',
      'Guéris ce que le pardon ouvre. Rends-moi entier. Amen.',
    ],
  },
  'sleep-psalm': {
    title: 'Sous Ses Ailes',
    script: [
      'Sens le poids du jour quitter tes épaules.',
      'Celui qui demeure sous l’abri du Très-Haut reposera à son ombre.',
      'Seigneur, couvre-moi cette nuit comme un oiseau couvre ses petits.',
      'Sans peur de la nuit, sans crainte du lendemain, seulement ta garde.',
      'Je ne craindrai pas, car tu ne dors jamais. Bonne nuit, Père. Amen.',
    ],
  },
  'when-i-am-weak': {
    title: 'Quand Je Suis Faible',
    script: [
      'Ici, tu n’as pas à faire semblant d’être fort.',
      'Seigneur, tu as dit que ta puissance s’accomplit dans la faiblesse.',
      'Alors voici ma faiblesse : je cesse de te la cacher.',
      'Sois fort là précisément où il ne me reste rien.',
      'Ta grâce me suffit. Cela suffit. Amen.',
    ],
  },
  'thankful-in-hard-times': {
    title: 'Même Maintenant, Merci',
    script: [
      'C’est une gratitude plus difficile. Respire et reste sincère.',
      'Père, même maintenant, en ceci, je cherche ta main.',
      'Merci de ne pas me laisser seul là-dedans.',
      'Merci que cette saison ne soit pas la fin de l’histoire.',
      'Je choisis de rendre grâce, non parce que c’est facile, mais parce que tu es bon. Amen.',
    ],
  },
};

const DE: Overlay = {
  'morning-light': {
    title: 'Morgenlicht',
    script: [
      'Atme langsam ein… und aus. Bevor der Tag etwas von dir verlangt, sei hier.',
      'Herr, danke für diesen Morgen – für den Atem, für einen neuen Anfang.',
      'Ich gebe dir die kommenden Stunden: meine Arbeit, meine Worte, die Menschen, denen ich begegne.',
      'Wo ich ängstlich bin, sei mein Frieden. Wo ich müde bin, sei meine Kraft.',
      'Lass mich diesen Tag ohne Hast gehen, im Bewusstsein, dass du nahe bist. Amen.',
    ],
  },
  'calm-the-storm': {
    title: 'Stille den Sturm',
    script: [
      'Lege eine Hand auf dein Herz. Spüre, wie es schlägt – du lebst, und du bist gehalten.',
      'Jesus, du hast in einem Sturm geschlafen und ihn mit einem Wort gestillt. Sprich zu meinem.',
      'Ich benenne meine Sorge jetzt… und lege sie in deine Hände.',
      '„Schweig, sei still.“ Lass diese Worte sich über meinen Sinn legen wie ruhiges Wasser.',
      'Heute werde ich nicht von der Angst getragen. Du trägst mich. Amen.',
    ],
  },
  'grateful-heart': {
    title: 'Ein Dankbares Herz',
    script: [
      'Denk an eine gute Sache von heute – wie klein auch immer. Halte sie einen Moment.',
      'Vater, jede gute Gabe kommt von dir. Danke.',
      'Danke für das, worum ich bat und was ich empfing – und für das, wovor ich bewahrt wurde.',
      'Lehre mich, die Gnade zu bemerken, die sich in gewöhnlichen Stunden verbirgt.',
      'Lass Dankbarkeit der Ton sein, mit dem mein Tag endet. Amen.',
    ],
  },
  'into-rest': {
    title: 'In die Ruhe',
    script: [
      'Lass den Tag enden. Du hast getan, was du konntest – und das genügt.',
      'Herr, wenn ich mich hinlege, gebe ich das Unvollendete in deine Obhut.',
      'Wache über die Menschen, die ich liebe, während wir schlafen.',
      '„In Frieden lege ich mich nieder und schlafe, denn du allein, Herr, lässt mich sicher wohnen.“',
      'Verlangsame meinen Atem… beruhige meine Gedanken… und halte mich bis zum Morgen. Amen.',
    ],
  },
  'bless-my-family': {
    title: 'Segne Meine Familie',
    script: [
      'Ruf dir die Gesichter deiner Familie ins Gedächtnis, eins nach dem anderen.',
      'Vater, segne jeden Einzelnen – in der Gesundheit, im Herzen, im Glauben.',
      'Heile, was zwischen uns angespannt ist; erweiche, was hart geworden ist.',
      'Mach unser Zuhause zu einem Ort der Geduld und des Lachens.',
      'Verbinde uns in deiner Liebe. Amen.',
    ],
  },
  'courage-for-today': {
    title: 'Mut für Heute',
    script: [
      'Steh einen Moment aufrecht. Atme tief.',
      'Herr, du hast mir keinen Geist der Furcht gegeben, sondern der Kraft, der Liebe und der Besonnenheit.',
      'Gib mir Mut für das Gespräch, die Aufgabe, den Schritt, den ich immer wieder meide.',
      'Wenn ich wanke, erinnere mich: Du gehst vor mir her.',
      'Ich werde stark und mutig sein – nicht allein, sondern mit dir. Amen.',
    ],
  },
  'gratitude-evening': {
    title: 'Die Gaben Zählen',
    script: [
      'Lass den Tag sich setzen. Atme aus, was er von dir verlangt hat.',
      'Vater, bevor ich nenne, was mir fehlt, lass mich nennen, was mir gegeben wurde.',
      'Danke für die gewöhnlichen Gnaden, an denen ich heute fast vorbeiging.',
      'Danke für die Menschen, die mein Leben wärmer machen.',
      'Ein dankbares Herz ist ein volles Herz. Fülle meines heute Nacht. Amen.',
    ],
  },
  'still-waters': {
    title: 'Stille Wasser',
    script: [
      'Öffne die Hände. Lass deinen Atem mit jeder Zeile langsamer werden.',
      'Hirte, du führst mich zu stillen Wassern. Führe mich jetzt dorthin.',
      'Die Gedanken, die in mir rasen, lege ich zu deinen Füßen, einen nach dem anderen.',
      'Du erquickst meine Seele. Erneuere, was der heutige Tag verschlissen hat.',
      'Ich werde mich nicht fürchten, denn du bist bei mir. Amen.',
    ],
  },
  'morning-surrender': {
    title: 'Vor dem Tag',
    script: [
      'Der Tag ist noch nicht verbraucht. Begegne ihm hier, mit Gott, vor allem anderen.',
      'Herr, dieser Tag gehört dir, ehe er mir gehört.',
      'Geh vor mir her in jeden Raum, den ich betrete, jedes Wort, das ich spreche.',
      'Wo ich versucht bin zu hetzen, lehre mich zu gehen.',
      'Ordne meine Stunden und halte mein Herz nahe bei deinem. Amen.',
    ],
  },
  'peace-of-christ': {
    title: 'Der Frieden, der Bewahrt',
    script: [
      'Stell beide Füße auf den Boden. Du bist hier. Gott ist hier.',
      'Jesus, du hast uns deinen Frieden gelassen – nicht wie die Welt ihn gibt, sondern echt und tief.',
      'Lass diesen Frieden heute mein Herz und meine Gedanken bewahren wie ein Wächter am Tor.',
      'Was ich nicht steuern kann, gebe ich dir.',
      'Dein Frieden genügt. In ihm ruhe ich. Amen.',
    ],
  },
  'gratitude-morning': {
    title: 'Erster Dank',
    script: [
      'Vor der To-do-Liste eine Pause. Ein Atemzug des Dankes.',
      'Vater, danke, dass du mich zu einem neuen Tag der Gnade weckst.',
      'Danke für den Atem, für das Licht, für ein neues Blatt.',
      'Lass Dankbarkeit, nicht Eile, den Ton meines Morgens setzen.',
      'Ich beginne diesen Tag dankbar. Amen.',
    ],
  },
  'rest-for-the-weary': {
    title: 'Leg Es Ab',
    script: [
      'Der Tag ist vorüber. Du hast getan, was du konntest, und das genügt.',
      'Herr, ich lege alles Unvollendete in deine Obhut.',
      'Die Sorgen, die ich in die Dunkelheit trüge, lasse ich bei dir.',
      'Du gibst den Schlaf denen, die du liebst. Nimm mich jetzt auf.',
      'In Frieden lege ich mich nieder und schlafe, denn du allein bewahrst mich sicher. Amen.',
    ],
  },
  'for-my-children': {
    title: 'Über Denen, Die Ich Liebe',
    script: [
      'Ruf dir jeden Menschen ins Gedächtnis, den du liebst. Halte sein Gesicht einen Moment.',
      'Vater, wache über die, die mir anvertraut sind.',
      'Behüte ihren Ausgang und ihren Eingang.',
      'Wo ich an ihnen versage, decke deine Gnade die Lücke.',
      'Halte sie in deiner Hand, näher, als ich es je könnte. Amen.',
    ],
  },
  'strength-to-forgive': {
    title: 'Kraft zu Vergeben',
    script: [
      'Atme. Dieses hier ist schwer, und Gott weiß es.',
      'Herr, du hast mir um einen hohen Preis vergeben. Gib mir Kraft zu vergeben.',
      'Ich bringe den Namen, die Erinnerung, die Wunde – ich halte sie dir hin.',
      'Befreie mich davon, zu tragen, was nie meine Last war.',
      'Heile, was das Vergeben öffnet. Mach mich ganz. Amen.',
    ],
  },
  'sleep-psalm': {
    title: 'Unter Seinen Flügeln',
    script: [
      'Spüre, wie die Last des Tages von deinen Schultern weicht.',
      'Wer unter dem Schirm des Höchsten wohnt, ruht in seinem Schatten.',
      'Herr, bedecke mich diese Nacht, wie ein Vogel seine Jungen bedeckt.',
      'Keine Furcht vor der Nacht, kein Bangen vor dem Morgen – nur deine Obhut.',
      'Ich werde mich nicht fürchten, denn du schläfst nie. Gute Nacht, Vater. Amen.',
    ],
  },
  'when-i-am-weak': {
    title: 'Wenn Ich Schwach Bin',
    script: [
      'Hier musst du nicht vorgeben, stark zu sein.',
      'Herr, du hast gesagt, dass deine Kraft in der Schwachheit vollendet wird.',
      'Also hier ist meine Schwachheit – ich höre auf, sie vor dir zu verbergen.',
      'Sei stark genau dort, wo mir nichts mehr bleibt.',
      'Deine Gnade genügt mir. Das ist genug. Amen.',
    ],
  },
  'thankful-in-hard-times': {
    title: 'Selbst Jetzt, Danke',
    script: [
      'Dies ist ein schwererer Dank. Atme und bleib ehrlich.',
      'Vater, selbst jetzt – hierin – suche ich deine Hand.',
      'Danke, dass du mich darin nicht allein lässt.',
      'Danke, dass diese Zeit nicht das Ende der Geschichte ist.',
      'Ich wähle den Dank, nicht weil es leicht ist, sondern weil du gut bist. Amen.',
    ],
  },
};

const IT: Overlay = {
  'morning-light': { title: 'Luce del Mattino', script: ['Inspira lentamente… ed espira. Prima che il giorno ti chieda qualcosa, resta qui.', 'Signore, grazie per questa mattina, per il respiro e per un nuovo inizio.', 'Ti affido le ore che verranno: il mio lavoro, le mie parole, le persone che incontrerò.', 'Dove sono in ansia, sii la mia pace. Dove sono stanco, sii la mia forza.', 'Fammi attraversare questo giorno senza fretta, consapevole che Tu sei vicino. Amen.'] },
  'calm-the-storm': { title: 'Calma la Tempesta', script: ['Metti una mano sul cuore. Sentilo battere: sei vivo e sei custodito.', 'Gesù, hai dormito durante una tempesta e l’hai calmata con una parola. Parla anche alla mia.', 'Ora do un nome alla mia preoccupazione… e la depongo nelle Tue mani.', '«Taci, calmati.» Lascia che queste parole si posino sulla mia mente come acqua tranquilla.', 'Oggi non sarò trascinato dalla paura. Sei Tu a portarmi. Amen.'] },
  'grateful-heart': { title: 'Un Cuore Riconoscente', script: ['Pensa a una cosa buona di oggi, per quanto piccola. Tienila con te per un momento.', 'Padre, ogni dono buono viene da Te. Grazie.', 'Grazie per ciò che ho chiesto e ricevuto, e per ciò da cui sono stato preservato.', 'Insegnami a riconoscere la grazia nascosta nelle ore ordinarie.', 'Fa’ che la gratitudine sia la nota con cui termina la mia giornata. Amen.'] },
  'into-rest': { title: 'Verso il Riposo', script: ['Lascia finire la giornata. Hai fatto ciò che potevi, ed è abbastanza.', 'Signore, mentre mi corico, affido a Te ciò che è rimasto incompiuto.', 'Veglia sulle persone che amo mentre dormiamo.', '«In pace mi corico e subito mi addormento, perché Tu solo mi fai riposare al sicuro.»', 'Rallenta il mio respiro… acquieta i miei pensieri… e custodiscimi fino al mattino. Amen.'] },
  'bless-my-family': { title: 'Benedici la Mia Famiglia', script: ['Porta alla mente i volti della tua famiglia, uno per uno.', 'Padre, benedici ciascuno nella salute, nel cuore e nella fede.', 'Guarisci ciò che è teso tra noi; ammorbidisci ciò che si è indurito.', 'Fa’ della nostra casa un luogo di pazienza e di riso.', 'Uniscici nel Tuo amore. Amen.'] },
  'courage-for-today': { title: 'Coraggio per Oggi', script: ['Stai dritto per un momento. Respira profondamente.', 'Signore, non mi hai dato uno spirito di paura, ma di forza, amore e saggezza.', 'Dammi coraggio per la conversazione, il compito, il passo che continuo a evitare.', 'Quando vacillo, ricordami che Tu mi precedi.', 'Sarò forte e coraggioso, non da solo, ma con Te. Amen.'] },
  'gratitude-evening': { title: 'Contare i Doni', script: ['Lascia che la giornata si posi. Espira ciò che ti ha chiesto.', 'Padre, prima di nominare ciò che mi manca, fammi nominare ciò che ho ricevuto.', 'Grazie per le misericordie ordinarie accanto alle quali oggi sono quasi passato.', 'Grazie per le persone che rendono più calda la mia vita.', 'Un cuore riconoscente è un cuore pieno. Riempi il mio questa sera. Amen.'] },
  'still-waters': { title: 'Acque Tranquille', script: ['Rilassa le mani. Lascia rallentare il respiro a ogni riga.', 'Pastore, mi conduci accanto ad acque tranquille. Portami lì adesso.', 'I pensieri che corrono dentro di me, li depongo ai Tuoi piedi uno a uno.', 'Tu ristori la mia anima. Ristora ciò che oggi si è consumato.', 'Non avrò paura, perché Tu sei con me. Amen.'] },
  'morning-surrender': { title: 'Prima del Giorno', script: ['Il giorno non è ancora iniziato davvero. Incontralo qui, con Dio, prima di ogni altra cosa.', 'Signore, questo giorno è Tuo prima che mio.', 'Precedimi in ogni stanza in cui entrerò e in ogni parola che dirò.', 'Quando sono tentato di correre, insegnami a camminare.', 'Ordina le mie ore e mantieni il mio cuore vicino al Tuo. Amen.'] },
  'peace-of-christ': { title: 'La Pace che Custodisce', script: ['Appoggia entrambi i piedi a terra. Sei qui. Dio è qui.', 'Gesù, ci hai lasciato la Tua pace: non come la dà il mondo, ma vera e profonda.', 'Fa’ che questa pace custodisca oggi il mio cuore e la mia mente come una sentinella alla porta.', 'Ciò che non posso controllare, lo affido a Te.', 'La Tua pace basta. In essa riposo. Amen.'] },
  'gratitude-morning': { title: 'Il Primo Grazie', script: ['Prima dell’elenco delle cose da fare, una pausa. Un respiro di gratitudine.', 'Padre, grazie per avermi svegliato a un altro giorno di grazia.', 'Grazie per il respiro, per la luce, per una pagina nuova.', 'Fa’ che la gratitudine, non la fretta, dia il tono alla mia mattina.', 'Inizio oggi con gratitudine. Amen.'] },
  'rest-for-the-weary': { title: 'Depone Tutto', script: ['La giornata è finita. Hai fatto ciò che potevi, ed è abbastanza.', 'Signore, depongo nelle Tue mani ogni cosa rimasta incompiuta.', 'Le preoccupazioni che porterei nel buio, le lascio con Te.', 'Tu doni il sonno a chi ami. Accoglimi ora.', 'In pace mi corico e dormo, perché Tu solo mi custodisci al sicuro. Amen.'] },
  'for-my-children': { title: 'Su Coloro che Amo', script: ['Porta alla mente ogni persona che ami. Fermati un momento sul suo volto.', 'Padre, veglia su coloro che mi hai affidato.', 'Custodisci il loro uscire e il loro rientrare.', 'Dove io manco, lascia che la Tua grazia colmi il vuoto.', 'Tienili nella Tua mano, più vicini di quanto io possa mai fare. Amen.'] },
  'strength-to-forgive': { title: 'La Forza di Perdonare', script: ['Respira. Questo è difficile, e Dio lo sa.', 'Signore, mi hai perdonato a caro prezzo. Dammi la forza di perdonare.', 'Porto il nome, il ricordo, la ferita e li tendo a Te.', 'Liberami dal peso di ciò che non avrei mai dovuto portare.', 'Guarisci ciò che il perdono apre. Rendimi integro. Amen.'] },
  'sleep-psalm': { title: 'Sotto le Sue Ali', script: ['Senti il peso della giornata lasciare le tue spalle.', 'Chi dimora al riparo dell’Altissimo riposerà alla Sua ombra.', 'Signore, coprimi questa notte come un uccello copre i suoi piccoli.', 'Niente paura della notte, niente ansia per domani: soltanto la Tua cura.', 'Non avrò paura, perché Tu non dormi mai. Buonanotte, Padre. Amen.'] },
  'when-i-am-weak': { title: 'Quando Sono Debole', script: ['Qui non devi fingere di essere forte.', 'Signore, hai detto che la Tua potenza si compie nella debolezza.', 'Ecco la mia debolezza: smetto di nascondertela.', 'Sii forte proprio dove a me non resta più nulla.', 'La Tua grazia mi basta. È abbastanza. Amen.'] },
  'thankful-in-hard-times': { title: 'Anche Adesso, Grazie', script: ['Questa gratitudine è più difficile. Respira e resta sincero.', 'Padre, anche adesso, proprio qui, cerco la Tua mano.', 'Grazie perché non mi lasci solo in tutto questo.', 'Grazie perché questa stagione non è la fine della storia.', 'Scelgo di rendere grazie, non perché sia facile, ma perché Tu sei buono. Amen.'] },
};

const OVERLAYS: Partial<Record<Locale, Overlay>> = { tr: TR, es: ES, pt: PT, fr: FR, de: DE, it: IT };

/** Guided prayers localized to the active locale (English fallback). */
export function getPrayers(locale: Locale): GuidedPrayer[] {
  const overlay = OVERLAYS[locale];
  if (!overlay) return prayers;
  return prayers.map((p) => {
    const o = overlay[p.id];
    return o ? { ...p, title: o.title, script: o.script } : p;
  });
}

/** Reactive prayers for components. */
export function usePrayers(): GuidedPrayer[] {
  const { locale } = useT();
  return getPrayers(locale);
}
