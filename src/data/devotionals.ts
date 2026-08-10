import type { Locale } from '@/i18n/translations';
import { DEVOTIONAL_CONTENT_IDS } from '@/data/applicationContentPack';
import { getRegisteredApplicationContentPack } from '@/i18n/applicationContent';

/** 2-minute daily devotionals, rotate by day-of-year. Expand toward 365. */
export interface Devotional {
  title: string;
  body: string;
  prayer: string;
}

export const devotionals: Devotional[] = [
  {
    title: 'The Gift of Stillness',
    body:
      'Most of us meet the morning already running , messages, headlines, obligations. ' +
      'Psalm 46 was written in a time of upheaval, yet its center is a whisper: be still. ' +
      'Stillness is not doing nothing; it is remembering who holds everything. ' +
      'For two minutes, let your shoulders drop. The world will keep spinning without ' +
      'your help , it always has. That is not your failure. That is His faithfulness.',
    prayer: 'Lord, quiet the noise in me. Help me trust that You are God and I am not. Amen.',
  },
  {
    title: 'Strength That Isn’t Yours',
    body:
      'Paul wrote “I can do all things” from a prison cell, not a summit. The strength he ' +
      'describes is not self-confidence; it is borrowed strength , the kind that arrives ' +
      'exactly when yours runs out. Whatever today asks of you, you were never meant to ' +
      'carry it alone. Ask. Receive. Walk.',
    prayer: 'Jesus, be my strength where I am weak today. I hand You what feels too heavy. Amen.',
  },
  {
    title: 'Led, Not Driven',
    body:
      'A shepherd walks ahead; a driver pushes from behind. Psalm 23 insists that God ' +
      'leads , to green pastures, beside still waters. If your faith has felt like being ' +
      'driven , hurried, pressured, afraid , that voice is not the Shepherd’s. ' +
      'Today, listen for the voice that leads gently, and follow one step at a time.',
    prayer: 'Shepherd of my soul, teach me the sound of Your voice. Lead me today. Amen.',
  },
  {
    title: 'Rest for the Weary',
    body:
      'Jesus did not say “come to me, all you who have it together.” He called the tired, ' +
      'the burdened, the ones barely holding on. Rest is not a reward for finishing your ' +
      'work; it is a gift offered in the middle of it. Come as you are , that is the ' +
      'whole invitation.',
    prayer: 'Lord, I come tired. Trade my heaviness for Your rest. Amen.',
  },
  {
    title: 'A Future and a Hope',
    body:
      'Jeremiah 29:11 was written to exiles , people whose plans had collapsed. God’s ' +
      'promise wasn’t an instant rescue; it was His character: I have not forgotten you. ' +
      'Your setback is not the end of your story. The Author is still writing.',
    prayer: 'Father, when I can’t see the way, help me trust the One who does. Amen.',
  },
  {
    title: 'Lean In',
    body:
      'Your own understanding is a fine tool and a terrible master. Proverbs invites us ' +
      'to trust with all the heart , not because thinking is wrong, but because our view ' +
      'is small. Bring God the decision you keep turning over. Then listen longer than ' +
      'you speak.',
    prayer: 'Lord, I trust You with the decision on my mind right now. Make my path straight. Amen.',
  },
  {
    title: 'The Antidote to Anxiety',
    body:
      'Paul’s prescription for anxiety is strangely specific: pray about everything, and ' +
      'add thanksgiving. Gratitude is not denial , it is widening the frame until God’s ' +
      'past faithfulness is back in the picture. Name three things you’re thankful for. ' +
      'Watch what it does to the fear.',
    prayer: 'God of peace, guard my heart and mind today. I give You my worries, one by one. Amen.',
  },
  {
    title: 'Light in the Dark',
    body:
      'John did not promise a life without darkness. He promised that the darkness does ' +
      'not win. A single candle does not argue with the night; it simply burns, and the ' +
      'dark gives way. You do not have to fix everything today. You only have to keep your ' +
      'small light lit , and trust the One who is Light itself to do the rest.',
    prayer: 'Jesus, Light of the world, shine in the corners of me that feel dark today. Amen.',
  },
  {
    title: 'Enough for Today',
    body:
      'Manna could not be stored. Each morning the people gathered just enough, and tomorrow ' +
      'they gathered again. God trains us to trust one day at a time , not because He is ' +
      'stingy, but because daily bread makes for a daily relationship. Do not carry tomorrow’s ' +
      'weight into today. Today has enough grace of its own.',
    prayer: 'Father, give me today my daily bread , and the peace to leave tomorrow with You. Amen.',
  },
  {
    title: 'Known and Loved',
    body:
      'Before you formed a single thought this morning, you were already known. Psalm 139 ' +
      'says God knit you together and knows when you sit and when you rise. You are not a ' +
      'stranger begging for attention. You are a child, fully known and , astonishingly , ' +
      'fully loved. Let that be the ground you stand on today.',
    prayer: 'Lord, thank You that I am fully known and still fully loved. Steady me in that. Amen.',
  },
  {
    title: 'The Long Obedience',
    body:
      'Faithfulness is rarely dramatic. It is mostly showing up , one prayer, one kindness, ' +
      'one honest choice at a time. A river carves a canyon not by force but by returning to ' +
      'the same path every day. Your small, repeated yes to God is doing more than you can ' +
      'see. Keep returning.',
    prayer: 'Lord, make me faithful in small things today, trusting You with the shape of the whole. Amen.',
  },
  {
    title: 'When You Feel Forgotten',
    body:
      'Hagar, alone in the desert, gave God a name: “the God who sees me.” When no one else ' +
      'noticed her, He did. If today you feel overlooked , by people, by circumstances, even ' +
      'by your own hopes , hear this: you are seen. Nothing about your life is invisible to ' +
      'the One who counts the stars and calls them each by name.',
    prayer: 'God who sees me, thank You that I am never truly alone. Meet me here. Amen.',
  },
  {
    title: 'The Gift You Didn’t Earn',
    body:
      'Grace is offensive to the part of us that wants to earn its place. But Ephesians is ' +
      'clear: you are saved by grace, through faith, and this is not from yourself , it is a ' +
      'gift. You can stop auditioning for love you already have. Rest is not the reward for ' +
      'finishing; it is the gift that lets you begin again.',
    prayer: 'Father, I receive what I could never earn. Thank You for grace. Teach me to rest in it. Amen.',
  },
  {
    title: 'Streams in the Desert',
    body:
      'Isaiah speaks of rivers in the wasteland , water where you would swear nothing could ' +
      'grow. Your dry season is not the end of the story. God specializes in making life ' +
      'spring up in the exact places we had written off. Watch the ground you gave up on. ' +
      'He is not finished there.',
    prayer: 'Lord, bring streams to the dry places in me. I trust You to make things new. Amen.',
  },
  {
    title: 'Casting, Not Carrying',
    body:
      'Peter uses a physical word: cast. Throw your anxiety onto God the way you would hurl a ' +
      'heavy pack off your shoulders. Why? “Because he cares for you.” Worry pretends to be ' +
      'useful, as if enough turning it over will solve it. It won’t. Prayer moves the weight ' +
      'to the only One strong enough to hold it.',
    prayer: 'Lord, I cast my worry on You , really, not just in words. Carry what I cannot. Amen.',
  },
  {
    title: 'The Voice That Calls You Good',
    body:
      'Before Jesus performed a single miracle, the Father said, “This is my beloved Son, in ' +
      'whom I am well pleased.” His belovedness came first, not as a wage for work done. Yours ' +
      'does too. You do not have to achieve your way into being loved. You get to work from ' +
      'love, not for it.',
    prayer: 'Father, let me hear You call me beloved before I do anything today. Amen.',
  },
  {
    title: 'Do Not Despise Small Beginnings',
    body:
      'Zechariah asks who dares despise the day of small things. We want the finished cathedral; ' +
      'God delights in the first laid stone. Whatever you are starting , a habit, a healing, a ' +
      'reconciliation , do not measure it by how little it looks today. Great things almost ' +
      'always begin embarrassingly small.',
    prayer: 'Lord, bless the small beginning in front of me. Help me be faithful with little. Amen.',
  },
  {
    title: 'He Restores',
    body:
      'The shepherd of Psalm 23 does not drive the sheep onward when they are spent. He makes ' +
      'them lie down; He leads them to still water; He restores the soul. If you are running on ' +
      'empty, the holiest thing you can do may be to stop. Restoration is not laziness. It is ' +
      'obedience to a God who built you to need rest.',
    prayer: 'Shepherd, lead me beside still waters today. Restore what is worn thin in me. Amen.',
  },
  {
    title: 'Love in the Ordinary',
    body:
      'Paul’s famous description of love is not sentimental , it is practical, almost mundane. ' +
      'Patient. Kind. Not easily angered. Keeps no record of wrongs. This is love with its ' +
      'sleeves rolled up, love for Tuesday afternoons and difficult people. Ask not “do I feel ' +
      'love?” but “can I be patient here, kind here, forgiving here?”',
    prayer: 'Lord, make me patient and kind today, especially where it costs me something. Amen.',
  },
  {
    title: 'The Weight of Glory',
    body:
      'Paul calls his hardships “light and momentary” , and this from a man beaten and ' +
      'imprisoned. He could say it because he measured his troubles against an eternity of ' +
      'glory. Your pain is real; he never pretends otherwise. But it is not the largest thing ' +
      'in view. Something far heavier and far kinder is coming.',
    prayer: 'Father, when today feels heavy, lift my eyes to what lasts. Carry me through. Amen.',
  },
  {
    title: 'Return to Me',
    body:
      'The prophets’ most repeated word is not “try harder” but “return.” God is forever ' +
      'inviting His people back , not with a lecture, but with open arms. If you have drifted, ' +
      'the way home is shorter than you fear. One honest turn of the heart, and you will find ' +
      'Him already running toward you.',
    prayer: 'Father, I turn back to You today. Thank You for meeting me before I even arrive. Amen.',
  },
  {
    title: 'Be Still',
    body:
      '“Be still, and know that I am God.” The stillness comes first, then the knowing. We try ' +
      'to reason our way to peace and end up more tangled. Sometimes faith is simply ceasing to ' +
      'strive , letting your hands unclench long enough to remember who is actually holding the ' +
      'world together. It was never you.',
    prayer: 'God, quiet my striving. Help me be still long enough to remember You are God. Amen.',
  },
  {
    title: 'The Friend Who Stays',
    body:
      'Proverbs says there is a friend who sticks closer than a brother. In a world of people ' +
      'who come and go, Jesus is the one who stays , through the failure, the silence, the long ' +
      'night. You are not too much for Him, and you are never too far gone. He is not looking ' +
      'for a reason to leave. He is the friend who stays.',
    prayer: 'Jesus, thank You for staying when others could not. Help me rest in Your faithfulness. Amen.',
  },
  {
    title: 'Joy Comes in the Morning',
    body:
      'The psalmist does not deny the weeping; he says it “may last for the night.” Night is ' +
      'real. But it is not permanent. Grief has a morning on the other side of it, and the God ' +
      'who holds your tears in a bottle has not lost track of a single one. Hold on. Morning is ' +
      'a promise, not a maybe.',
    prayer: 'Lord, in my night, help me trust the morning You have promised. Hold my tears. Amen.',
  },
];

/** Turkish devotionals , same order/length as the English base (the fallback). */
const devotionalsTR: Devotional[] = [
  {
    title: 'Dinginliğin Armağanı',
    body:
      'Çoğumuz sabaha zaten koşarak başlarız , mesajlar, başlıklar, yükümlülükler. ' +
      'Mezmur 46 bir çalkantı döneminde yazıldı, yine de merkezi bir fısıltıdır: sakin ol. ' +
      'Dinginlik hiçbir şey yapmamak değildir; her şeyi kimin tuttuğunu hatırlamaktır. ' +
      'İki dakika boyunca omuzların düşsün. Dünya senin yardımın olmadan da dönmeye ' +
      'devam edecek , hep etti. Bu senin başarısızlığın değil. Bu O’nun sadakati.',
    prayer: 'Rab, içimdeki gürültüyü dindir. Senin Tanrı olduğuna, benimse olmadığıma güvenmeme yardım et. Âmin.',
  },
  {
    title: 'Sana Ait Olmayan Güç',
    body:
      'Pavlus “Her şeyi yapabilirim” sözünü bir zirvede değil, bir hapishane hücresinde yazdı. ' +
      'Anlattığı güç özgüven değildir; ödünç alınmış bir güçtür , tam da seninki tükendiğinde ' +
      'gelen türden. Bugün senden ne isterse istesin, onu asla yalnız taşıman gerekmiyordu. ' +
      'İste. Al. Yürü.',
    prayer: 'İsa, bugün güçsüz olduğum yerde gücüm ol. Ağır gelen şeyi Sana bırakıyorum. Âmin.',
  },
  {
    title: 'Sürüklenmiş Değil, Yönetilmiş',
    body:
      'Bir çoban önden yürür; bir sürücü arkadan iter. Mezmur 23, Tanrı’nın yönlendirdiğinde ' +
      'ısrar eder , yeşil çayırlara, durgun suların yanına. İmanın sürüklenmek gibi hissettirdiyse ' +
      ', telaşlı, baskı altında, korkulu , o ses Çoban’ın değil. ' +
      'Bugün nazikçe yönlendiren sesi dinle ve her seferinde bir adım izle.',
    prayer: 'Canımın Çobanı, sesinin nasıl olduğunu öğret bana. Bugün beni yönlendir. Âmin.',
  },
  {
    title: 'Yorgunlar İçin Dinlenme',
    body:
      'İsa “her şeyi yoluna koymuş olanlar, bana gelin” demedi. Yorgunları, yükü ağır olanları, ' +
      'zar zor tutunanları çağırdı. Dinlenme işini bitirmenin bir ödülü değildir; işin tam ' +
      'ortasında sunulan bir armağandır. Olduğun gibi gel , bütün davet bu.',
    prayer: 'Rab, yorgun geliyorum. Ağırlığımı Senin dinlenmenle değiştir. Âmin.',
  },
  {
    title: 'Bir Gelecek ve Bir Umut',
    body:
      'Yeremya 29:11 sürgündekilere yazıldı , planları çökmüş insanlara. Tanrı’nın vaadi ' +
      'anında bir kurtuluş değildi; O’nun karakteriydi: seni unutmadım. ' +
      'Aksiliğin hikâyenin sonu değil. Yazar hâlâ yazıyor.',
    prayer: 'Baba, yolu göremediğimde, gören O’na güvenmeme yardım et. Âmin.',
  },
  {
    title: 'Yaslan',
    body:
      'Kendi anlayışın iyi bir araç, korkunç bir efendidir. Özdeyişler bizi bütün yürekle ' +
      'güvenmeye çağırır , düşünmek yanlış olduğu için değil, görüşümüz dar olduğu için. ' +
      'Sürekli evirip çevirdiğin kararı Tanrı’ya getir. Sonra konuştuğundan daha uzun süre dinle.',
    prayer: 'Rab, aklımdaki kararla ilgili Sana güveniyorum. Yolumu düz kıl. Âmin.',
  },
  {
    title: 'Kaygının Panzehiri',
    body:
      'Pavlus’un kaygı reçetesi tuhaf biçimde nettir: her şey için dua et ve şükran ekle. ' +
      'Şükran inkâr değildir , çerçeveyi, Tanrı’nın geçmişteki sadakati yeniden görünene dek ' +
      'genişletmektir. Şükrettiğin üç şeyi say. Korkuya ne yaptığını izle.',
    prayer: 'Esenlik Tanrısı, bugün kalbimi ve zihnimi koru. Endişelerimi birer birer Sana veriyorum. Âmin.',
  },
  {
    title: 'Karanlıkta Işık',
    body:
      'Yuhanna karanlıksız bir yaşam vaat etmedi. Karanlığın kazanamayacağını vaat etti. ' +
      'Tek bir mum geceyle tartışmaz; sadece yanar ve karanlık geri çekilir. ' +
      'Bugün her şeyi düzeltmek zorunda değilsin. Yalnızca küçük ışığını yanık tutman ' +
      've gerisini yapması için Işığın kendisi olan O’na güvenmen yeter.',
    prayer: 'İsa, dünyanın Işığı, bugün karanlık hisseden köşelerimde parla. Âmin.',
  },
  {
    title: 'Bugüne Yeter',
    body:
      'Man biriktirilemezdi. Her sabah halk sadece yeterince topladı, ertesi gün yeniden topladı. ' +
      'Tanrı bizi günü gününe güvenmeye alıştırır , cimri olduğu için değil, günlük ekmek ' +
      'günlük bir ilişki kurduğu için. Yarının yükünü bugüne taşıma. ' +
      'Bugünün kendine yetecek lütfu var.',
    prayer: 'Baba, bugün bana günlük ekmeğimi ver , ve yarını Sana bırakacak huzuru. Âmin.',
  },
  {
    title: 'Tanınan ve Sevilen',
    body:
      'Bu sabah tek bir düşünce oluşturmadan önce, zaten tanınıyordun. Mezmur 139, ' +
      'Tanrı’nın seni ördüğünü ve ne zaman oturup ne zaman kalktığını bildiğini söyler. ' +
      'İlgi dilenen bir yabancı değilsin. Tamamen tanınan ve , şaşırtıcı biçimde , ' +
      'tamamen sevilen bir çocuksun. Bugün üzerinde durduğun zemin bu olsun.',
    prayer: 'Rab, tamamen tanındığım halde hâlâ tamamen sevildiğim için teşekkür ederim. Beni bunda sağlam tut. Âmin.',
  },
  {
    title: 'Uzun İtaat',
    body:
      'Sadakat nadiren çarpıcıdır. Çoğunlukla gelmektir , bir dua, bir iyilik, ' +
      'her seferinde bir dürüst seçim. Bir nehir bir kanyonu güçle değil, her gün aynı yola ' +
      'dönerek oyar. Tanrı’ya küçük, tekrarlanan “evet”in gördüğünden çok daha fazlasını ' +
      'yapıyor. Dönmeye devam et.',
    prayer: 'Rab, bugün küçük şeylerde beni sadık kıl, bütünün şeklini Sana emanet ederek. Âmin.',
  },
  {
    title: 'Unutulmuş Hissettiğinde',
    body:
      'Çölde yalnız kalan Hacer, Tanrı’ya bir ad verdi: “beni gören Tanrı.” Başka kimse onu ' +
      'fark etmezken, O fark etti. Bugün göz ardı edilmiş hissediyorsan , insanlar tarafından, ' +
      'koşullar tarafından, hatta kendi umutların tarafından , şunu duy: görülüyorsun. ' +
      'Yıldızları sayan ve her birini adıyla çağıran O’na, hayatında görünmez hiçbir şey yok.',
    prayer: 'Beni gören Tanrı, asla gerçekten yalnız olmadığım için teşekkür ederim. Burada benimle buluş. Âmin.',
  },
  {
    title: 'Hak Etmediğin Armağan',
    body:
      'Lütuf, yerini hak etmek isteyen yanımıza aykırı gelir. Ama Efesliler nettir: ' +
      'iman aracılığıyla, lütufla kurtuldun ve bu senden değil , bir armağandır. ' +
      'Zaten sahip olduğun sevgi için seçmelere girmeyi bırakabilirsin. Dinlenme, ' +
      'bitirmenin ödülü değildir; yeniden başlamana izin veren armağandır.',
    prayer: 'Baba, asla hak edemeyeceğimi alıyorum. Lütuf için teşekkür ederim. Onda dinlenmeyi öğret bana. Âmin.',
  },
  {
    title: 'Çölde Irmaklar',
    body:
      'Yeşaya çorak toprakta ırmaklardan söz eder , hiçbir şeyin büyüyemeyeceğine yemin ' +
      'edeceğin yerde su. Kurak mevsimin hikâyenin sonu değil. Tanrı, tam da vazgeçtiğimiz ' +
      'yerlerde yaşamı filizlendirmekte uzmandır. Umudunu kestiğin toprağı izle. ' +
      'O orada işini bitirmedi.',
    prayer: 'Rab, içimdeki kurak yerlere ırmaklar getir. Her şeyi yenilemen için Sana güveniyorum. Âmin.',
  },
  {
    title: 'Taşımak Değil, Atmak',
    body:
      'Petrus fiziksel bir sözcük kullanır: at. Kaygını, ağır bir yükü omuzlarından fırlatır ' +
      'gibi Tanrı’nın üzerine at. Neden? “Çünkü O seni kayırır.” Endişe, üzerinde yeterince ' +
      'düşünürsen çözüleceğiymiş gibi yararlıymış gibi yapar. Çözülmez. Dua, yükü onu ' +
      'tutacak kadar güçlü olan tek O’na taşır.',
    prayer: 'Rab, kaygımı Sana atıyorum , gerçekten, sadece sözde değil. Taşıyamadığımı Sen taşı. Âmin.',
  },
  {
    title: 'Sana İyi Diyen Ses',
    body:
      'İsa tek bir mucize yapmadan önce, Baba, “Sevgili Oğlum budur, O’ndan hoşnudum” dedi. ' +
      'Sevilmişliği önce geldi, yapılan işin karşılığı olarak değil. Seninki de öyle. ' +
      'Sevilmek için başarıya ulaşmak zorunda değilsin. Sevgiden çalışabilirsin, sevgi için değil.',
    prayer: 'Baba, bugün bir şey yapmadan önce beni sevgili diye çağırdığını duyayım. Âmin.',
  },
  {
    title: 'Küçük Başlangıçları Küçümseme',
    body:
      'Zekeriya, küçük şeylerin gününü küçümsemeye kimin cesaret edeceğini sorar. Biz bitmiş ' +
      'katedrali isteriz; Tanrı ilk konan taştan hoşlanır. Ne başlatıyorsan , bir alışkanlık, ' +
      'bir iyileşme, bir barışma , onu bugün ne kadar küçük göründüğüyle ölçme. ' +
      'Büyük şeyler neredeyse her zaman utandırıcı derecede küçük başlar.',
    prayer: 'Rab, önümdeki küçük başlangıcı bereketle. Azla sadık olmama yardım et. Âmin.',
  },
  {
    title: 'O Onarır',
    body:
      'Mezmur 23’ün çobanı, koyunlar tükendiğinde onları ileri sürmez. Onları yatırır; ' +
      'durgun suya götürür; canı onarır. Boşta koşuyorsan, yapabileceğin en kutsal şey ' +
      'durmak olabilir. Onarım tembellik değildir. Seni dinlenmeye ihtiyaç duyacak şekilde ' +
      'yaratan bir Tanrı’ya itaattir.',
    prayer: 'Çoban, bugün beni durgun suların yanına götür. İçimde yıpranmış olanı onar. Âmin.',
  },
  {
    title: 'Sıradanın İçindeki Sevgi',
    body:
      'Pavlus’un ünlü sevgi tarifi duygusal değil , pratik, neredeyse sıradandır. ' +
      'Sabırlı. İyiliksever. Kolay öfkelenmez. Kötülüğün hesabını tutmaz. Bu, kolları sıvanmış ' +
      'bir sevgi; salı öğleden sonraları ve zor insanlar için bir sevgi. “Sevgi hissediyor ' +
      'muyum?” diye değil, “burada sabırlı, iyiliksever, bağışlayıcı olabilir miyim?” diye sor.',
    prayer: 'Rab, bugün beni sabırlı ve iyiliksever kıl, özellikle bana bir bedele mal olduğu yerde. Âmin.',
  },
  {
    title: 'Görkemin Ağırlığı',
    body:
      'Pavlus sıkıntılarına “hafif ve geçici” der , hem de dövülmüş ve hapsedilmiş bir adamdan. ' +
      'Bunu söyleyebildi, çünkü dertlerini sonsuz bir görkemle ölçtü. Acın gerçek; O bunu asla ' +
      'inkâr etmez. Ama görüşteki en büyük şey o değil. Çok daha ağır ve çok daha iyi bir şey geliyor.',
    prayer: 'Baba, bugün ağır geldiğinde, gözlerimi kalıcı olana kaldır. Beni taşı. Âmin.',
  },
  {
    title: 'Bana Dönün',
    body:
      'Peygamberlerin en çok tekrarladığı söz “daha çok çabala” değil, “dönün”dür. Tanrı ' +
      'halkını sürekli geri çağırır , bir vaazla değil, açık kollarla. Uzaklaştıysan, ' +
      'eve giden yol korktuğundan daha kısa. Kalbin dürüst bir dönüşü, ve O’nu çoktan sana ' +
      'doğru koşarken bulacaksın.',
    prayer: 'Baba, bugün Sana geri dönüyorum. Daha varmadan beni karşıladığın için teşekkür ederim. Âmin.',
  },
  {
    title: 'Sakin Ol',
    body:
      '“Sakin olun, bilin ki, Tanrı benim.” Önce dinginlik gelir, sonra bilmek. Huzura akıl ' +
      'yürüterek ulaşmaya çalışır ve daha da dolaşırız. Bazen iman, sadece çabalamayı ' +
      'bırakmaktır , dünyayı gerçekte kimin bir arada tuttuğunu hatırlayacak kadar uzun süre ' +
      'ellerinin gevşemesine izin vermektir. O hiç sen olmadın.',
    prayer: 'Tanrı, çabalamamı dindir. Senin Tanrı olduğunu hatırlayacak kadar sakin olmama yardım et. Âmin.',
  },
  {
    title: 'Kalan Dost',
    body:
      'Özdeyişler, bir kardeşten daha yakın duran bir dost olduğunu söyler. Gelip geçen ' +
      'insanların dünyasında, kalan O’dur , başarısızlığın, sessizliğin, uzun gecenin içinde. ' +
      'O’na fazla gelmezsin ve asla çok uzağa gitmiş değilsin. O ayrılmak için bahane aramıyor. ' +
      'O, kalan dosttur.',
    prayer: 'İsa, başkaları kalamadığında kaldığın için teşekkür ederim. Senin sadakatinde dinlenmeme yardım et. Âmin.',
  },
  {
    title: 'Sevinç Sabahleyin Gelir',
    body:
      'Mezmur yazarı ağlamayı inkâr etmez; “bir gece sürebilir” der. Gece gerçek. ' +
      'Ama kalıcı değil. Yasın öbür yanında bir sabah var ve gözyaşlarını bir tulumda tutan ' +
      'Tanrı bir tekini bile kaybetmedi. Dayan. Sabah bir “belki” değil, bir vaat.',
    prayer: 'Rab, gecemde, vaat ettiğin sabaha güvenmeme yardım et. Gözyaşlarımı tut. Âmin.',
  },
];

/** Spanish devotionals , same order/length as the English base (the fallback). */
const devotionalsES: Devotional[] = [
  {
    title: 'El Regalo de la Quietud',
    body:
      'La mayoría llegamos a la mañana ya corriendo: mensajes, titulares, obligaciones. ' +
      'El Salmo 46 se escribió en tiempos de agitación, y aun así su centro es un susurro: ' +
      'quédate quieto. La quietud no es no hacer nada; es recordar quién sostiene todo. ' +
      'Por dos minutos, deja caer los hombros. El mundo seguirá girando sin tu ayuda; ' +
      'siempre lo ha hecho. Eso no es tu fracaso. Es su fidelidad.',
    prayer: 'Señor, aquieta el ruido en mí. Ayúdame a confiar en que tú eres Dios y yo no. Amén.',
  },
  {
    title: 'Una Fuerza que No Es Tuya',
    body:
      'Pablo escribió “todo lo puedo” desde una celda, no desde una cima. La fuerza que ' +
      'describe no es confianza en sí mismo; es fuerza prestada, la que llega justo cuando ' +
      'la tuya se acaba. Sea lo que sea que hoy te pida, nunca debiste cargarlo solo. ' +
      'Pide. Recibe. Camina.',
    prayer: 'Jesús, sé mi fuerza donde hoy soy débil. Te entrego lo que siento demasiado pesado. Amén.',
  },
  {
    title: 'Guiado, No Arreado',
    body:
      'Un pastor camina delante; un arriero empuja por detrás. El Salmo 23 insiste en que ' +
      'Dios guía: a verdes praderas, junto a aguas tranquilas. Si tu fe se ha sentido como ' +
      'ser arreada ,apurada, presionada, temerosa,, esa voz no es la del Pastor. ' +
      'Hoy, escucha la voz que guía con suavidad, y sigue un paso a la vez.',
    prayer: 'Pastor de mi alma, enséñame el sonido de tu voz. Guíame hoy. Amén.',
  },
  {
    title: 'Descanso para el Cansado',
    body:
      'Jesús no dijo “vengan a mí los que lo tienen todo resuelto.” Llamó a los cansados, ' +
      'a los cargados, a los que apenas resisten. El descanso no es un premio por terminar ' +
      'tu trabajo; es un regalo ofrecido en medio de él. Ven como estás: esa es toda la ' +
      'invitación.',
    prayer: 'Señor, vengo cansado. Cambia mi pesadez por tu descanso. Amén.',
  },
  {
    title: 'Un Futuro y una Esperanza',
    body:
      'Jeremías 29:11 se escribió a exiliados, personas cuyos planes se habían derrumbado. ' +
      'La promesa de Dios no era un rescate instantáneo; era su carácter: no te he olvidado. ' +
      'Tu revés no es el final de tu historia. El Autor sigue escribiendo.',
    prayer: 'Padre, cuando no veo el camino, ayúdame a confiar en Aquel que sí lo ve. Amén.',
  },
  {
    title: 'Apóyate en Él',
    body:
      'Tu propio entendimiento es una buena herramienta y un pésimo amo. Proverbios nos ' +
      'invita a confiar con todo el corazón, no porque pensar esté mal, sino porque nuestra ' +
      'vista es pequeña. Lleva a Dios esa decisión que sigues dando vueltas. Luego escucha ' +
      'más de lo que hablas.',
    prayer: 'Señor, confío en ti la decisión que tengo en mente ahora. Endereza mi camino. Amén.',
  },
  {
    title: 'El Antídoto para la Ansiedad',
    body:
      'La receta de Pablo para la ansiedad es curiosamente específica: ora por todo, y añade ' +
      'gratitud. La gratitud no es negación; es ampliar el cuadro hasta que la fidelidad ' +
      'pasada de Dios vuelva a la escena. Nombra tres cosas por las que estés agradecido. ' +
      'Observa lo que le hace al miedo.',
    prayer: 'Dios de paz, guarda hoy mi corazón y mi mente. Te entrego mis preocupaciones, una por una. Amén.',
  },
  {
    title: 'Luz en la Oscuridad',
    body:
      'Juan no prometió una vida sin oscuridad. Prometió que la oscuridad no vence. Una sola ' +
      'vela no discute con la noche; simplemente arde, y la oscuridad cede. No tienes que ' +
      'arreglarlo todo hoy. Solo tienes que mantener encendida tu pequeña luz, y confiar en ' +
      'Aquel que es la Luz misma para hacer el resto.',
    prayer: 'Jesús, Luz del mundo, brilla hoy en los rincones de mí que se sienten oscuros. Amén.',
  },
  {
    title: 'Suficiente para Hoy',
    body:
      'El maná no se podía almacenar. Cada mañana el pueblo recogía justo lo suficiente, y al ' +
      'día siguiente recogía de nuevo. Dios nos entrena a confiar un día a la vez, no porque ' +
      'sea tacaño, sino porque el pan diario hace una relación diaria. No cargues el peso de ' +
      'mañana en el hoy. Hoy tiene suficiente gracia propia.',
    prayer: 'Padre, dame hoy mi pan de cada día, y la paz de dejar el mañana contigo. Amén.',
  },
  {
    title: 'Conocido y Amado',
    body:
      'Antes de que formaras un solo pensamiento esta mañana, ya eras conocido. El Salmo 139 ' +
      'dice que Dios te tejió y sabe cuándo te sientas y cuándo te levantas. No eres un ' +
      'extraño mendigando atención. Eres un hijo, plenamente conocido y ,asombrosamente, ' +
      'plenamente amado. Que ese sea el suelo en que te pares hoy.',
    prayer: 'Señor, gracias porque soy plenamente conocido y aun así plenamente amado. Afírmame en eso. Amén.',
  },
  {
    title: 'La Larga Obediencia',
    body:
      'La fidelidad rara vez es dramática. Es sobre todo presentarse: una oración, una bondad, ' +
      'una elección honesta a la vez. Un río talla un cañón no por fuerza, sino por volver al ' +
      'mismo cauce cada día. Tu pequeño “sí” repetido a Dios logra más de lo que puedes ver. ' +
      'Sigue volviendo.',
    prayer: 'Señor, hazme fiel en lo pequeño hoy, confiando a ti la forma del todo. Amén.',
  },
  {
    title: 'Cuando Te Sientes Olvidado',
    body:
      'Agar, sola en el desierto, le dio a Dios un nombre: “el Dios que me ve.” Cuando nadie ' +
      'más la notó, Él sí. Si hoy te sientes pasado por alto ,por la gente, por las ' +
      'circunstancias, incluso por tus propias esperanzas,, escucha esto: eres visto. Nada de ' +
      'tu vida es invisible para Aquel que cuenta las estrellas y las llama por nombre.',
    prayer: 'Dios que me ve, gracias porque nunca estoy realmente solo. Encuéntrame aquí. Amén.',
  },
  {
    title: 'El Regalo que No Ganaste',
    body:
      'La gracia ofende a la parte de nosotros que quiere ganarse su lugar. Pero Efesios es ' +
      'claro: eres salvo por gracia, mediante la fe, y esto no viene de ti; es un regalo. ' +
      'Puedes dejar de audicionar por un amor que ya tienes. El descanso no es el premio por ' +
      'terminar; es el regalo que te deja empezar de nuevo.',
    prayer: 'Padre, recibo lo que nunca podría ganar. Gracias por la gracia. Enséñame a descansar en ella. Amén.',
  },
  {
    title: 'Ríos en el Desierto',
    body:
      'Isaías habla de ríos en el páramo, agua donde jurarías que nada podría crecer. Tu ' +
      'temporada seca no es el final de la historia. Dios se especializa en hacer brotar vida ' +
      'justo en los lugares que dábamos por perdidos. Observa la tierra que abandonaste. ' +
      'Él no ha terminado allí.',
    prayer: 'Señor, trae ríos a los lugares secos en mí. Confío en que harás nuevas las cosas. Amén.',
  },
  {
    title: 'Echar, No Cargar',
    body:
      'Pedro usa una palabra física: echa. Arroja tu ansiedad sobre Dios como lanzarías una ' +
      'mochila pesada de tus hombros. ¿Por qué? “Porque él cuida de ti.” La preocupación ' +
      'finge ser útil, como si darle bastantes vueltas lo resolviera. No lo hará. La oración ' +
      'mueve el peso al único lo bastante fuerte para sostenerlo.',
    prayer: 'Señor, echo mi preocupación sobre ti, de verdad, no solo en palabras. Carga lo que yo no puedo. Amén.',
  },
  {
    title: 'La Voz que Te Llama Amado',
    body:
      'Antes de que Jesús hiciera un solo milagro, el Padre dijo: “Este es mi Hijo amado, en ' +
      'quien tengo complacencia.” Su condición de amado vino primero, no como paga por trabajo ' +
      'hecho. La tuya también. No tienes que abrirte camino a fuerza de logros para ser amado. ' +
      'Trabajas desde el amor, no por él.',
    prayer: 'Padre, déjame oírte llamarme amado antes de hacer nada hoy. Amén.',
  },
  {
    title: 'No Desprecies los Comienzos Pequeños',
    body:
      'Zacarías pregunta quién se atreve a despreciar el día de las pequeñeces. Queremos la ' +
      'catedral terminada; Dios se deleita en la primera piedra colocada. Sea lo que sea que ' +
      'estés empezando ,un hábito, una sanación, una reconciliación,, no lo midas por lo poco ' +
      'que parece hoy. Las grandes cosas casi siempre empiezan vergonzosamente pequeñas.',
    prayer: 'Señor, bendice el pequeño comienzo frente a mí. Ayúdame a ser fiel con lo poco. Amén.',
  },
  {
    title: 'Él Restaura',
    body:
      'El pastor del Salmo 23 no arrea a las ovejas cuando están agotadas. Las hace recostarse; ' +
      'las lleva a aguas tranquilas; restaura el alma. Si andas sin fuerzas, lo más santo que ' +
      'puedes hacer quizá sea detenerte. La restauración no es pereza. Es obediencia a un Dios ' +
      'que te hizo con necesidad de descanso.',
    prayer: 'Pastor, llévame hoy junto a aguas tranquilas. Restaura lo que en mí está gastado. Amén.',
  },
  {
    title: 'El Amor en lo Cotidiano',
    body:
      'La famosa descripción del amor de Pablo no es sentimental; es práctica, casi mundana. ' +
      'Paciente. Bondadoso. No se enoja con facilidad. No lleva cuenta del mal. Es el amor con ' +
      'las mangas remangadas, amor para las tardes de martes y las personas difíciles. No ' +
      'preguntes “¿siento amor?”, sino “¿puedo ser paciente aquí, bondadoso aquí, capaz de perdonar aquí?”',
    prayer: 'Señor, hazme paciente y bondadoso hoy, sobre todo donde me cueste algo. Amén.',
  },
  {
    title: 'El Peso de la Gloria',
    body:
      'Pablo llama a sus penurias “leves y momentáneas”, y esto de un hombre golpeado y ' +
      'encarcelado. Podía decirlo porque medía sus aflicciones contra una eternidad de gloria. ' +
      'Tu dolor es real; él nunca finge lo contrario. Pero no es lo más grande a la vista. ' +
      'Algo mucho más pesado y mucho más bondadoso viene en camino.',
    prayer: 'Padre, cuando el hoy se sienta pesado, levanta mis ojos a lo que permanece. Llévame a través. Amén.',
  },
  {
    title: 'Vuelve a Mí',
    body:
      'La palabra más repetida de los profetas no es “esfuérzate más”, sino “vuelve.” Dios está ' +
      'siempre invitando a su pueblo de regreso, no con un sermón, sino con los brazos abiertos. ' +
      'Si te has alejado, el camino a casa es más corto de lo que temes. Un giro sincero del ' +
      'corazón, y lo hallarás ya corriendo hacia ti.',
    prayer: 'Padre, vuelvo a ti hoy. Gracias por salir a mi encuentro antes incluso de llegar. Amén.',
  },
  {
    title: 'Quédate Quieto',
    body:
      '“Quédate quieto, y reconoce que yo soy Dios.” La quietud viene primero, luego el ' +
      'reconocer. Intentamos razonar hasta la paz y terminamos más enredados. A veces la fe es ' +
      'simplemente dejar de forcejear, dejar que tus manos se abran lo suficiente para recordar ' +
      'quién sostiene de verdad al mundo. Nunca fuiste tú.',
    prayer: 'Dios, aquieta mi forcejeo. Ayúdame a estar quieto lo bastante para recordar que tú eres Dios. Amén.',
  },
  {
    title: 'El Amigo que Se Queda',
    body:
      'Proverbios dice que hay un amigo más unido que un hermano. En un mundo de gente que va y ' +
      'viene, Jesús es quien se queda, a través del fracaso, del silencio, de la larga noche. ' +
      'No eres demasiado para Él, y nunca estás demasiado perdido. Él no busca una razón para ' +
      'irse. Él es el amigo que se queda.',
    prayer: 'Jesús, gracias por quedarte cuando otros no pudieron. Ayúdame a descansar en tu fidelidad. Amén.',
  },
  {
    title: 'La Alegría Viene en la Mañana',
    body:
      'El salmista no niega el llanto; dice que “puede durar la noche.” La noche es real. Pero ' +
      'no es permanente. El duelo tiene una mañana al otro lado, y el Dios que guarda tus ' +
      'lágrimas en un frasco no ha perdido la cuenta de ni una sola. Resiste. La mañana es una ' +
      'promesa, no un quizá.',
    prayer: 'Señor, en mi noche, ayúdame a confiar en la mañana que has prometido. Guarda mis lágrimas. Amén.',
  },
];

/** Portuguese devotionals , same order/length as the English base (the fallback). */
const devotionalsPT: Devotional[] = [
  {
    title: 'O Presente da Quietude',
    body:
      'A maioria de nós chega à manhã já correndo: mensagens, manchetes, obrigações. ' +
      'O Salmo 46 foi escrito em tempos de convulsão, e ainda assim o seu centro é um ' +
      'sussurro: aquieta-te. A quietude não é não fazer nada; é lembrar quem sustenta tudo. ' +
      'Por dois minutos, deixe os ombros caírem. O mundo continuará girando sem a sua ajuda; ' +
      'sempre continuou. Isso não é a sua falha. É a fidelidade dele.',
    prayer: 'Senhor, aquieta o ruído em mim. Ajuda-me a confiar que tu és Deus e eu não. Amém.',
  },
  {
    title: 'Uma Força que Não É Sua',
    body:
      'Paulo escreveu “tudo posso” de uma cela, não de um cume. A força que ele descreve não ' +
      'é autoconfiança; é força emprestada, a que chega exatamente quando a sua se esgota. ' +
      'Seja o que for que hoje lhe peça, você nunca deveria carregá-lo sozinho. ' +
      'Peça. Receba. Caminhe.',
    prayer: 'Jesus, sê a minha força onde hoje sou fraco. Entrego-te o que sinto pesado demais. Amém.',
  },
  {
    title: 'Guiado, Não Empurrado',
    body:
      'Um pastor caminha à frente; um tocador empurra por trás. O Salmo 23 insiste que Deus ' +
      'guia: a verdes pastos, junto a águas tranquilas. Se a sua fé tem parecido ser ' +
      'empurrada , apressada, pressionada, com medo ,, essa voz não é a do Pastor. ' +
      'Hoje, escute a voz que guia com doçura, e siga um passo de cada vez.',
    prayer: 'Pastor da minha alma, ensina-me o som da tua voz. Guia-me hoje. Amém.',
  },
  {
    title: 'Descanso para o Cansado',
    body:
      'Jesus não disse “venham a mim os que têm tudo resolvido.” Ele chamou os cansados, os ' +
      'sobrecarregados, os que mal se aguentam. O descanso não é uma recompensa por terminar ' +
      'o seu trabalho; é um presente oferecido no meio dele. Venha como está: esse é todo o ' +
      'convite.',
    prayer: 'Senhor, venho cansado. Troca o meu peso pelo teu descanso. Amém.',
  },
  {
    title: 'Um Futuro e uma Esperança',
    body:
      'Jeremias 29:11 foi escrito a exilados, pessoas cujos planos haviam desmoronado. ' +
      'A promessa de Deus não era um resgate instantâneo; era o seu caráter: eu não te esqueci. ' +
      'O seu revés não é o fim da sua história. O Autor ainda está escrevendo.',
    prayer: 'Pai, quando não vejo o caminho, ajuda-me a confiar Naquele que vê. Amém.',
  },
  {
    title: 'Apoie-se Nele',
    body:
      'O seu próprio entendimento é uma boa ferramenta e um péssimo senhor. Provérbios nos ' +
      'convida a confiar de todo o coração, não porque pensar seja errado, mas porque a nossa ' +
      'visão é pequena. Leve a Deus aquela decisão que você fica remoendo. Depois, escute mais ' +
      'do que fala.',
    prayer: 'Senhor, confio a ti a decisão que tenho em mente agora. Endireita o meu caminho. Amém.',
  },
  {
    title: 'O Antídoto para a Ansiedade',
    body:
      'A receita de Paulo para a ansiedade é curiosamente específica: ore por tudo, e ' +
      'acrescente gratidão. A gratidão não é negação; é ampliar o quadro até que a fidelidade ' +
      'passada de Deus volte à cena. Nomeie três coisas pelas quais você é grato. ' +
      'Observe o que isso faz com o medo.',
    prayer: 'Deus de paz, guarda hoje o meu coração e a minha mente. Entrego-te as minhas preocupações, uma a uma. Amém.',
  },
  {
    title: 'Luz na Escuridão',
    body:
      'João não prometeu uma vida sem escuridão. Prometeu que a escuridão não vence. Uma única ' +
      'vela não discute com a noite; simplesmente arde, e a escuridão cede. Você não precisa ' +
      'consertar tudo hoje. Só precisa manter acesa a sua pequena luz, e confiar Naquele que é ' +
      'a própria Luz para fazer o resto.',
    prayer: 'Jesus, Luz do mundo, brilha hoje nos cantos de mim que parecem escuros. Amém.',
  },
  {
    title: 'Suficiente para Hoje',
    body:
      'O maná não podia ser armazenado. Cada manhã o povo recolhia apenas o suficiente, e no ' +
      'dia seguinte recolhia de novo. Deus nos treina a confiar um dia de cada vez, não porque ' +
      'seja mesquinho, mas porque o pão diário faz uma relação diária. Não carregue o peso de ' +
      'amanhã para dentro do hoje. O hoje já tem graça suficiente.',
    prayer: 'Pai, dá-me hoje o meu pão de cada dia, e a paz de deixar o amanhã contigo. Amém.',
  },
  {
    title: 'Conhecido e Amado',
    body:
      'Antes de você formar um único pensamento esta manhã, você já era conhecido. O Salmo 139 ' +
      'diz que Deus o teceu e sabe quando você se senta e quando se levanta. Você não é um ' +
      'estranho implorando atenção. Você é um filho, plenamente conhecido e , surpreendentemente , ' +
      'plenamente amado. Que esse seja o chão em que você pisa hoje.',
    prayer: 'Senhor, obrigado porque sou plenamente conhecido e ainda assim plenamente amado. Firma-me nisso. Amém.',
  },
  {
    title: 'A Longa Obediência',
    body:
      'A fidelidade raramente é dramática. É, acima de tudo, comparecer: uma oração, uma ' +
      'bondade, uma escolha honesta de cada vez. Um rio esculpe um cânion não pela força, mas ' +
      'por voltar ao mesmo leito todos os dias. O seu pequeno “sim” repetido a Deus realiza ' +
      'mais do que você pode ver. Continue voltando.',
    prayer: 'Senhor, faz-me fiel nas pequenas coisas hoje, confiando a ti a forma do todo. Amém.',
  },
  {
    title: 'Quando Você Se Sente Esquecido',
    body:
      'Agar, sozinha no deserto, deu a Deus um nome: “o Deus que me vê.” Quando ninguém mais a ' +
      'notou, Ele notou. Se hoje você se sente ignorado , pelas pessoas, pelas circunstâncias, ' +
      'até pelas suas próprias esperanças ,, ouça isto: você é visto. Nada da sua vida é ' +
      'invisível Àquele que conta as estrelas e as chama pelo nome.',
    prayer: 'Deus que me vê, obrigado porque nunca estou verdadeiramente só. Encontra-me aqui. Amém.',
  },
  {
    title: 'O Presente que Você Não Mereceu',
    body:
      'A graça ofende a parte de nós que quer conquistar o seu lugar. Mas Efésios é claro: você ' +
      'é salvo pela graça, mediante a fé, e isso não vem de você; é um presente. Você pode ' +
      'parar de fazer teste para um amor que já tem. O descanso não é a recompensa por ' +
      'terminar; é o presente que permite recomeçar.',
    prayer: 'Pai, recebo o que eu jamais poderia merecer. Obrigado pela graça. Ensina-me a descansar nela. Amém.',
  },
  {
    title: 'Rios no Deserto',
    body:
      'Isaías fala de rios no ermo, água onde você juraria que nada poderia crescer. A sua ' +
      'estação seca não é o fim da história. Deus é especialista em fazer a vida brotar ' +
      'exatamente nos lugares que demos por perdidos. Observe o solo que você abandonou. ' +
      'Ele não terminou ali.',
    prayer: 'Senhor, traz rios aos lugares secos em mim. Confio que farás novas as coisas. Amém.',
  },
  {
    title: 'Lançar, Não Carregar',
    body:
      'Pedro usa uma palavra física: lance. Atire a sua ansiedade sobre Deus como você lançaria ' +
      'uma mochila pesada dos ombros. Por quê? “Porque ele tem cuidado de você.” A preocupação ' +
      'finge ser útil, como se remoê-la o bastante resolvesse. Não resolverá. A oração move o ' +
      'peso para o único forte o suficiente para sustentá-lo.',
    prayer: 'Senhor, lanço a minha preocupação sobre ti, de verdade, não só em palavras. Carrega o que eu não posso. Amém.',
  },
  {
    title: 'A Voz que Te Chama Amado',
    body:
      'Antes de Jesus realizar um único milagre, o Pai disse: “Este é o meu Filho amado, em ' +
      'quem me comprazo.” O seu ser amado veio primeiro, não como pagamento por trabalho feito. ' +
      'O seu também. Você não precisa abrir caminho por meio de conquistas para ser amado. ' +
      'Você trabalha a partir do amor, não por ele.',
    prayer: 'Pai, deixa-me ouvir-te chamar-me amado antes de eu fazer qualquer coisa hoje. Amém.',
  },
  {
    title: 'Não Despreze os Pequenos Começos',
    body:
      'Zacarias pergunta quem ousa desprezar o dia das pequenas coisas. Queremos a catedral ' +
      'pronta; Deus se deleita na primeira pedra assentada. Seja o que for que você está ' +
      'começando , um hábito, uma cura, uma reconciliação ,, não o meça pelo pouco que parece ' +
      'hoje. As grandes coisas quase sempre começam constrangedoramente pequenas.',
    prayer: 'Senhor, abençoa o pequeno começo diante de mim. Ajuda-me a ser fiel com o pouco. Amém.',
  },
  {
    title: 'Ele Restaura',
    body:
      'O pastor do Salmo 23 não toca as ovelhas adiante quando estão esgotadas. Ele as faz ' +
      'deitar; leva-as a águas tranquilas; restaura a alma. Se você está sem forças, a coisa ' +
      'mais santa que pode fazer talvez seja parar. A restauração não é preguiça. É obediência ' +
      'a um Deus que o fez com necessidade de descanso.',
    prayer: 'Pastor, leva-me hoje a águas tranquilas. Restaura o que em mim está desgastado. Amém.',
  },
  {
    title: 'O Amor no Cotidiano',
    body:
      'A famosa descrição do amor de Paulo não é sentimental; é prática, quase comum. Paciente. ' +
      'Bondoso. Não se ira facilmente. Não guarda mágoa. É o amor de mangas arregaçadas, amor ' +
      'para as tardes de terça-feira e as pessoas difíceis. Não pergunte “eu sinto amor?”, mas ' +
      '“posso ser paciente aqui, bondoso aqui, capaz de perdoar aqui?”',
    prayer: 'Senhor, faz-me paciente e bondoso hoje, sobretudo onde me custe algo. Amém.',
  },
  {
    title: 'O Peso da Glória',
    body:
      'Paulo chama as suas dificuldades de “leves e momentâneas” , e isto de um homem ' +
      'espancado e preso. Ele podia dizê-lo porque media as suas aflições contra uma eternidade ' +
      'de glória. A sua dor é real; ele nunca finge o contrário. Mas não é a maior coisa à ' +
      'vista. Algo muito mais pesado e muito mais bondoso está a caminho.',
    prayer: 'Pai, quando o hoje parecer pesado, ergue os meus olhos para o que permanece. Leva-me através. Amém.',
  },
  {
    title: 'Volta para Mim',
    body:
      'A palavra mais repetida dos profetas não é “esforce-se mais”, mas “volte.” Deus está ' +
      'sempre convidando o seu povo de volta, não com um sermão, mas de braços abertos. Se você ' +
      'se afastou, o caminho de casa é mais curto do que você teme. Uma volta sincera do ' +
      'coração, e você O encontrará já correndo em sua direção.',
    prayer: 'Pai, volto para ti hoje. Obrigado por vir ao meu encontro antes mesmo de eu chegar. Amém.',
  },
  {
    title: 'Aquieta-te',
    body:
      '“Aquietai-vos, e sabei que eu sou Deus.” A quietude vem primeiro, depois o saber. ' +
      'Tentamos raciocinar até a paz e acabamos mais enredados. Às vezes a fé é simplesmente ' +
      'parar de lutar, deixar as suas mãos se abrirem o suficiente para lembrar quem realmente ' +
      'sustenta o mundo. Nunca foi você.',
    prayer: 'Deus, aquieta a minha luta. Ajuda-me a ficar quieto o bastante para lembrar que tu és Deus. Amém.',
  },
  {
    title: 'O Amigo que Fica',
    body:
      'Provérbios diz que há um amigo mais chegado que um irmão. Num mundo de pessoas que vêm e ' +
      'vão, Jesus é o que fica, através do fracasso, do silêncio, da longa noite. Você não é ' +
      'demais para Ele, e nunca está longe demais. Ele não procura um motivo para partir. ' +
      'Ele é o amigo que fica.',
    prayer: 'Jesus, obrigado por ficares quando outros não puderam. Ajuda-me a descansar na tua fidelidade. Amém.',
  },
  {
    title: 'A Alegria Vem pela Manhã',
    body:
      'O salmista não nega o choro; diz que ele “pode durar a noite.” A noite é real. Mas não é ' +
      'permanente. O luto tem uma manhã do outro lado, e o Deus que guarda as suas lágrimas num ' +
      'odre não perdeu a conta de uma só. Aguente firme. A manhã é uma promessa, não um talvez.',
    prayer: 'Senhor, na minha noite, ajuda-me a confiar na manhã que prometeste. Guarda as minhas lágrimas. Amém.',
  },
];

/** French devotionals , same order/length as the English base (the fallback). */
const devotionalsFR: Devotional[] = [
  {
    title: 'Le Don du Silence',
    body:
      'La plupart d’entre nous abordent le matin déjà en courant : messages, gros titres, ' +
      'obligations. Le Psaume 46 fut écrit en temps de bouleversement, et pourtant son centre ' +
      'est un murmure : sois tranquille. Le silence n’est pas ne rien faire ; c’est se rappeler ' +
      'qui tient tout. Deux minutes durant, laisse tomber tes épaules. Le monde continuera de ' +
      'tourner sans ton aide ; il l’a toujours fait. Ce n’est pas ton échec. C’est sa fidélité.',
    prayer: 'Seigneur, apaise le bruit en moi. Aide-moi à croire que tu es Dieu et que je ne le suis pas. Amen.',
  },
  {
    title: 'Une Force qui N’est Pas la Tienne',
    body:
      'Paul a écrit « je peux tout » depuis une cellule, non depuis un sommet. La force qu’il ' +
      'décrit n’est pas la confiance en soi ; c’est une force empruntée, celle qui arrive juste ' +
      'quand la tienne s’épuise. Quoi que ce jour te demande, tu n’as jamais été fait pour le ' +
      'porter seul. Demande. Reçois. Marche.',
    prayer: 'Jésus, sois ma force là où je suis faible aujourd’hui. Je te remets ce qui me semble trop lourd. Amen.',
  },
  {
    title: 'Conduit, Non Poussé',
    body:
      'Un berger marche devant ; un meneur pousse par-derrière. Le Psaume 23 affirme que Dieu ' +
      'conduit : vers de verts pâturages, près des eaux paisibles. Si ta foi t’a semblé être ' +
      'poussée , pressée, sous pression, apeurée ,, cette voix n’est pas celle du Berger. ' +
      'Aujourd’hui, écoute la voix qui conduit avec douceur, et suis un pas à la fois.',
    prayer: 'Berger de mon âme, apprends-moi le son de ta voix. Conduis-moi aujourd’hui. Amen.',
  },
  {
    title: 'Du Repos pour l’Épuisé',
    body:
      'Jésus n’a pas dit « venez à moi, vous qui avez tout en main. » Il a appelé les fatigués, ' +
      'les accablés, ceux qui tiennent à peine. Le repos n’est pas une récompense pour avoir ' +
      'fini ton travail ; c’est un don offert au milieu de celui-ci. Viens tel que tu es : ' +
      'c’est toute l’invitation.',
    prayer: 'Seigneur, je viens fatigué. Échange ma lourdeur contre ton repos. Amen.',
  },
  {
    title: 'Un Avenir et une Espérance',
    body:
      'Jérémie 29.11 fut écrit à des exilés, des gens dont les plans s’étaient effondrés. ' +
      'La promesse de Dieu n’était pas un secours instantané ; c’était son caractère : je ne ' +
      't’ai pas oublié. Ton revers n’est pas la fin de ton histoire. L’Auteur écrit encore.',
    prayer: 'Père, quand je ne vois pas le chemin, aide-moi à faire confiance à Celui qui le voit. Amen.',
  },
  {
    title: 'Appuie-toi sur Lui',
    body:
      'Ta propre intelligence est un bon outil et un piètre maître. Les Proverbes nous invitent ' +
      'à nous confier de tout notre cœur, non parce que penser est mauvais, mais parce que ' +
      'notre vue est petite. Apporte à Dieu la décision que tu retournes sans cesse. Puis ' +
      'écoute plus que tu ne parles.',
    prayer: 'Seigneur, je te confie la décision qui m’occupe l’esprit maintenant. Aplanis mon chemin. Amen.',
  },
  {
    title: 'L’Antidote à l’Anxiété',
    body:
      'L’ordonnance de Paul contre l’anxiété est étrangement précise : prie pour tout, et ajoute ' +
      'l’action de grâce. La gratitude n’est pas du déni ; c’est élargir le cadre jusqu’à ce que ' +
      'la fidélité passée de Dieu revienne dans l’image. Nomme trois choses dont tu es ' +
      'reconnaissant. Regarde ce que cela fait à la peur.',
    prayer: 'Dieu de paix, garde aujourd’hui mon cœur et mon esprit. Je te remets mes soucis, un à un. Amen.',
  },
  {
    title: 'La Lumière dans les Ténèbres',
    body:
      'Jean n’a pas promis une vie sans ténèbres. Il a promis que les ténèbres ne l’emportent ' +
      'pas. Une seule bougie ne discute pas avec la nuit ; elle brûle, simplement, et ' +
      'l’obscurité cède. Tu n’as pas à tout réparer aujourd’hui. Tu dois seulement garder ' +
      'allumée ta petite lumière, et te fier à Celui qui est la Lumière même pour le reste.',
    prayer: 'Jésus, Lumière du monde, brille aujourd’hui dans les recoins de moi qui semblent sombres. Amen.',
  },
  {
    title: 'Assez pour Aujourd’hui',
    body:
      'La manne ne pouvait être stockée. Chaque matin le peuple en ramassait juste assez, et le ' +
      'lendemain il en ramassait de nouveau. Dieu nous entraîne à faire confiance un jour à la ' +
      'fois, non parce qu’il est avare, mais parce que le pain quotidien fait une relation ' +
      'quotidienne. Ne porte pas le poids de demain dans aujourd’hui. Ce jour a bien assez de sa propre grâce.',
    prayer: 'Père, donne-moi aujourd’hui mon pain de ce jour, et la paix de te laisser demain. Amen.',
  },
  {
    title: 'Connu et Aimé',
    body:
      'Avant que tu ne formes une seule pensée ce matin, tu étais déjà connu. Le Psaume 139 dit ' +
      'que Dieu t’a tissé et sait quand tu t’assieds et quand tu te lèves. Tu n’es pas un ' +
      'étranger quémandant de l’attention. Tu es un enfant, pleinement connu et , étonnamment , ' +
      'pleinement aimé. Que ce soit le sol où tu te tiens aujourd’hui.',
    prayer: 'Seigneur, merci : je suis pleinement connu et pourtant pleinement aimé. Affermis-moi là-dessus. Amen.',
  },
  {
    title: 'La Longue Obéissance',
    body:
      'La fidélité est rarement spectaculaire. C’est surtout être présent : une prière, une ' +
      'bonté, un choix honnête à la fois. Une rivière creuse un canyon non par la force, mais en ' +
      'revenant au même lit chaque jour. Ton petit « oui » répété à Dieu accomplit plus que tu ' +
      'ne peux voir. Continue de revenir.',
    prayer: 'Seigneur, rends-moi fidèle dans les petites choses aujourd’hui, te confiant la forme de l’ensemble. Amen.',
  },
  {
    title: 'Quand Tu Te Sens Oublié',
    body:
      'Agar, seule au désert, donna à Dieu un nom : « le Dieu qui me voit. » Quand personne ' +
      'd’autre ne la remarquait, lui le faisait. Si aujourd’hui tu te sens négligé , par les ' +
      'gens, par les circonstances, même par tes propres espoirs ,, entends ceci : tu es vu. ' +
      'Rien de ta vie n’est invisible à Celui qui compte les étoiles et les appelle chacune par leur nom.',
    prayer: 'Dieu qui me vois, merci : je ne suis jamais vraiment seul. Rejoins-moi ici. Amen.',
  },
  {
    title: 'Le Don que Tu N’as Pas Mérité',
    body:
      'La grâce heurte la part de nous qui veut gagner sa place. Mais l’épître aux Éphésiens est ' +
      'claire : tu es sauvé par grâce, au moyen de la foi, et cela ne vient pas de toi ; c’est ' +
      'un don. Tu peux cesser de passer une audition pour un amour que tu as déjà. Le repos ' +
      'n’est pas la récompense d’avoir fini ; c’est le don qui te permet de recommencer.',
    prayer: 'Père, je reçois ce que je n’aurais jamais pu mériter. Merci pour la grâce. Apprends-moi à m’y reposer. Amen.',
  },
  {
    title: 'Des Fleuves dans le Désert',
    body:
      'Ésaïe parle de fleuves dans la lande, de l’eau là où tu jurerais que rien ne pourrait ' +
      'pousser. Ta saison aride n’est pas la fin de l’histoire. Dieu se spécialise à faire ' +
      'jaillir la vie précisément aux endroits que nous avions abandonnés. Regarde le sol sur ' +
      'lequel tu avais renoncé. Il n’y a pas fini.',
    prayer: 'Seigneur, amène des fleuves aux lieux arides en moi. Je me fie à toi pour faire toutes choses nouvelles. Amen.',
  },
  {
    title: 'Jeter, Non Porter',
    body:
      'Pierre emploie un mot physique : jette. Lance ton anxiété sur Dieu comme tu jetterais un ' +
      'sac trop lourd de tes épaules. Pourquoi ? « Parce qu’il prend soin de toi. » L’inquiétude ' +
      'fait semblant d’être utile, comme si la retourner assez la résolvait. Elle ne le fera ' +
      'pas. La prière déplace le poids vers le seul assez fort pour le porter.',
    prayer: 'Seigneur, je jette mon souci sur toi, vraiment, pas seulement en paroles. Porte ce que je ne peux pas. Amen.',
  },
  {
    title: 'La Voix qui Te Dit Bien-Aimé',
    body:
      'Avant que Jésus n’accomplisse un seul miracle, le Père a dit : « Celui-ci est mon Fils ' +
      'bien-aimé, en qui j’ai mis toute mon affection. » Son état de bien-aimé est venu d’abord, ' +
      'non comme un salaire pour un travail accompli. Le tien aussi. Tu n’as pas à te frayer un ' +
      'chemin par tes exploits pour être aimé. Tu œuvres à partir de l’amour, non pour lui.',
    prayer: 'Père, laisse-moi t’entendre m’appeler bien-aimé avant que je ne fasse quoi que ce soit aujourd’hui. Amen.',
  },
  {
    title: 'Ne Méprise Pas les Petits Commencements',
    body:
      'Zacharie demande qui ose mépriser le jour des petits commencements. Nous voulons la ' +
      'cathédrale achevée ; Dieu se réjouit de la première pierre posée. Quoi que tu commences , ' +
      'une habitude, une guérison, une réconciliation ,, ne le mesure pas à ce qu’il paraît peu ' +
      'aujourd’hui. Les grandes choses commencent presque toujours d’une petitesse gênante.',
    prayer: 'Seigneur, bénis le petit commencement devant moi. Aide-moi à être fidèle avec peu. Amen.',
  },
  {
    title: 'Il Restaure',
    body:
      'Le berger du Psaume 23 ne pousse pas les brebis en avant quand elles sont épuisées. Il ' +
      'les fait se coucher ; il les mène vers des eaux paisibles ; il restaure l’âme. Si tu ' +
      'tournes à vide, la chose la plus sainte que tu puisses faire est peut-être de t’arrêter. ' +
      'La restauration n’est pas de la paresse. C’est l’obéissance à un Dieu qui t’a fait avec un besoin de repos.',
    prayer: 'Berger, mène-moi aujourd’hui près des eaux paisibles. Restaure ce qui en moi est usé. Amen.',
  },
  {
    title: 'L’Amour dans l’Ordinaire',
    body:
      'La célèbre description de l’amour par Paul n’est pas sentimentale ; elle est pratique, ' +
      'presque banale. Patient. Bon. Ne s’irrite pas facilement. Ne tient pas compte du mal. ' +
      'C’est l’amour aux manches retroussées, l’amour pour les mardis après-midi et les gens ' +
      'difficiles. Ne demande pas « est-ce que je ressens de l’amour ? », mais « puis-je être patient ici, bon ici, capable de pardonner ici ? »',
    prayer: 'Seigneur, rends-moi patient et bon aujourd’hui, surtout là où cela me coûte quelque chose. Amen.',
  },
  {
    title: 'Le Poids de la Gloire',
    body:
      'Paul appelle ses épreuves « légères et momentanées » , et cela d’un homme battu et ' +
      'emprisonné. Il pouvait le dire parce qu’il mesurait ses détresses à une éternité de ' +
      'gloire. Ta douleur est réelle ; il ne prétend jamais le contraire. Mais ce n’est pas la ' +
      'plus grande chose en vue. Quelque chose de bien plus lourd et de bien plus tendre s’en vient.',
    prayer: 'Père, quand ce jour semble lourd, lève mes yeux vers ce qui demeure. Porte-moi à travers. Amen.',
  },
  {
    title: 'Reviens à Moi',
    body:
      'Le mot le plus répété des prophètes n’est pas « efforce-toi davantage », mais « reviens. » ' +
      'Dieu invite sans cesse son peuple à revenir, non par un sermon, mais les bras ouverts. ' +
      'Si tu t’es éloigné, le chemin du retour est plus court que tu ne le crains. Un seul ' +
      'retour sincère du cœur, et tu le trouveras déjà courant vers toi.',
    prayer: 'Père, je reviens à toi aujourd’hui. Merci de venir à ma rencontre avant même que j’arrive. Amen.',
  },
  {
    title: 'Sois Tranquille',
    body:
      '« Arrêtez, et sachez que je suis Dieu. » Le silence vient d’abord, puis la connaissance. ' +
      'Nous essayons de raisonner jusqu’à la paix et finissons plus emmêlés. Parfois la foi, ' +
      'c’est simplement cesser de lutter, laisser tes mains se desserrer assez longtemps pour te ' +
      'rappeler qui tient vraiment le monde. Ce n’a jamais été toi.',
    prayer: 'Dieu, apaise mon agitation. Aide-moi à rester tranquille assez longtemps pour me rappeler que tu es Dieu. Amen.',
  },
  {
    title: 'L’Ami qui Reste',
    body:
      'Les Proverbes disent qu’il y a un ami plus attaché qu’un frère. Dans un monde de gens qui ' +
      'vont et viennent, Jésus est celui qui reste , à travers l’échec, le silence, la longue ' +
      'nuit. Tu n’es pas trop pour lui, et tu n’es jamais trop loin. Il ne cherche pas une ' +
      'raison de partir. Il est l’ami qui reste.',
    prayer: 'Jésus, merci d’être resté quand d’autres ne le pouvaient pas. Aide-moi à me reposer dans ta fidélité. Amen.',
  },
  {
    title: 'La Joie Vient au Matin',
    body:
      'Le psalmiste ne nie pas les pleurs ; il dit qu’ils « peuvent durer la nuit. » La nuit est ' +
      'réelle. Mais elle n’est pas permanente. Le deuil a un matin de l’autre côté, et le Dieu ' +
      'qui garde tes larmes dans une outre n’en a pas perdu une seule. Tiens bon. Le matin est ' +
      'une promesse, non un peut-être.',
    prayer: 'Seigneur, dans ma nuit, aide-moi à croire au matin que tu as promis. Garde mes larmes. Amen.',
  },
];

/** German devotionals , same order/length as the English base (the fallback). */
const devotionalsDE: Devotional[] = [
  {
    title: 'Das Geschenk der Stille',
    body:
      'Die meisten von uns begegnen dem Morgen schon im Laufschritt: Nachrichten, Schlagzeilen, ' +
      'Pflichten. Der Psalm 46 wurde in einer Zeit der Umwälzung geschrieben, und doch ist sein ' +
      'Zentrum ein Flüstern: sei still. Stille ist nicht Nichtstun; sie ist das Erinnern, wer ' +
      'alles hält. Zwei Minuten lang lass deine Schultern sinken. Die Welt wird sich ohne deine ' +
      'Hilfe weiterdrehen – das tat sie immer. Das ist nicht dein Versagen. Das ist seine Treue.',
    prayer: 'Herr, stille den Lärm in mir. Hilf mir zu vertrauen, dass du Gott bist und ich nicht. Amen.',
  },
  {
    title: 'Eine Kraft, die Nicht Deine Ist',
    body:
      'Paulus schrieb „Ich vermag alles“ aus einer Gefängniszelle, nicht von einem Gipfel. Die ' +
      'Kraft, die er beschreibt, ist nicht Selbstvertrauen; es ist geliehene Kraft – die Art, die ' +
      'genau dann kommt, wenn deine ausgeht. Was auch immer der heutige Tag von dir verlangt, du ' +
      'warst nie dafür bestimmt, es allein zu tragen. Bitte. Empfange. Geh.',
    prayer: 'Jesus, sei meine Kraft, wo ich heute schwach bin. Ich übergebe dir, was mir zu schwer scheint. Amen.',
  },
  {
    title: 'Geführt, Nicht Getrieben',
    body:
      'Ein Hirte geht voran; ein Treiber drängt von hinten. Der Psalm 23 besteht darauf, dass ' +
      'Gott führt – zu grünen Auen, an stille Wasser. Wenn sich dein Glaube wie ein ' +
      'Getriebenwerden angefühlt hat – gehetzt, unter Druck, ängstlich –, ist diese Stimme nicht ' +
      'die des Hirten. Höre heute auf die Stimme, die sanft führt, und folge einen Schritt nach dem anderen.',
    prayer: 'Hirte meiner Seele, lehre mich den Klang deiner Stimme. Führe mich heute. Amen.',
  },
  {
    title: 'Ruhe für die Müden',
    body:
      'Jesus sagte nicht: „Kommt zu mir, die ihr alles im Griff habt.“ Er rief die Müden, die ' +
      'Beladenen, die, die sich kaum halten. Ruhe ist keine Belohnung dafür, dass du deine ' +
      'Arbeit beendest; sie ist ein Geschenk mitten in ihr. Komm, wie du bist – das ist die ' +
      'ganze Einladung.',
    prayer: 'Herr, ich komme müde. Tausche meine Schwere gegen deine Ruhe. Amen.',
  },
  {
    title: 'Zukunft und Hoffnung',
    body:
      'Jeremia 29,11 wurde an Verbannte geschrieben – Menschen, deren Pläne zusammengebrochen ' +
      'waren. Gottes Verheißung war keine sofortige Rettung; sie war sein Wesen: Ich habe dich ' +
      'nicht vergessen. Dein Rückschlag ist nicht das Ende deiner Geschichte. Der Autor schreibt noch.',
    prayer: 'Vater, wenn ich den Weg nicht sehe, hilf mir, dem zu vertrauen, der ihn sieht. Amen.',
  },
  {
    title: 'Lehne Dich an Ihn',
    body:
      'Dein eigener Verstand ist ein gutes Werkzeug und ein schrecklicher Herr. Die Sprüche laden ' +
      'uns ein, von ganzem Herzen zu vertrauen – nicht weil Denken falsch ist, sondern weil ' +
      'unsere Sicht klein ist. Bring Gott die Entscheidung, die du immer wieder wälzt. Dann höre ' +
      'länger, als du redest.',
    prayer: 'Herr, ich vertraue dir die Entscheidung an, die mich gerade beschäftigt. Mach meinen Weg gerade. Amen.',
  },
  {
    title: 'Das Gegenmittel gegen die Angst',
    body:
      'Paulus’ Rezept gegen die Angst ist seltsam genau: bete über alles, und füge Dank hinzu. ' +
      'Dankbarkeit ist keine Verleugnung – sie weitet den Rahmen, bis Gottes vergangene Treue ' +
      'wieder ins Bild kommt. Nenne drei Dinge, für die du dankbar bist. Sieh, was das mit der Furcht macht.',
    prayer: 'Gott des Friedens, bewahre heute mein Herz und meine Gedanken. Ich gebe dir meine Sorgen, eine nach der anderen. Amen.',
  },
  {
    title: 'Licht in der Dunkelheit',
    body:
      'Johannes versprach kein Leben ohne Dunkelheit. Er versprach, dass die Dunkelheit nicht ' +
      'siegt. Eine einzige Kerze streitet nicht mit der Nacht; sie brennt einfach, und das ' +
      'Dunkel weicht. Du musst heute nicht alles in Ordnung bringen. Du musst nur dein kleines ' +
      'Licht am Brennen halten – und dem vertrauen, der das Licht selbst ist, für den Rest.',
    prayer: 'Jesus, Licht der Welt, leuchte heute in den Ecken von mir, die sich dunkel anfühlen. Amen.',
  },
  {
    title: 'Genug für Heute',
    body:
      'Das Manna ließ sich nicht aufbewahren. Jeden Morgen sammelte das Volk gerade genug, und am ' +
      'nächsten Tag sammelte es erneut. Gott übt uns, einen Tag nach dem anderen zu vertrauen – ' +
      'nicht weil er geizig ist, sondern weil tägliches Brot eine tägliche Beziehung macht. Trage ' +
      'die Last von morgen nicht in das Heute. Der heutige Tag hat genug eigene Gnade.',
    prayer: 'Vater, gib mir heute mein tägliches Brot – und den Frieden, das Morgen bei dir zu lassen. Amen.',
  },
  {
    title: 'Gekannt und Geliebt',
    body:
      'Bevor du heute Morgen einen einzigen Gedanken fasstest, warst du schon gekannt. Der Psalm ' +
      '139 sagt, Gott hat dich gewoben und weiß, wann du dich setzt und wann du aufstehst. Du ' +
      'bist kein Fremder, der um Aufmerksamkeit bettelt. Du bist ein Kind, ganz gekannt und – ' +
      'erstaunlicherweise – ganz geliebt. Das sei der Boden, auf dem du heute stehst.',
    prayer: 'Herr, danke, dass ich ganz gekannt und dennoch ganz geliebt bin. Festige mich darin. Amen.',
  },
  {
    title: 'Der Lange Gehorsam',
    body:
      'Treue ist selten dramatisch. Sie ist meistens da sein – ein Gebet, eine Freundlichkeit, ' +
      'eine ehrliche Entscheidung nach der anderen. Ein Fluss gräbt eine Schlucht nicht durch ' +
      'Gewalt, sondern indem er jeden Tag zum selben Bett zurückkehrt. Dein kleines, wiederholtes ' +
      'Ja zu Gott bewirkt mehr, als du sehen kannst. Kehre weiter zurück.',
    prayer: 'Herr, mach mich heute treu im Kleinen und vertrau dir die Gestalt des Ganzen an. Amen.',
  },
  {
    title: 'Wenn Du Dich Vergessen Fühlst',
    body:
      'Hagar, allein in der Wüste, gab Gott einen Namen: „der Gott, der mich sieht.“ Als niemand ' +
      'sonst sie bemerkte, tat er es. Wenn du dich heute übersehen fühlst – von Menschen, von den ' +
      'Umständen, sogar von deinen eigenen Hoffnungen –, dann höre dies: du wirst gesehen. Nichts ' +
      'an deinem Leben ist unsichtbar für den, der die Sterne zählt und jeden bei Namen ruft.',
    prayer: 'Gott, der mich sieht, danke, dass ich nie wirklich allein bin. Begegne mir hier. Amen.',
  },
  {
    title: 'Das Geschenk, das Du Nicht Verdient Hast',
    body:
      'Die Gnade beleidigt den Teil in uns, der sich seinen Platz verdienen will. Doch der ' +
      'Epheserbrief ist klar: du bist aus Gnade gerettet, durch den Glauben, und das nicht aus ' +
      'dir – es ist ein Geschenk. Du darfst aufhören, für eine Liebe vorzuspielen, die du schon ' +
      'hast. Ruhe ist nicht die Belohnung fürs Fertigsein; sie ist das Geschenk, das dich neu beginnen lässt.',
    prayer: 'Vater, ich empfange, was ich nie verdienen könnte. Danke für die Gnade. Lehre mich, in ihr zu ruhen. Amen.',
  },
  {
    title: 'Ströme in der Wüste',
    body:
      'Jesaja spricht von Strömen in der Öde – Wasser dort, wo du schwören würdest, dass nichts ' +
      'wachsen kann. Deine dürre Zeit ist nicht das Ende der Geschichte. Gott ist Fachmann darin, ' +
      'Leben genau an den Orten aufsprießen zu lassen, die wir abgeschrieben hatten. Sieh auf den ' +
      'Boden, den du aufgegeben hast. Dort ist er nicht fertig.',
    prayer: 'Herr, bring Ströme an die dürren Orte in mir. Ich vertraue dir, dass du alles neu machst. Amen.',
  },
  {
    title: 'Werfen, Nicht Tragen',
    body:
      'Petrus benutzt ein körperliches Wort: wirf. Wirf deine Sorge auf Gott, wie du einen ' +
      'schweren Rucksack von den Schultern schleuderst. Warum? „Denn er sorgt für euch.“ Die ' +
      'Sorge tut so, als sei sie nützlich, als würde genug Grübeln sie lösen. Wird es nicht. Das ' +
      'Gebet verlagert das Gewicht auf den Einzigen, der stark genug ist, es zu halten.',
    prayer: 'Herr, ich werfe meine Sorge auf dich – wirklich, nicht nur in Worten. Trage, was ich nicht kann. Amen.',
  },
  {
    title: 'Die Stimme, die Dich Geliebt Nennt',
    body:
      'Bevor Jesus ein einziges Wunder tat, sprach der Vater: „Dies ist mein geliebter Sohn, an ' +
      'dem ich Wohlgefallen habe.“ Sein Geliebtsein kam zuerst, nicht als Lohn für getane Arbeit. ' +
      'Deines auch. Du musst dich nicht durch Leistung in die Liebe hineinarbeiten. Du wirkst aus ' +
      'der Liebe heraus, nicht für sie.',
    prayer: 'Vater, lass mich dich heute geliebt nennen hören, bevor ich irgendetwas tue. Amen.',
  },
  {
    title: 'Verachte die Kleinen Anfänge Nicht',
    body:
      'Sacharja fragt, wer den Tag der kleinen Dinge zu verachten wagt. Wir wollen die fertige ' +
      'Kathedrale; Gott freut sich am ersten gelegten Stein. Was auch immer du beginnst – eine ' +
      'Gewohnheit, eine Heilung, eine Versöhnung –, miss es nicht daran, wie gering es heute ' +
      'aussieht. Große Dinge beginnen fast immer peinlich klein.',
    prayer: 'Herr, segne den kleinen Anfang vor mir. Hilf mir, im Kleinen treu zu sein. Amen.',
  },
  {
    title: 'Er Stellt Wieder Her',
    body:
      'Der Hirte des Psalms 23 treibt die Schafe nicht weiter, wenn sie erschöpft sind. Er lässt ' +
      'sie sich lagern; er führt sie zu stillen Wassern; er erquickt die Seele. Wenn du auf ' +
      'Reserve läufst, ist das Heiligste, was du tun kannst, vielleicht anzuhalten. ' +
      'Wiederherstellung ist keine Faulheit. Sie ist Gehorsam gegenüber einem Gott, der dich mit dem Bedürfnis nach Ruhe geschaffen hat.',
    prayer: 'Hirte, führe mich heute an stille Wasser. Erneuere, was in mir verschlissen ist. Amen.',
  },
  {
    title: 'Liebe im Alltäglichen',
    body:
      'Paulus’ berühmte Beschreibung der Liebe ist nicht sentimental – sie ist praktisch, fast ' +
      'alltäglich. Geduldig. Freundlich. Nicht leicht zu reizen. Rechnet das Böse nicht an. Das ' +
      'ist Liebe mit hochgekrempelten Ärmeln, Liebe für Dienstagnachmittage und schwierige ' +
      'Menschen. Frage nicht „fühle ich Liebe?“, sondern „kann ich hier geduldig sein, hier freundlich, hier vergebend?“',
    prayer: 'Herr, mach mich heute geduldig und freundlich, besonders dort, wo es mich etwas kostet. Amen.',
  },
  {
    title: 'Das Gewicht der Herrlichkeit',
    body:
      'Paulus nennt seine Nöte „leicht und vorübergehend“ – und das von einem geschlagenen und ' +
      'eingesperrten Mann. Er konnte es sagen, weil er seine Bedrängnisse an einer Ewigkeit der ' +
      'Herrlichkeit maß. Dein Schmerz ist echt; er tut nie so, als wäre es anders. Aber er ist ' +
      'nicht das Größte im Blick. Etwas weit Schwereres und weit Gütigeres kommt.',
    prayer: 'Vater, wenn der heutige Tag schwer scheint, hebe meine Augen zu dem, was bleibt. Trage mich hindurch. Amen.',
  },
  {
    title: 'Kehre zu Mir Zurück',
    body:
      'Das am häufigsten wiederholte Wort der Propheten ist nicht „streng dich mehr an“, sondern ' +
      '„kehre um.“ Gott lädt sein Volk unaufhörlich zurück – nicht mit einer Predigt, sondern mit ' +
      'offenen Armen. Wenn du abgedriftet bist, ist der Heimweg kürzer, als du fürchtest. Eine ' +
      'ehrliche Wende des Herzens, und du wirst ihn schon auf dich zulaufen sehen.',
    prayer: 'Vater, ich kehre heute zu dir zurück. Danke, dass du mir entgegenkommst, noch ehe ich ankomme. Amen.',
  },
  {
    title: 'Sei Still',
    body:
      '„Seid still und erkennt, dass ich Gott bin.“ Die Stille kommt zuerst, dann das Erkennen. ' +
      'Wir versuchen, uns zum Frieden zu denken, und enden verworrener. Manchmal ist Glaube ' +
      'einfach das Aufhören zu ringen – die Hände lange genug zu öffnen, um zu erinnern, wer die ' +
      'Welt wirklich zusammenhält. Du warst es nie.',
    prayer: 'Gott, stille mein Ringen. Hilf mir, lange genug still zu sein, um zu erinnern, dass du Gott bist. Amen.',
  },
  {
    title: 'Der Freund, der Bleibt',
    body:
      'Die Sprüche sagen, es gibt einen Freund, der anhänglicher ist als ein Bruder. In einer ' +
      'Welt von Menschen, die kommen und gehen, ist Jesus der, der bleibt – durch das Versagen, ' +
      'das Schweigen, die lange Nacht. Du bist ihm nicht zu viel, und du bist nie zu weit weg. ' +
      'Er sucht keinen Grund zu gehen. Er ist der Freund, der bleibt.',
    prayer: 'Jesus, danke, dass du geblieben bist, als andere es nicht konnten. Hilf mir, in deiner Treue zu ruhen. Amen.',
  },
  {
    title: 'Am Morgen Kommt die Freude',
    body:
      'Der Psalmist leugnet das Weinen nicht; er sagt, es „währt einen Abend.“ Die Nacht ist ' +
      'wirklich. Aber sie ist nicht endgültig. Die Trauer hat einen Morgen auf ihrer anderen ' +
      'Seite, und der Gott, der deine Tränen in einem Krug bewahrt, hat nicht eine einzige aus ' +
      'den Augen verloren. Halte durch. Der Morgen ist eine Verheißung, kein Vielleicht.',
    prayer: 'Herr, in meiner Nacht hilf mir, dem Morgen zu vertrauen, den du verheißen hast. Bewahre meine Tränen. Amen.',
  },
];

const devotionalsIT: Devotional[] = [
  { title: 'Il Dono della Quiete', body: 'Molti di noi incontrano il mattino già di corsa, tra messaggi, notizie e doveri. Il Salmo 46 nasce in un tempo agitato e invita a fermarsi davanti a Dio. La quiete non è inerzia: è ricordare chi sostiene ogni cosa. Lascia scendere le spalle per due minuti; il mondo non dipende da te, e questa non è una sconfitta ma un invito alla fiducia.', prayer: 'Signore, acquieta il rumore dentro di me. Aiutami a ricordare che sei Tu Dio e io posso fidarmi di Te. Amen.' },
  { title: 'Una Forza che Non Viene da Te', body: 'Paolo parlava della forza ricevuta da Cristo mentre conosceva anche la prigionia e la mancanza. Non è semplice fiducia in sé: è una forza donata proprio quando la nostra finisce. Qualunque cosa ti chieda oggi, non sei stato creato per portarla da solo. Chiedi, ricevi e fai il prossimo passo.', prayer: 'Gesù, sii la mia forza dove oggi sono debole. Ti affido ciò che mi sembra troppo pesante. Amen.' },
  { title: 'Guidato, Non Spinto', body: 'Un pastore cammina davanti; chi spinge resta dietro. Nel Salmo 23 Dio guida verso pascoli e acque tranquille. Se la fede ti è sembrata solo fretta, pressione o paura, fermati e ascolta di nuovo. La voce del Pastore conduce con dolcezza, un passo alla volta.', prayer: 'Pastore della mia anima, insegnami a riconoscere la Tua voce. Guidami oggi. Amen.' },
  { title: 'Riposo per Chi è Stanco', body: 'Gesù chiama a sé proprio chi è stanco e porta pesi. Il riposo non è un premio da guadagnare dopo aver finito tutto: è un dono offerto nel mezzo della fatica. Puoi presentarti come sei, senza dover dimostrare nulla.', prayer: 'Signore, vengo a Te stanco. Prendi il mio peso e insegnami il Tuo riposo. Amen.' },
  { title: 'Un Futuro e una Speranza', body: 'Geremia 29 parla a persone in esilio, con progetti ormai spezzati. La promessa di Dio non è una scorciatoia istantanea, ma la certezza che non ha dimenticato il suo popolo. La tua battuta d’arresto non è la fine della storia. L’Autore sta ancora scrivendo.', prayer: 'Padre, quando non vedo la strada, aiutami a fidarmi di Te che la vedi. Amen.' },
  { title: 'Affidati', body: 'La nostra comprensione è uno strumento utile, ma un pessimo padrone. I Proverbi ci invitano ad affidarci a Dio con tutto il cuore, perché il nostro sguardo resta limitato. Porta a Lui la decisione che continui a rigirare nella mente. Poi ascolta più a lungo di quanto parli.', prayer: 'Signore, Ti affido la decisione che occupa la mia mente. Rendi chiaro il mio cammino. Amen.' },
  { title: 'L’Antidoto all’Ansia', body: 'Paolo collega la preghiera per ogni cosa alla gratitudine. Ringraziare non significa negare ciò che fa paura; significa allargare lo sguardo finché torna visibile la fedeltà di Dio. Nomina tre cose per cui sei grato e osserva come cambia il peso della paura.', prayer: 'Dio della pace, custodisci oggi il mio cuore e la mia mente. Ti affido le mie preoccupazioni, una per una. Amen.' },
  { title: 'Luce nel Buio', body: 'Giovanni non promette una vita senza oscurità: annuncia che l’oscurità non avrà l’ultima parola. Una candela non discute con la notte; continua semplicemente a brillare. Oggi non devi aggiustare tutto. Custodisci la piccola luce che ti è affidata e confida in Colui che è la Luce.', prayer: 'Gesù, Luce del mondo, illumina oggi le parti di me che sento oscure. Amen.' },
  { title: 'Abbastanza per Oggi', body: 'Nel deserto la manna insegnava a raccogliere ciò che serviva per quel giorno. Era una scuola di fiducia quotidiana. Non portare il peso di domani dentro questo giorno: per oggi c’è grazia sufficiente, e domani potrai tornare a riceverla.', prayer: 'Padre, donami ciò di cui ho bisogno oggi e la pace di lasciare il domani nelle Tue mani. Amen.' },
  { title: 'Conosciuto e Amato', body: 'Prima ancora del tuo primo pensiero di stamattina, eri già conosciuto. Il Salmo 139 contempla un Dio che conosce profondamente la nostra vita. Non sei uno sconosciuto che deve attirare la Sua attenzione: sei visto e amato. Lascia che questa certezza sia il terreno su cui cammini oggi.', prayer: 'Signore, grazie perché mi conosci pienamente e continui ad amarmi. Rendimi saldo in questa verità. Amen.' },
  { title: 'La Fedeltà dei Piccoli Passi', body: 'La fedeltà raramente è spettacolare. Spesso è tornare: una preghiera, un gesto gentile, una scelta onesta alla volta. Come l’acqua scava la roccia continuando a passare, il tuo piccolo sì ripetuto a Dio sta formando qualcosa che ancora non vedi. Continua a tornare.', prayer: 'Signore, rendimi fedele nelle piccole cose di oggi e aiutami ad affidarti il quadro intero. Amen.' },
  { title: 'Quando Ti Senti Dimenticato', body: 'Agar, sola nel deserto, scopre di essere vista da Dio quando nessun altro sembra accorgersi di lei. Se oggi ti senti trascurato dalle persone, dalle circostanze o perfino dalle tue speranze, ricordalo: la tua vita non è invisibile a Dio.', prayer: 'Dio che mi vedi, grazie perché non sono mai davvero solo. Incontrami qui. Amen.' },
  { title: 'Il Dono che Non Hai Guadagnato', body: 'La grazia mette in crisi la parte di noi che vuole meritarsi ogni posto. Efesini 2 presenta la salvezza come dono di Dio, ricevuto nella fede, non come premio della prestazione. Puoi smettere di fare audizioni per un amore che ti è già offerto e ricominciare da quella grazia.', prayer: 'Padre, ricevo ciò che non potrei mai guadagnare. Grazie per la Tua grazia; insegnami a riposare in essa. Amen.' },
  { title: 'Ruscelli nel Deserto', body: 'Isaia immagina acqua dove il terreno sembra incapace di dare vita. Anche una stagione arida non è necessariamente la fine della storia. Dio può far nascere vita proprio nei luoghi che avevamo abbandonato. Guarda ancora il terreno a cui avevi rinunciato: forse non ha finito lì.', prayer: 'Signore, porta acqua nei luoghi aridi dentro di me. Mi affido a Te che fai nuove le cose. Amen.' },
  { title: 'Affidare, Non Trattenere', body: 'Prima Pietro invita a consegnare a Dio le nostre ansie perché Egli ha cura di noi. La preoccupazione spesso si traveste da attività utile, come se pensarci ancora potesse risolvere tutto. La preghiera sposta il peso verso Colui che può davvero sostenerlo.', prayer: 'Signore, Ti affido davvero la mia preoccupazione. Porta Tu ciò che io non posso portare. Amen.' },
  { title: 'La Voce che Ti Chiama Amato', body: 'Prima che il ministero pubblico di Gesù iniziasse, il Padre dichiarò il proprio amore per il Figlio. L’amore viene prima della prestazione. Anche tu non devi raggiungere un traguardo per meritare amore: puoi agire a partire dall’amore ricevuto, non inseguirlo come un salario.', prayer: 'Padre, fammi ascoltare il Tuo amore prima di fare qualunque cosa oggi. Amen.' },
  { title: 'Non Disprezzare i Piccoli Inizi', body: 'Zaccaria richiama il valore dei piccoli inizi. Noi desideriamo subito l’opera compiuta, mentre Dio sa gioire della prima pietra. Qualunque cosa tu stia iniziando, un’abitudine, una guarigione o una riconciliazione, non giudicarla soltanto da quanto appare piccola oggi.', prayer: 'Signore, benedici il piccolo inizio davanti a me. Aiutami a essere fedele nel poco. Amen.' },
  { title: 'Egli Ristora', body: 'Nel Salmo 23 il pastore non spinge avanti le pecore esauste: offre riposo, acqua tranquilla e ristoro. Se ti senti vuoto, fermarti può essere una scelta profondamente fedele. Il ristoro non è pigrizia; riconosce che siamo creature con bisogno di riposo.', prayer: 'Pastore, guidami oggi verso acque tranquille. Ristora ciò che dentro di me si è consumato. Amen.' },
  { title: 'Amore nell’Ordinario', body: 'La descrizione dell’amore in 1 Corinzi 13 è concreta: pazienza, bontà, una memoria che non colleziona torti. È amore con le maniche rimboccate, fatto per i pomeriggi normali e le persone difficili. Chiediti non soltanto cosa provi, ma dove puoi essere paziente, gentile e disposto a perdonare.', prayer: 'Signore, rendimi paziente e gentile oggi, soprattutto quando mi costa qualcosa. Amen.' },
  { title: 'Il Peso della Gloria', body: 'Paolo guarda le sue sofferenze alla luce di un’eternità più grande. Non nega il dolore, che conosce bene, ma rifiuta di lasciargli occupare tutto l’orizzonte. La tua fatica è reale, ma non è l’unica realtà. Alza gli occhi verso ciò che dura.', prayer: 'Padre, quando oggi tutto sembra pesante, alza il mio sguardo verso ciò che rimane. Sostienimi. Amen.' },
  { title: 'Torna a Me', body: 'Nei profeti ritorna continuamente l’invito a tornare a Dio. Non è soltanto un comando a sforzarsi di più, ma una porta aperta verso casa. Se ti sei allontanato, la strada del ritorno può essere più corta di quanto temi: comincia con un movimento sincero del cuore.', prayer: 'Padre, oggi torno verso di Te. Grazie perché mi vieni incontro. Amen.' },
  { title: 'Fermati', body: 'Il Salmo 46 lega la quiete al riconoscere chi è Dio. Noi proviamo spesso a ragionare fino a ottenere pace e finiamo ancora più aggrovigliati. A volte la fede consiste nel lasciare la presa abbastanza a lungo da ricordare chi sostiene davvero il mondo.', prayer: 'Dio, acquieta il mio affannarmi. Aiutami a fermarmi e a ricordare chi sei. Amen.' },
  { title: 'L’Amico che Resta', body: 'I Proverbi parlano di un’amicizia capace di restare vicina. In un mondo in cui le persone vanno e vengono, Gesù rimane anche attraverso fallimenti, silenzi e notti lunghe. Non sei troppo per Lui e non sei troppo lontano. Puoi riposare nella Sua fedeltà.', prayer: 'Gesù, grazie perché resti. Aiutami a riposare nella Tua fedeltà. Amen.' },
  { title: 'La Gioia Arriva al Mattino', body: 'Il Salmo 30 non nega il pianto della notte, ma non gli concede l’ultima parola. Il dolore è reale senza essere eterno. Dio non perde nessuna delle tue lacrime; continua a custodirti mentre aspetti un nuovo mattino. Tieni duro: la notte non è tutta la storia.', prayer: 'Signore, nella mia notte aiutami a confidare nel mattino che verrà. Custodisci le mie lacrime. Amen.' },
];

const devotionalsNL: Devotional[] = [
  { title: 'Het Geschenk van Stilte', body: 'Velen van ons beginnen de ochtend al rennend, tussen berichten, nieuws en verplichtingen. Psalm 46 ontstond in onrust en nodigt uit om stil te worden voor God. Stilte is geen nietsdoen; het is herinneren wie alles draagt. Laat je schouders twee minuten zakken en vertrouw erop dat de wereld niet op jou rust.', prayer: 'Heer, maak het stil in mij. Help mij te vertrouwen dat U God bent en dat ik niet alles hoef te dragen. Amen.' },
  { title: 'Kracht die Niet van Jou Komt', body: 'Paulus kende gevangenschap en tekort, en toch sprak hij over kracht die hij in Christus ontving. Dat is geen zelfvertrouwen maar ontvangen kracht, juist wanneer de jouwe op is. Wat vandaag ook van je vraagt, je hoeft het niet alleen te dragen. Vraag, ontvang en zet de volgende stap.', prayer: 'Jezus, wees vandaag mijn kracht waar ik zwak ben. Ik geef U wat te zwaar voelt. Amen.' },
  { title: 'Geleid, Niet Opgejaagd', body: 'Een herder loopt voorop; iemand die opjaagt duwt van achteren. Psalm 23 laat God zien als degene die naar groene weiden en rustige wateren leidt. Als geloof vooral gehaast of angstig heeft gevoeld, luister dan opnieuw. De Herder leidt zacht, stap voor stap.', prayer: 'Herder van mijn ziel, leer mij Uw stem herkennen. Leid mij vandaag. Amen.' },
  { title: 'Rust voor Vermoeiden', body: 'Jezus nodigt juist mensen uit die moe zijn en lasten dragen. Rust is geen beloning die je pas krijgt wanneer alles af is; het is een geschenk midden in het werk. Je mag komen zoals je bent, zonder eerst iets te bewijzen.', prayer: 'Heer, ik kom moe naar U toe. Neem mijn zwaarte en leer mij Uw rust. Amen.' },
  { title: 'Een Toekomst en Hoop', body: 'Jeremia 29 spreekt tot mensen in ballingschap wier plannen waren ingestort. Gods trouw betekende niet dat alles meteen opgelost werd, maar wel dat zij niet vergeten waren. Een tegenslag is niet het einde van jouw verhaal. De Schrijver is nog bezig.', prayer: 'Vader, als ik de weg niet zie, help mij te vertrouwen op U die hem wel ziet. Amen.' },
  { title: 'Leun op God', body: 'Ons eigen inzicht is nuttig, maar te klein om alles te overzien. Spreuken nodigt uit om God met heel ons hart te vertrouwen. Breng Hem de beslissing die steeds door je hoofd blijft gaan en blijf daarna langer luisteren dan spreken.', prayer: 'Heer, ik vertrouw U de beslissing toe die nu in mijn gedachten is. Leid mijn weg. Amen.' },
  { title: 'Een Antwoord op Angst', body: 'Paulus verbindt gebed over alles met dankbaarheid. Dankbaarheid ontkent angst niet; ze maakt het beeld groter zodat Gods eerdere trouw weer zichtbaar wordt. Noem drie dingen waarvoor je dankbaar bent en merk op wat dat met je onrust doet.', prayer: 'God van vrede, bewaak vandaag mijn hart en gedachten. Ik geef U mijn zorgen één voor één. Amen.' },
  { title: 'Licht in het Donker', body: 'Johannes belooft geen leven zonder duisternis, maar wel dat duisternis niet het laatste woord heeft. Eén kaars hoeft niet met de nacht te discussiëren; ze blijft branden. Je hoeft vandaag niet alles te herstellen. Bewaar het kleine licht dat je is toevertrouwd en vertrouw op God.', prayer: 'Jezus, Licht van de wereld, schijn vandaag in de donkere hoeken van mij. Amen.' },
  { title: 'Genoeg voor Vandaag', body: 'In de woestijn leerde het manna Gods volk om voor één dag tegelijk te ontvangen. Het was een dagelijkse oefening in vertrouwen. Draag de last van morgen niet vandaag al mee. Voor deze dag is er genoeg genade; morgen mag je opnieuw ontvangen.', prayer: 'Vader, geef mij wat ik vandaag nodig heb en de vrede om morgen bij U te laten. Amen.' },
  { title: 'Gekend en Geliefd', body: 'Nog vóór je eerste gedachte vanmorgen was je al gekend. Psalm 139 bezingt een God die ons leven diep kent. Je bent geen vreemdeling die om aandacht moet bedelen; je bent gezien en geliefd. Laat dat vandaag de grond onder je voeten zijn.', prayer: 'Heer, dank U dat U mij volledig kent en toch liefhebt. Maak mij daarin standvastig. Amen.' },
  { title: 'De Trouw van Kleine Stappen', body: 'Trouw is zelden spectaculair. Meestal is het opnieuw komen: één gebed, één vriendelijke daad en één eerlijke keuze tegelijk. Zoals water steen vormt door terug te blijven keren, doet jouw kleine herhaalde ja tegen God meer dan je nu kunt zien.', prayer: 'Heer, maak mij vandaag trouw in kleine dingen en laat mij het geheel aan U toevertrouwen. Amen.' },
  { title: 'Wanneer Je Je Vergeten Voelt', body: 'Hagar zat alleen in de woestijn en ontdekte dat God haar zag toen anderen dat niet deden. Als jij je vandaag over het hoofd gezien voelt door mensen, omstandigheden of je eigen teleurgestelde hoop, onthoud dan dit: jouw leven is niet onzichtbaar voor God.', prayer: 'God die mij ziet, dank U dat ik nooit werkelijk alleen ben. Ontmoet mij hier. Amen.' },
  { title: 'Het Geschenk dat Je Niet Verdiende', body: 'Genade botst met het deel van ons dat alles wil verdienen. Efeziërs 2 beschrijft redding als Gods geschenk, ontvangen in geloof en niet als loon voor prestaties. Je mag stoppen met auditie doen voor liefde en opnieuw beginnen vanuit genade.', prayer: 'Vader, ik ontvang wat ik nooit kon verdienen. Dank U voor genade; leer mij erin te rusten. Amen.' },
  { title: 'Stromen in de Woestijn', body: 'Jesaja schildert water op plaatsen waar niets meer lijkt te kunnen groeien. Een droog seizoen hoeft niet het einde van het verhaal te zijn. God kan juist leven laten ontstaan waar wij het hadden opgegeven. Kijk nog eens naar de grond die je had afgeschreven.', prayer: 'Heer, breng water naar de droge plekken in mij. Ik vertrouw erop dat U vernieuwt. Amen.' },
  { title: 'Loslaten in Plaats van Dragen', body: 'Eerste Petrus nodigt ons uit onze zorgen aan God toe te vertrouwen omdat Hij voor ons zorgt. Piekeren doet soms alsof het nuttig werk is, maar eindeloos herhalen maakt de last niet lichter. Gebed verplaatst het gewicht naar Degene die het werkelijk kan dragen.', prayer: 'Heer, ik geef mijn zorg werkelijk aan U. Draag wat ik niet kan dragen. Amen.' },
  { title: 'De Stem die Jou Geliefd Noemt', body: 'Nog vóór Jezus’ openbare werk begon, klonk de liefde van de Vader over Hem. Liefde komt vóór prestatie. Ook jij hoeft geen resultaat te behalen om liefde waard te worden. Je mag handelen vanuit ontvangen liefde in plaats van ervoor te werken.', prayer: 'Vader, laat mij Uw liefde horen voordat ik vandaag iets probeer te bereiken. Amen.' },
  { title: 'Veracht het Kleine Begin Niet', body: 'Zacharia herinnert aan de waarde van kleine starts. Wij willen het voltooide bouwwerk zien; God kan vreugde hebben in de eerste steen. Of je nu begint met een gewoonte, herstel of verzoening: beoordeel het niet alleen op hoe klein het vandaag lijkt.', prayer: 'Heer, zegen het kleine begin voor mij. Help mij trouw te zijn in het kleine. Amen.' },
  { title: 'Hij Herstelt', body: 'In Psalm 23 jaagt de herder uitgeputte schapen niet verder. Er is rust, rustig water en herstel. Als je leeg bent, kan stoppen juist een daad van vertrouwen zijn. Herstel is geen luiheid; het erkent dat God ons met behoefte aan rust heeft gemaakt.', prayer: 'Herder, leid mij vandaag naar rustige wateren. Herstel wat in mij versleten is. Amen.' },
  { title: 'Liefde in het Gewone', body: 'De beschrijving van liefde in 1 Korintiërs 13 is verrassend praktisch: geduldig, vriendelijk en niet bezig met een lijst van fouten. Dit is liefde voor gewone middagen en moeilijke mensen. Vraag niet alleen wat je voelt, maar waar je vandaag geduldig, vriendelijk en vergevend kunt zijn.', prayer: 'Heer, maak mij vandaag geduldig en vriendelijk, vooral waar het mij iets kost. Amen.' },
  { title: 'Het Gewicht van Heerlijkheid', body: 'Paulus bekijkt zijn lijden tegen de horizon van iets dat langer duurt. Hij ontkent pijn niet, maar weigert haar het hele beeld te laten vullen. Jouw pijn is echt, maar ze is niet de grootste werkelijkheid. Richt je blik op wat blijft.', prayer: 'Vader, als vandaag zwaar voelt, hef mijn ogen naar wat blijft. Draag mij erdoorheen. Amen.' },
  { title: 'Kom Terug', body: 'Bij de profeten klinkt steeds weer Gods uitnodiging om terug te keren. Het is niet alleen een oproep om harder te proberen, maar een open deur naar huis. Als je bent afgedwaald, kan de weg terug korter zijn dan je vreest. Begin met één eerlijke beweging van je hart.', prayer: 'Vader, vandaag keer ik naar U terug. Dank U dat U mij tegemoetkomt. Amen.' },
  { title: 'Word Stil', body: 'Psalm 46 verbindt stil worden met opnieuw beseffen wie God is. Wij proberen onszelf soms naar vrede toe te redeneren en raken juist meer verstrikt. Soms is geloof eenvoudigweg stoppen met trekken en duwen, lang genoeg om te herinneren wie de wereld werkelijk vasthoudt.', prayer: 'God, maak mijn streven stil. Help mij te stoppen en te herinneren wie U bent. Amen.' },
  { title: 'De Vriend die Blijft', body: 'Spreuken kent het beeld van een vriend die dichtbij blijft. In een wereld waarin mensen komen en gaan, blijft Jezus door falen, stilte en lange nachten heen. Je bent niet te veel voor Hem en niet te ver weg. Rust in Zijn trouw.', prayer: 'Jezus, dank U dat U blijft. Help mij te rusten in Uw trouw. Amen.' },
  { title: 'Vreugde Komt met de Morgen', body: 'Psalm 30 ontkent de tranen van de nacht niet, maar geeft de nacht ook niet het laatste woord. Verdriet is echt zonder eeuwig te zijn. God verliest geen van je tranen uit het oog terwijl je op een nieuwe morgen wacht. Houd vol: de nacht is niet het hele verhaal.', prayer: 'Heer, help mij in mijn nacht te vertrouwen op de morgen die komt. Bewaar mijn tranen. Amen.' },
];

const DEVOTIONALS: Record<Exclude<Locale, 'en'>, Devotional[]> = {
  tr: devotionalsTR, es: devotionalsES, pt: devotionalsPT, fr: devotionalsFR, de: devotionalsDE, it: devotionalsIT, nl: devotionalsNL,
};

/** Devotionals localized to the active locale (English fallback). */
export function getDevotionals(locale: Locale): Devotional[] {
  const pack = getRegisteredApplicationContentPack(locale);
  if (pack) {
    const localized = new Map(pack.devotionals.map((devotional) => [devotional.id, devotional]));
    return devotionals.map((_, index) => {
      const content = localized.get(DEVOTIONAL_CONTENT_IDS[index]!)!;
      return { title: content.title, body: content.body, prayer: content.prayer };
    });
  }
  return locale === 'en' ? devotionals : DEVOTIONALS[locale];
}
