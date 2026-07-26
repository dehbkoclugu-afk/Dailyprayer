# Lumen — Güncel 100 Tasarım Önerisi

Bu liste, `f7a010d4` birleşiminden sonraki uygulama kaynakları incelenerek yeniden
hazırlandı. Önceki listede tamamlanan işler tekrar sayılmadı. Maddeler etki sırasındadır:
önce yayın ve güven sorunları, sonra erişilebilirlik ve temel kullanım, ardından okuma
deneyimi, performans ve görsel cila gelir.

## P0 — Yayın, güven ve geri dönüşü zor riskler (1–20)

1. ✅ **TAMAMLANDI — Release derlemesinde sahte Plus yetkisini kesin olarak kapat.** `src/services/purchases.ts`
   içinde RevenueCat yokken satın alma başarılı sayılıyor; production sürümünde eksik anahtar
   ayrı, açıklayıcı ve satın almayı engelleyen bir durum göstermeli.
2. ✅ **TAMAMLANDI — Paywall fiyatlarını yalnızca mağaza ürünlerinden göster.** `$59.99` gibi fallback fiyatlar
   yayın derlemesinde kullanıcıya sunulmamalı; para birimi, vergi ve dönem Google Play/App Store
   tarafından yerelleştirilmiş değerlerden gelmeli.
3. ✅ **TAMAMLANDI — Deneme süresini gerçek ürün uygunluğuna bağla.** Kullanıcı denemeye uygun değilse “7 gün
   ücretsiz” başlığı ve deneme bitiş tarihi hiç görünmemeli.
4. ✅ **TAMAMLANDI — Satın alma iptalini hatadan ayır.** Kullanıcının mağaza penceresini kapatması hata alarmı
   üretmemeli; hata, iptal ve bekleyen ödeme için üç ayrı durum tasarlanmalı.
5. ✅ **TAMAMLANDI — Bekleyen satın alma durumunu kalıcı göster.** Google Play onay/bekleme sürecinde CTA yeniden
   satın alma başlatmamalı; durum kartı ve “daha sonra kontrol et” eylemi sunulmalı.
6. ✅ **TAMAMLANDI — Plus durumuna “aboneliği yönet” eylemi ekle.** Aktif üyeler Profile ekranından doğrudan
   mağazanın abonelik yönetimine gidebilmeli.
7. ✅ **TAMAMLANDI — Restore sonucunu kalıcı ve eylemli yap.** “Bulunamadı” metnine doğru mağaza hesabını kontrol
   etme ve destek e-postası eylemleri eklenmeli.
8. **Paywall bağlamını gerçekten kullan.** `from=` parametresi başlık, fayda sırası ve ilk görseli
   “uyku duasını aç”, “planı aç” gibi dokunulan içerikle eşleştirmeli.
9. **Yasal metinlerde altı Kutsal Kitap kaynağını ayrı ayrı beyan et.** Mevcut Terms yalnızca WEB
   söylüyor; her dilde kullanılan sürüm, telif/lisans ve atıf koşulu gerçek kaynağıyla yazılmalı.
10. **YTC ve Ostervald lisanslarını yayın öncesi doğrula.** Kamu malı olmayan veya sürümü belirsiz
    metin “public domain” diye sunulmamalı; doğrulama tamamlanmadan ilgili dil release kapısından
    geçmemeli.
11. **Kutsal Kitap metnini dönüştüren hiçbir UI/AI akışına izin verme.** Özetle, sadeleştir,
    yeniden yaz ve otomatik çevir eylemleri okuyucu ve paylaşım ekranlarında bulunmamalı.
12. **Kaynak ve lisans bilgisini okuyucuda görünür kıl.** Sadece bölüm sonunda küçük kredi yerine
    ayarlar panelinden açılan “Metin kaynağı” ekranı; sürüm adı, lisans ve tam atıf sunmalı.
13. **Dini metin bütünlüğü için release kontrolü tasarla.** Altı JSON’un bilinen SHA değerleri
    değişirse CI açıkça durmalı; değişiklik ancak kaynak belgesi güncellenerek kabul edilmeli.
14. **Günlük ve kullanıcı verisi silme akışını iki aşamalı yap.** Onboarding’i yeniden başlatmak,
    streak/günlük/işaretleri yanlışlıkla silememeli; silinecek veri listesi açıkça gösterilmeli.
15. **Günlük girdisi silmeye Undo ekle.** Küçük çöp ikonuna dokunma anında kalıcı silme yerine
    snackbar içinde geri al sunulmalı.
16. **Bildirim izni reddedildiğinde ölü başarı mesajı gösterme.** Profile satırı “Kapalı —
    Ayarlardan aç” durumuna geçmeli ve sistem ayarlarına eylem vermeli.
17. **Hatırlatıcı saatini gerçek bir saat seçiciyle değiştir.** Sabit veya sınırlı seçenek yerine
    yerel 12/24 saat formatına uyan native time picker kullanılmalı.
18. **İletişim satırını çalışır hâle getir.** Profile’daki e-posta satırı adresi açmalı; cihazda
    e-posta uygulaması yoksa adresi kopyalama seçeneği vermeli.
19. **Bilinmeyen rota/veri hatalarına tasarlanmış durum ekle.** Geçersiz plan, gün veya kitap
    parametresi boş koyu ekran üretmemeli; açıklama ve güvenli geri dönüş sunmalı.
20. **Yayın öncesi metin-doğruluk ekranı oluştur.** Lisans, fiyat, deneme, bildirim ve gizlilik
    beyanlarının gerçek runtime davranışıyla eşleştiği tek kontrol listesi release şartı olmalı.

## P1 — Erişilebilirlik ve temel kullanım (21–50)

21. **Android’de tüm dokunma hedeflerini 48×48 dp’ye çıkar.** Okuyucu, arama ve devotional’daki
    44×44 düğmeler Material minimumunun altında.
22. **Yan yana hedefler arasında en az 8 dp boşluk bırak.** Özellikle okuyucu başlığı ve ayet
    aksiyon satırı yanlış dokunmayı azaltacak şekilde yeniden ölçülmeli.
23. **Kitap/bölüm seçicisine erişilebilirlik etiketleri ekle.** Başlık seçicisi, kitap satırları,
    bölüm hücreleri ve geri düğmesi TalkBack’te amaç ve seçili durumu söylemeli.
24. **Bölüm ileri/geri düğmelerinin disabled durumunu seslendir.** `accessibilityState.disabled`
    ve açıklayıcı etiket, yalnızca düşük opacity yerine kullanılmalı.
25. **Ayet satırlarını gerçek erişilebilir eylemlere dönüştür.** TalkBack kullanıcıları “Aç” ve
    “Vurgula” eylemlerine uzun basmayı keşfetmek zorunda kalmamalı.
26. **Highlight renk adlarını altı dilde insan diline çevir.** `gold`, `blue` gibi kod anahtarları
    erişilebilirlik etiketinde okunmamalı.
27. **Renk seçimini yalnız renkle anlatma.** Her highlight swatch içinde farklı simge/desen veya
    metin kısaltması bulunmalı.
28. **Bottom sheet odak yönetimini tamamla.** Açılışta başlığa odak taşı, TalkBack odağını modal
    içinde tut ve kapanınca tetikleyen kontrole geri ver.
29. **Modal arka planlarını erişilebilirlik ağacından çıkar.** Görünmez kapatma alanları ayrı
    “Kapat” düğmesi gibi tekrarlanmak yerine modal semantiğiyle yönetilmeli.
30. **Büyük yazıda sabit yükseklikleri kaldır.** VerseCard, paywall hero ve yatay aksiyonlar
    200% font ölçeğinde metin kırpmadan büyüyebilmeli.
31. **Metin rollerini merkezi tipe bağla.** Dağınık 10/11/12/14/16/18/20/21/24/27/30/34/46/64
    değerleri semantic display/title/body/label rollerinden çözülmeli.
32. **En küçük okunabilir metni yükselt.** PLUS rozetleri ve yardımcı etiketler 10–11 sp’de
    kalmamalı; kontrast ve font ölçeğiyle en az Material label-small karşılığı sağlanmalı.
33. **Uppercase dönüşümünü yerel dile göre yap.** Türkçe `i/İ` hataları için render-time
    `textTransform` yerine çevrilmiş doğru biçim kullanılmalı.
34. **Tüm sabit İngilizce erişilebilirlik metinlerini çeviri anahtarına taşı.** “Verse of the
    day”, “requires Plus”, “locked”, “day streak” gibi etiketler altı dilde tutarlı olmalı.
35. **ProgressRing ve StreakFlame etiketlerini yerelleştir.** İngilizce cümle birleştirme yerine
    çoğul kuralları olan tam çeviri anahtarları kullanılmalı.
36. **Reduce Motion kapsamını bütün uygulamaya genişlet.** Player ve flame dışında onboarding,
    RitualCard, toast ve ekran giriş animasyonları sistem ayarına uymalı.
37. **Hareket azaltmada shimmer’ı kaldır.** Tamamlama ödülü statik glow/check’e dönüşmeli;
    kullanıcının sistem tercihi ritüel animasyonunda da korunmalı.
38. **Animasyonlu durum değişimlerini seslendir.** Ritüel tamamlandı/geri alındı, plan günü bitti
    ve dua sona erdi mesajları TalkBack’e tek kez bildirilmelidir.
39. **PillButton `busy` ile `disabled` durumunu ayır.** Her pasif düğme “meşgul” değildir;
    yüklenme sırasında spinner ve doğru erişilebilirlik durumu gösterilmeli.
40. **Silme ve destructive işlemlerde erişilebilir doğrulama kullan.** Native Alert düğme sırası,
    iptal varsayılanı ve TalkBack açıklaması bütün dillerde kontrol edilmeli.
41. **Arama temizleme düğmesini 48 dp hedefe çıkar.** Küçük 18 px ikon yalnızca `hitSlop` ile
    bırakılmamalı; görünür/fiziksel hedef alanı sağlanmalı.
42. **Prayer kategori chip’lerini 48 dp yap.** Mevcut 44 dp minimumu Android hedefinin altında;
    yatay liste de odak sırasında seçili chip’i görünür alana kaydırmalı.
43. **“Tümünü göster” metin bağlantısını gerçek düğme alanına çevir.** Sadece metne basmak yerine
    48 dp satır ve belirgin pressed/focus durumu kullanılmalı.
44. **Günlük silme ikonuna görünür hedef ver.** Küçük çöp simgesi, 48 dp alan ve hafif tonal
    arka planla hem dokunma hem destructive anlamı taşımalı.
45. **Okuyucu font ayarında örnek paragraf göster.** Sadece büyük/küçük A düğmeleri, gerçek satır
    uzunluğu ve leading etkisini anlatmıyor.
46. **Reader “paper” switch’ini platform semantiğiyle düzelt.** Görsel olarak özel kalabilir ama
    swipe/tap, checked state ve büyük yazı düzeni Material switch beklentisini karşılamalı.
47. **Ekran okuyucuda ayet numarası + metni tek anlamlı cümle yap.** İç içe Text düğümlerinin
    kesik veya tekrarlı okunmadığı cihaz testleriyle doğrulanmalı.
48. **Player otomatik ilerlemeyi erişilebilirlik açıkken varsayılan duraklat.** Kullanıcı satırı
    bitirmeden ekran değişmemeli; devam etme açık bir tercih olmalı.
49. **Player kalan süreyi canlı ama gürültüsüz güncelle.** Her satırda tam ekran duyurusu yerine
    yalnız dua metni okunmalı, süre ayrı erişilebilir açıklama olmalı.
50. **Kontrastı gerçek görseller üzerinde ölç.** Verse, ritual, Tonight ve plan kartlarının her
    görsel varyantında metin 4.5:1; büyük başlık 3:1 eşiğini geçmeli.

## P1 — Bilgi mimarisi ve temel akışlar (51–65)

51. **Tablette alt barı navigation rail’e dönüştür.** 840 dp üstünde 600 px geniş alt bar
    kullanmak yerine Material’ın expanded-width navigasyon kalıbı uygulanmalı.
52. **Yatay/tablet düzeninde iki sütunlu içerik kullan.** 640 px tek kolon yalnızca büyümüş telefon
    hissi veriyor; Today ritüelleri ve Bible planları master/detail veya iki kolon olmalı.
53. **Android Predictive Back akışlarını doğrula.** Player, okuyucu ve tüm bottom sheet’ler sistem
    geri hareketinde kapanmalı; uygulama dışına beklenmedik çıkış olmamalı.
54. **İkincil ekranlara tutarlı top app bar getir.** Search, Library, Plan Day, Devotional ve
    Legal aynı geri düğmesi, başlık konumu ve inset sistemini paylaşmalı.
55. **Bible ana sayfasına son okuma ilerlemesini ekle.** “Devam et” kartı yalnız bölüm adını değil,
    son görülen ayet ve bölüm içi ilerlemeyi göstermeli.
56. **Kitap seçicisine Testament grupları ve hızlı arama ekle.** 66 kitaplık düz liste yerine
    Eski/Yeni Ahit başlıkları ve kitap adı araması tanımayı hızlandırmalı.
57. **Bölüm seçicisinde mevcut bölümü görünür seçili durumla sabitle.** Kullanıcı geri açtığında
    doğru hücreye otomatik kaymalı ve “seçili” semantiği taşımalı.
58. **Reader üst çubuğunun kalabalığını azalt.** Kompakt ekranda geri + seçici + arama + ayar
    yerine arama/ayar tek overflow veya alt araç alanında gruplanmalı.
59. **Ayet eylemlerini dört eşit dar kutuya sıkıştırma.** Dar ekran/büyük yazıda 2×2 grid veya
    tam genişlik satırlar kullanılmalı.
60. **Uzun basma davranışını ilk kullanımda öğret.** Bir defalık, kapatılabilir ipucu “Dokun:
    işlemler · Basılı tut: hızlı vurgula” demeli.
61. **Aramaya kitap filtresi ekle.** Tüm Kutsal Kitap sonuçlarında kullanıcı kitabı veya Ahit’i
    daraltabilmeli; varsayılan deneyim hâlâ basit kalmalı.
62. **Arama sonucunda eşleşme bağlamını dengeli göster.** Yalnız ilk eşleşmeyi renklendir; uzun
    ayetlerde sorgu çevresini iki satırlık okunur snippet olarak sınırla.
63. **300 sonuç sınırını açıklayıp daraltma yolu ver.** Sessiz `300+` yerine “İlk 300 sonuç —
    aramayı daralt” mesajı ve filtre eylemi gösterilmeli.
64. **Library içinde yer imleri, vurgular ve günlük kayıtlarını net sekmelere ayır.** Tek uzun
    akış yerine sayaçlı, erişilebilir segmentler ve boş durumlar kullanılmalı.
65. **Plan gününde “tamamla” sonrası bir sonraki güne geçiş sun.** Geri dönmek tek seçenek
    olmamalı; “Bugün tamamlandı · Yarın devam et” bitiş durumu oluşturulmalı.

## P2 — Okuma, içerik keşfi ve alışkanlık (66–80)

66. **Today ekranında birincil eylemi tekleştir.** Ayet kartı, üç ritüel ve Tonight aynı ağırlıkta
    yarışmamalı; günün sıradaki tamamlanmamış adımı belirgin olmalı.
67. **Tamamlanan ritüelleri daraltılabilir yap.** Geri alma korunurken tamamlanmış kartın yüksekliği
    azalmalı; kalan adımlar görsel olarak öne çıkmalı.
68. **Ritüel ilerlemesine metinsel özet ekle.** Halka tek başına yeterli değil; “4 adımın 2’si”
    başlık yakınında okunmalı.
69. **Tonight kartını saate göre göstermeyi değerlendir.** Sabah ana akışında tam boy gece kartı
    yerine akşam yaklaşınca genişleyen, gün içinde küçük önizleme olan yapı kullanılmalı.
70. **Pray kategorilerini gerçek 2×3 görsel keşif alanına çevir.** Mevcut yatay chip şeridi marka
    illüstrasyonlarını kullanmıyor ve altı kategoriyi keşfetmeyi zorlaştırıyor.
71. **Dua listesinde kilit bilgisini metne bağımlı olmayan biçimde göster.** PLUS rozeti,
    kilit simgesi ve erişilebilir “Plus gerekir” durumu aynı bileşende birleşmeli.
72. **Player’da satır geçmişini kontrollü göster.** Tek satırlık boş sahne yerine önceki satır
    düşük opacity ile yukarıda kalabilir; odak yine mevcut duada olmalı.
73. **Player pace seçimini döngüsel gizli düğme olmaktan çıkar.** Slow/Normal/Quick üç seçenekli
    sheet veya segmented control ile mevcut seçim görünür olmalı.
74. **Player ilerlemesine bölüm noktaları ekle.** Uzun dualarda başlangıç/orta/kapanış gibi kısa
    yapısal işaretler kullanıcıya ne kadar kaldığını anlatmalı.
75. **Devotional bitişini gerçek bir tamamlanma sahnesi yap.** `✓` karakterine dönüşen düğme
    yerine kısa “Bugünün düşüncesi tamamlandı” durumu ve geri/Journal eylemi sunulmalı.
76. **Devotional’dan Journal’a bağlamsal geçiş ekle.** Okunan metni kopyalamadan, yalnız özgün
    yansıma sorusuyla günlük yazma eylemi verilmeli.
77. **Journal girişlerini günlere göre grupla.** Uzun kronolojik listede ay başlıkları, sticky
    tarihler ve kayıt sayısı görünmeli.
78. **Journal için düzenleme akışı ekle.** Kaydedilen giriş yalnız silinebilmemeli; tarih ve
    içerik korunarak düzenlenebilmelidir.
79. **Journal boş durumunda ilk yazma eylemini görünür yap.** Görsel ve açıklamanın altında input’a
    odaklayan “İlk notunu yaz” CTA’sı olmalı.
80. **Profile istatistiklerini anlamlı eşiklerle açıkla.** Best/total sayıları yalnız rakam
    olmamalı; “bu hafta 4 gün” gibi yakın dönem bağlamı davranışı desteklemeli.

## P2 — Performans, adaptasyon ve dayanıklılık (81–90)

81. **Kutsal Kitap aramasını ana JS thread’den çıkar.** Altı tam metinde her tuşta senkron tarama
    düşük cihazlarda takılır; önceden hazırlanmış indeks veya worker/native arama kullanılmalı.
82. **Dil değişiminde büyük JSON yüklerini ölç.** Altı çevirinin aynı bundle’da tutulmasının
    açılış süresi ve bellek etkisi profillenip yalnız aktif dilin lazy-load edilmesi sağlanmalı.
83. **55,8 MB JS bundle için ağırlık bütçesi koy.** Her release’te bundle ve asset boyutu
    raporlanmalı; eşik aşımı CI’ı durdurmalı.
84. **Görsel çözünürlüklerini kullanım alanına göre üret.** 150 px kartta gereksiz büyük bitmap
    decode edilmemeli; 1×/2× Android yoğunluk varyantları hazırlanmalı.
85. **VerseCard iç içe scroll davranışını kaldır veya açıklaştır.** Kartın içinde fark edilmeyen
    dikey kaydırma, ana sayfa scroll’u ile çakışıyor; metin boyuna göre kartı büyütmek tercih edilmeli.
86. **Landscape ve split-screen için kritik ekranları yeniden akıt.** Player, paywall ve onboarding
    sabit dikey kompozisyonları kısa yükseklikte kırpılmamalı.
87. **Klavye/IME test matrisi oluştur.** Quiz name ve Journal input; küçük ekran, landscape ve
    büyük yazıda CTA’yı klavye arkasında bırakmamalı.
88. **Foldable hinge alanını hesaba kat.** Expanded layout, katlama çizgisinin üzerine kart veya
    birincil düğme yerleştirmemeli.
89. **Bozuk local storage için kurtarma durumları ekle.** Persist edilmiş reader/plan/journal
    verisi parse edilemezse uygulama çökmek yerine ilgili parçayı güvenle sıfırlamalı.
90. **Tüm boş/yükleniyor/hata durumlarını ekran matrisiyle belgeleyip test et.** Search, Library,
    Plan, Paywall, bildirim ve satın alma için her durumun tasarlanmış karşılığı bulunmalı.

## P3 — Görsel sistem, marka ve son cila (91–100)

91. **Ham renkleri semantic tokenlara taşı.** `#F2EEE6`, `#D9A441`, scrim ve player renkleri
    ekranlarda tekrarlanmamalı; `onArtwork`, `scrimStrong`, `sacredGold` rolleri kullanılmalı.
92. **Dawn temasının grain yoğunluğunu ayrı ayarla.** Vigil’de çalışan %4 doku açık temada kirli
    görünmemeli; tema bazlı %1–2 kağıt dokusu kullanılmalı.
93. **Gölgeleri Android tonal elevation ile dengele.** Yüksek `elevation: 8` her kartta aynı
    kullanılmamalı; hero, standard ve floating yüzey rolleri tanımlanmalı.
94. **İkon ailesinin stroke ağırlığını normalize et.** Ionicons outline/filled karışımı ekran
    içinde rastgele olmamalı; seçili durum dışında aynı aile ve ağırlık korunmalı.
95. **Kart görsellerinin scrim reçetesini standartlaştır.** Ritual, plan, Tonight ve Bible hero
    için metin konumuna göre üç kontrollü scrim preset’i kullanılmalı.
96. **Aktif tab göstergesini daha belirgin ama sakin yap.** Yalnız renk değişimine ek olarak kısa
    alt çizgi/nokta ve erişilebilir selected state kullanılmalı.
97. **Pressed/focus/disabled görsel durumlarını tokenlaştır.** Her Pressable kendi `0.6/0.7/0.85`
    opacity değerini seçmemeli; platforma uygun ortak etkileşim durumları kullanılmalı.
98. **Ekran geçişi motion dilini üç kalıba indir.** Shared-axis ileri/geri, fade-through sekme
    içeriği ve container transform modal; diğer özel animasyonlar kaldırılmalı.
99. **Paylaşım kartına marka güvenliği ekle.** Render edilen ayet görselinde metin kaynak/sürüm
    kredisi okunur olmalı; hiçbir zaman ayet metni kırpılmamalı veya yeniden akışta bozulmamalı.
100. **Gerçek cihaz görsel kabul testi kur.** 360×640, 390×844, büyük Android, tablet,
    landscape; Vigil/Dawn ve %100/%200 font ölçeğinde ana ekranların ekran görüntüsü karşılaştırılmalı.

## Sabit sınırlar

- Kutsal Kitap metinleri çevrilmez, sadeleştirilmez, özetlenmez veya yeniden yazılmaz.
- Altı kaynak metin yalnız doğrulanmış dosyalardan ve lisans koşulları korunarak kullanılır.
- Tamamlanmış önceki maddeler bu listeye başarı gibi yeniden eklenmez.
- Uygulama değiştikçe bir madde ancak kod, cihaz testi veya yayın kanıtıyla kapatılır.
