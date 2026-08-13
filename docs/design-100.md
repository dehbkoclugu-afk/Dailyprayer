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
8. ✅ **TAMAMLANDI — Paywall bağlamını gerçekten kullan.** `from=` parametresi başlık, fayda sırası ve ilk görseli
   “uyku duasını aç”, “planı aç” gibi dokunulan içerikle eşleştirmeli.
9. ✅ **TAMAMLANDI — Yasal metinlerde altı Kutsal Kitap kaynağını ayrı ayrı beyan et.** Mevcut Terms yalnızca WEB
   söylüyor; her dilde kullanılan sürüm, telif/lisans ve atıf koşulu gerçek kaynağıyla yazılmalı.
10. ✅ **TAMAMLANDI — YTC ve belirsiz eski sürümleri yayın kapısında doğrula.** YTC lisansı ve
    değişmezliği korunuyor; belirsiz Almeida/Ostervald arşivleri production bundle seçiminden
    çıkarıldı, Portekizce/Fransızca doğrulanmış checksum paketlerine yönlendirildi.
11. ✅ **TAMAMLANDI — Kutsal Kitap metnini dönüştüren hiçbir UI/AI akışına izin verme.** Release guard; özetleme, sadeleştirme,
    yeniden yazma ve otomatik çeviri eylemlerini okuyucu/paylaşım yüzeylerinde engelliyor; birebir kopyalama ve paylaşım korunuyor.
12. ✅ **TAMAMLANDI — Kaynak ve lisans bilgisini okuyucuda görünür kıl.** Okuma ayarlarından açılan
    “Metin kaynağı” ekranı seçili sürüm adı, doğrulanmış hak/lisans bilgisi, tam atıf ve kaynak bağlantısını sunuyor.
13. ✅ **TAMAMLANDI — Dini metin bütünlüğü için release kontrolü ekle.** Altı JSON’un bilinen SHA
    değerleri değişirse veya release hak seti saparsa CI ve imzalı Android işi açıkça durur.
14. ✅ **TAMAMLANDI — Günlük ve kullanıcı verisi silme akışını iki aşamalı yap.** Profile’daki ayrı
    yıkıcı işlem; silinecek verileri ve aboneliğin iptal olmayacağını açıklayan native onaydan sonra
    yalnız Lumen kullanıcı store’larını temizliyor, indirilen içerik ve entitlement korunuyor.
15. ✅ **TAMAMLANDI — Günlük girdisi silmeye Undo ekle.** 48 dp silme hedefi, geri alınabilir
    toast eylemi ve özgün zaman sırasını koruyan restore davranışı eklendi.
16. ✅ **TAMAMLANDI — Bildirim izni reddedildiğinde ölü başarı mesajı gösterme.** İzin verilmeden
    saat kaydedilmiyor veya başarı toast'ı gösterilmiyor; reddedilince sistem ayarları açılıyor.
17. ✅ **TAMAMLANDI — Hatırlatıcı saatini gerçek bir saat seçiciyle değiştir.** Android native saat
    diyaloğu ve iOS spinner kullanılıyor; saklanan `HH:mm` aktif dilin 12/24 saat biçiminde gösteriliyor.
18. ✅ **TAMAMLANDI — İletişim satırını çalışır hâle getir.** Profile e-posta uygulamasını açıyor;
    açılamazsa doğrulanmış destek adresini panoya kopyalayıp kullanıcıya gösteriyor.
19. ✅ **TAMAMLANDI — Bilinmeyen rota/veri hatalarına tasarlanmış durum ekle.** Plan, plan günü,
    kitap, bölüm ve ayet parametreleri sınırlarıyla doğrulanıyor; hatalı deep link boş ekran veya
    bozuk store yazımı yerine erişilebilir güvenli geri dönüş sunuyor.
20. ✅ **TAMAMLANDI — Yayın öncesi metin-doğruluk kontrolü oluştur.** Sürümlenen release claim
    manifesti; lisans, mağaza fiyatı, deneme uygunluğu, yerel bildirim ve gizlilik beyanlarını
    gerçek runtime kanıtlarıyla fail-closed doğruluyor; CI ve imzalı Android işi sapmada duruyor.

## P1 — Erişilebilirlik ve temel kullanım (21–50)

21. ✅ **TAMAMLANDI — Android’de dokunma hedeflerini 48×48 dp’ye çıkar.** Okuyucu, arama,
    devotional, player, Library ve plan akışlarındaki ikon hedefleri ile dua chip’leri Material
    minimumuna yükseltildi; arama temizleme eylemi artık yalnız hitSlop’a bağlı değil.
22. ✅ **TAMAMLANDI — Yan yana hedefler arasında en az 8 dp bırak.** Okuyucu başlığı, bölüm
    ızgarası ve ayet aksiyonları ortak spacing tokenıyla yanlış dokunmayı azaltıyor.
23. ✅ **TAMAMLANDI — Kitap/bölüm seçicisine erişilebilirlik etiketleri ekle.** Başlık seçicisi,
    kitap satırları, bölüm hücreleri ve geri düğmesi TalkBack’te amaç, bağlam ve seçili durumu
    bildiriyor.
24. ✅ **TAMAMLANDI — Bölüm ileri/geri düğmelerinin disabled durumunu seslendir.** Okuyucu
    gezinme düğmeleri ve yazı boyutu kontrolleri açıklayıcı etiketle birlikte gerçek
    `accessibilityState.disabled` durumunu bildiriyor.
25. ✅ **TAMAMLANDI — Ayet satırlarını gerçek erişilebilir eylemlere dönüştür.** Her ayet
    ekran okuyucuya tek anlamlı düğme olarak sunuluyor; “Ayet işlemlerini aç” ve “Vurgula”
    eylemleri uzun basmayı keşfetmeden doğrudan kullanılabiliyor.
26. ✅ **TAMAMLANDI — Highlight renk adlarını insan diline çevir.** Dört renk adı 38 yayın
    dilinde yerelleştirildi; `gold` ve `blue` gibi kalıcı store anahtarları artık okunmuyor.
27. ✅ **TAMAMLANDI — Renk seçimini yalnız renkle anlatma.** Altın, pembe, yeşil ve mavi
    swatch'lar birbirinden farklı şekil işaretleri ve ayrı seçili onayı taşıyor.
28. ✅ **TAMAMLANDI — Bottom sheet odak yönetimini tamamla.** Kitap/bölüm, okuma ayarları,
    ayet işlemleri ve ortak seçenek sheet'i açılışta başlığa odaklanıyor, modal sınırını
    bildiriyor ve kapanınca odağı tetikleyen kontrole geri veriyor.
29. ✅ **TAMAMLANDI — Modal arka planlarını erişilebilirlik ağacından çıkar.** Görünmez
    kapatma yüzeyleri iOS ve Android erişilebilirlik ağaçlarından gizlendi; sheet içeriği
    tek modal yüzey olarak sunuluyor.
30. ✅ **TAMAMLANDI — Büyük yazıda sabit yükseklikleri kaldır.** VerseCard ve paywall hero artık
    içerikle büyüyor; ayet/kaynak ve hızlı aksiyon satırları 200% ölçekte alt satıra sarılabiliyor.
31. **Metin rollerini merkezi tipe bağla.** Dağınık 10/11/12/14/16/18/20/21/24/27/30/34/46/64
    değerleri semantic display/title/body/label rollerinden çözülmeli.
32. ✅ **TAMAMLANDI — En küçük okunabilir metni yükselt.** PLUS rozetleri, sekme metinleri,
    placeholder ve yardımcı etiketler semantic `labelSmall` tabanı olan en az 12 sp’ye taşındı.
33. ✅ **TAMAMLANDI — Uppercase dönüşümünü yerel dile göre yap.** Render-time `textTransform`
    kaldırıldı; gerekli vurgu metinleri `toLocaleUpperCase` ve aktif BCP-47 etiketiyle üretiliyor.
34. ✅ **TAMAMLANDI — Sabit İngilizce erişilebilirlik metinlerini yerelleştir.** Ayet, Plus kilidi,
    ritüel, seri ve tamamlanma etiketleri aktif dildeki mevcut çeviri metinlerinden oluşturuluyor.
35. ✅ **TAMAMLANDI — ProgressRing ve StreakFlame etiketlerini yerelleştir.** Durum metinleri
    çeviri anahtarlarından, sayılar aktif locale'in `Intl.NumberFormat` biçiminden geliyor.
36. ✅ **TAMAMLANDI — Reduce Motion kapsamını bütün uygulamaya genişlet.** Player'a ek olarak
    buton basışı, flame, ProgressRing, RitualCard ve toast giriş/çıkışları sistem ayarına uyuyor.
37. ✅ **TAMAMLANDI — Hareket azaltmada shimmer’ı kaldır.** Ritüel shimmer ve check pop animasyonu
    kapatılıyor; statik altın kenar/check tamamlanma durumunu koruyor.
38. ✅ **TAMAMLANDI — Animasyonlu durum değişimlerini seslendir.** Ritüel geri alma, plan günü ve
    dua tamamlanması tek bir toast duyurusu üzerinden TalkBack'e bir kez bildiriliyor.
39. ✅ **TAMAMLANDI — PillButton `busy` ile `disabled` durumunu ayır.** Busy ayrı state ve spinner
    kullanıyor; normal pasif düğmeler artık erişilebilirlik ağacında meşgul görünmüyor.
40. ✅ **TAMAMLANDI — Silme ve destructive işlemlerde erişilebilir doğrulama kullan.** Yerelleştirilmiş
    native Alert iptali önce ve tercih edilen eylem olarak sunuyor; yıkıcı düğme ayrı işaretleniyor.
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
89. ✅ **TAMAMLANDI — Bozuk local storage için kurtarma ekle.** Tüm Zustand store'ları ortak güvenli
    storage katmanından geçiyor; bozuk JSON yalnız ilgili store'u sıfırlıyor, açılışı durdurmuyor.
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
