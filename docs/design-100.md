# Selaora — Güncel 100 Tasarım Önerisi

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
    yalnız Selaora kullanıcı store’larını temizliyor, indirilen içerik ve entitlement korunuyor.
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
31. ✅ **TAMAMLANDI — Metin rollerini merkezi tipe bağla.** Sabit uygulama metin ölçüleri semantic
    display/title/body/label rollerine taşındı; kullanıcı kontrollü okuyucu ölçeği `scaledType`
    üzerinden çözülüyor ve release testi yeni ham `fontSize/lineHeight` değerlerini engelliyor.
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
41. ✅ **TAMAMLANDI — Arama temizleme düğmesini 48 dp hedefe çıkar.** 18 px simge, 48×48 dp fiziksel
    hedef ve basıldığında görünen tonal arka plan içinde sunuluyor.
42. ✅ **TAMAMLANDI — Prayer kategori chip’lerini 48 dp yap.** Chip'ler 48 dp minimumu koruyor;
    klavye/ekran okuyucu odağı yatay listeyi seçilen chip görünür kalacak biçimde kaydırıyor.
43. ✅ **TAMAMLANDI — “Tümünü göster” metin bağlantısını gerçek düğme alanına çevir.** Eylem artık
    48 dp satır, padding, button rolü ve belirgin pressed arka planı taşıyor.
44. ✅ **TAMAMLANDI — Günlük silme ikonuna görünür hedef ver.** 48 dp alan, tonal yüzey, kenarlık
    ve danger rengi destructive anlamı dokunma hedefiyle birlikte görünür kılıyor.
45. ✅ **TAMAMLANDI — Okuyucu font ayarında örnek paragraf göster.** Aktif bölümün ilk ayeti,
    gerçek fontSize/lineHeight ölçeğiyle ayar sheet'inde anlık önizleniyor.
46. ✅ **TAMAMLANDI — Reader “paper” switch’ini platform semantiğiyle düzelt.** Özel toggle yerine
    native Switch kullanılıyor; checked state, swipe/tap ve büyük yazıda sarılan düzen korunuyor.
47. ✅ **TAMAMLANDI — Ekran okuyucuda ayet numarası + metni tek anlamlı cümle yap.** Etkileşimli
    Pressable tek bir tam label taşıyor; görsel numara ve metin alt düğümleri ağaçtan gizleniyor.
48. ✅ **TAMAMLANDI — Player otomatik ilerlemeyi erişilebilirlik açıkken varsayılan duraklat.** Ekran
    okuyucu tespiti bitmeden zamanlayıcı başlamıyor; TalkBack/VoiceOver açıkken açıkça Resume gerekiyor.
49. ✅ **TAMAMLANDI — Player kalan süreyi canlı ama gürültüsüz güncelle.** Süre ayrı, canlı olmayan
    açıklama; yalnız değişen dua satırı kontrollü tek duyuru olarak sunuluyor.
50. ✅ **TAMAMLANDI — Kontrastı gerçek görseller üzerinde ölç.** Verse, ritual, Tonight ve plan
    görsellerinin tüm Dawn/Vigil varyantları ortak %64 kontrast scrim'i kullanıyor. En parlak olası
    görsel pikseline karşı bile primary/secondary metin 4.5:1 eşiğini geçen matematiksel testle korunuyor.

## P1 — Bilgi mimarisi ve temel akışlar (51–65)

51. ✅ **TAMAMLANDI — Tablette alt barı navigation rail’e dönüştür.** 840 dp ve üstünde sekmeler
    solda 112 dp navigation rail’e dönüşüyor; telefon alt barı değişmeden korunuyor.
52. ✅ **TAMAMLANDI — Yatay/tablet düzeninde iki sütunlu içerik kullan.** Today ana akışı ile
    Tonight alanı; Bible plan kartları expanded-width düzeninde iki sütuna ayrılıyor.
53. ✅ **TAMAMLANDI — Android Predictive Back akışlarını doğrula.** Android predictive back
    manifestte açık; Reader araç alanı, kitap/bölüm seçici ve ortak action sheet’lerin her biri
    `onRequestClose` sözleşmesiyle sistem geri hareketinde önce kendi katmanını kapatıyor.
54. ✅ **TAMAMLANDI — İkincil ekranlara tutarlı top app bar getir.** Search, Library, Plan Day,
    Devotional ve Legal ortak 56 dp başlık/48 dp geri hedefi ve yön duyarlı ikon kullanıyor.
55. ✅ **TAMAMLANDI — Bible ana sayfasına son okuma ilerlemesini ekle.** Okuyucu görünür ilk
    ayeti kalıcı saklıyor; “Devam et” kartı kitap, bölüm, ayet ve bölüm yüzdesini gösteriyor.
56. ✅ **TAMAMLANDI — Kitap seçicisine Testament grupları ve hızlı arama ekle.** Kitap seçici
    Eski/Yeni Ahit başlıklarını ve yerel kitap adına göre çalışan hızlı aramayı içeriyor.
57. ✅ **TAMAMLANDI — Bölüm seçicisinde mevcut bölümü görünür seçili durumla sabitle.** Grid
    açılışta seçili bölümün satırına kayıyor; görsel ve erişilebilir seçili durumunu koruyor.
58. ✅ **TAMAMLANDI — Reader üst çubuğunun kalabalığını azalt.** Kompakt genişlikte arama ve
    okuma ayarları tek overflow alt araç alanında; tablette doğrudan erişim korunuyor.
59. ✅ **TAMAMLANDI — Ayet eylemlerini dört eşit dar kutuya sıkıştırma.** Eylemler dar ve büyük
    yazı düzenlerinde iki sütunlu, esnek 2×2 grid olarak akıyor.
60. ✅ **TAMAMLANDI — Uzun basma davranışını ilk kullanımda öğret.** Okuyucuda bir defalık,
    kapatılabilir dokunma/işlem ve hızlı vurgulama ipucu kalıcı tercihle sunuluyor.
61. ✅ **TAMAMLANDI — Aramaya kitap filtresi ekle.** Basit tüm-kitaplar varsayılanına Ahit ve
    tek kitap filtreleri eklendi.
62. ✅ **TAMAMLANDI — Arama sonucunda eşleşme bağlamını dengeli göster.** İlk eşleşme semantik
    vurgu alıyor; iki satırlık snippet sorgunun iki yanından dengeli bağlam seçiyor.
63. ✅ **TAMAMLANDI — 300 sonuç sınırını açıklayıp daraltma yolu ver.** Sınıra ulaşan sonuç
    mesajı ilk 300 sonucu ve kitap filtresiyle daraltma yolunu açıkça belirtiyor.
64. ✅ **TAMAMLANDI — Library içinde yer imleri, vurgular ve günlük kayıtlarını net sekmelere
    ayır.** Üç sayaçlı, erişilebilir segmentin ayrı satırları ve boş durumları bulunuyor.
65. ✅ **TAMAMLANDI — Plan gününde “tamamla” sonrası bir sonraki güne geçiş sun.** Tamamlanan
    gün ekranda kalıyor; sıradaki güne CTA veya plan sonuna dönüş eylemi gösteriliyor.

## P2 — Okuma, içerik keşfi ve alışkanlık (66–80)

66. ✅ **TAMAMLANDI — Today ekranında birincil eylemi tekleştir.** Tarih masthead'inin altında
    günün ilk tamamlanmamış adımına giden tek altın “sıradaki” eylemi gösteriliyor.
67. ✅ **TAMAMLANDI — Tamamlanan ritüelleri daraltılabilir yap.** Tamamlanan kartlar geri alma
    semantiğini koruyan 84 dp özet satırlarına daralıyor; sıradaki kart altın çerçeve alıyor.
68. ✅ **TAMAMLANDI — Ritüel ilerlemesine metinsel özet ekle.** Halka yanında yerelleştirilmiş
    tamamlanma metni ve `n/4` değeri birlikte okunuyor.
69. ✅ **TAMAMLANDI — Tonight kartını saate göre göster.** 05:00–17:59 arası küçük önizleme,
    18:00–04:59 arası tam eylemli gece kartı kullanılıyor.
70. ✅ **TAMAMLANDI — Pray kategorilerini gerçek 2×3 görsel keşif alanına çevir.** Altı kategori
    kendi dua illüstrasyonu, ikon ve seçili durumuyla iki sütunlu keşif ızgarasında sunuluyor.
71. ✅ **TAMAMLANDI — Dua listesinde kilit bilgisini metne bağımlı olmayan biçimde göster.** Kilitli
    içerik oynatma ikonunda, PLUS rozetinde ve yerelleştirilmiş erişilebilirlik etiketinde bildiriliyor.
72. ✅ **TAMAMLANDI — Player’da satır geçmişini kontrollü göster.** Bir önceki satır düşük opacity
    ve iki satır sınırıyla mevcut duanın üzerinde kalıyor; ekran okuyucuda yinelenmiyor.
73. ✅ **TAMAMLANDI — Player pace seçimini görünür yap.** Slow/Normal/Quick 48 dp hedefli,
    erişilebilir selected state taşıyan üçlü segmented control oldu.
74. ✅ **TAMAMLANDI — Player ilerlemesine bölüm noktaları ekle.** Dua başlangıç/orta/kapanış
    üçlüsü görünür `1/3–3/3` işaretleri ve ayrı progressbar semantiğiyle gösteriliyor.
75. ✅ **TAMAMLANDI — Devotional bitişini gerçek bir tamamlanma sahnesi yap.** Otomatik kapanan
    karakter dönüşümü yerine onay kartı, geri eylemi ve Journal CTA'sı bulunuyor.
76. ✅ **TAMAMLANDI — Devotional’dan Journal’a bağlamsal geçiş ekle.** Geçiş devotional bağlamını
    Journal composer'a taşıyor; Kutsal Kitap veya devotional metni kopyalanmadan yansıma sorusu açılıyor.
77. ✅ **TAMAMLANDI — Journal girişlerini günlere göre grupla.** Yerel ay başlıkları, sticky gün
    başlıkları, günlük ve toplam kayıt sayılarıyla yeni SectionList düzeni kullanılıyor.
78. ✅ **TAMAMLANDI — Journal için düzenleme akışı ekle.** Composer kişisel kaydı güncellerken id,
    tarih, tür ve oluşturulma sırasını koruyor; düzenleme iptal edilebiliyor. Kutsal Kitap'tan
    birebir kaydedilen verse girdileri metin bütünlüğü sınırı gereği değiştirilemiyor.
79. ✅ **TAMAMLANDI — Journal boş durumunda ilk yazma eylemini görünür yap.** İllüstrasyon ve
    açıklama altındaki CTA composer input'una doğrudan odaklanıyor.
80. ✅ **TAMAMLANDI — Profile istatistiklerini yakın dönem bağlamıyla açıkla.** Son yedi yerel gün,
    tarih aralığı, `n/7` özeti ve yedi parçalı progress ile best/total değerlerinin önünde gösteriliyor.

## P2 — Performans, adaptasyon ve dayanıklılık (81–90)

81. ✅ **TAMAMLANDI — Kutsal Kitap aramasını ana JS thread’den çıkar.** Her sorguda tam metin
    taraması kaldırıldı; locale-scoped bigram indeks chapter aralarında event loop'a teslim edilerek
    hazırlanıyor, sorgular en küçük posting listesinde exact-match doğrulaması yapıyor.
82. ✅ **TAMAMLANDI — Dil değişiminde büyük JSON yüklerini ölç.** Dört gömülü kaynak yalnız aktif
    locale ilk açıldığında require/parse ediliyor, önceki parse edilmiş ağaç bırakılıyor ve süre,
    kitap/ayet sayısı metinsiz diagnostics API'sinde ölçülüyor; diğer diller doğrulanmış pack olarak iniyor.
83. ✅ **TAMAMLANDI — 55,8 MB JS bundle için ağırlık bütçesi koy.** CI ve Android release; bundle,
    toplam asset, tek asset ve gömülü Scripture boyutunu JSON artifact olarak raporluyor; 60 MiB bundle
    veya tanımlı alt bütçeler aşıldığında build duruyor.
84. ✅ **TAMAMLANDI — Görsel çözünürlüklerini kullanım alanına göre üret.** 150–170 dp A13 plan
    kartları 512×307 1× ve 1024×614 @2x WebP kaynaklarıyla yoğunluğa göre decode ediliyor.
85. ✅ **TAMAMLANDI — VerseCard iç içe scroll davranışını kaldır veya açıklaştır.** Kartta ScrollView
    ve metin satır sınırı yok; min-height tabanından içerikle büyüyor ve kontrat testi bunu koruyor.
86. ✅ **TAMAMLANDI — Landscape ve split-screen için kritik ekranları yeniden akıt.** Player kısa
    yükseklikte kompaktlaşıp kayıyor; paywall hero küçülüyor; onboarding sabit kompozisyon yerine scroll ediyor.
87. ✅ **TAMAMLANDI — Klavye/IME test matrisi oluştur.** Quiz ve Journal ortak KeyboardAvoidingView,
    keyboard-persistent scroll ve küçük/landscape/split/200% metin matrisiyle CTA erişimini koruyor.
88. ✅ **TAMAMLANDI — Foldable hinge alanını hesaba kat.** Expanded Today/Bible eşit bağımsız pane'ler
    ve 32–56 dp merkez güvenli gutter kullanıyor; kart/birincil eylemler pane sınırında kalıyor.
89. ✅ **TAMAMLANDI — Bozuk local storage için kurtarma ekle.** Tüm Zustand store'ları ortak güvenli
    storage katmanından geçiyor; bozuk JSON yalnız ilgili store'u sıfırlıyor, açılışı durdurmuyor.
90. ✅ **TAMAMLANDI — Tüm boş/yükleniyor/hata durumlarını ekran matrisiyle belgeleyip test et.**
    Search, Library, Plan, Paywall, bildirim ve satın alma için initial/loading/pending/error/recovery
    karşılıkları belgeli; release kontrat testi ilgili UI yüzeylerinin silinmesini engelliyor.

## P3 — Görsel sistem, marka ve son cila (91–100)

91. ✅ **TAMAMLANDI — Ham renkleri semantic tokenlara taşı.** Artwork metni, vurgu, focus ve
    kontrast rolleri `onArtwork`, `onArtworkMuted`, `sacredGold` ve `focusRing` tokenlarında
    merkezileştirildi; kaynak kontrat testi ekranlarda yeni ham renk kullanımını engelliyor.
92. ✅ **TAMAMLANDI — Dawn temasının grain yoğunluğunu ayrı ayarla.** Ortak artwork katmanı
    Vigil için %4, Dawn için %1,5 tema tokenını kullanıyor; açık tema kağıt dokusu ayrı çözülüyor.
93. ✅ **TAMAMLANDI — Gölgeleri Android tonal elevation ile dengele.** Standard kart, hero ve
    floating yüzeyler sırasıyla 2/5/8 elevation rollerine ayrıldı; kartlar ortak düşük role taşındı.
94. ✅ **TAMAMLANDI — İkon ailesinin stroke ağırlığını normalize et.** Alt navigasyon aynı
    Ionicons ailesinin outline/filled çiftlerini kullanıyor; filled biçim yalnız seçili durumda.
95. ✅ **TAMAMLANDI — Kart görsellerinin scrim reçetesini standartlaştır.** Ortak `ArtSlot` API'si
    soft/readable/strong presetlerini zorunlu kılıyor; Ritual, plan, Tonight ve Bible yüzeyleri
    metin konumuna göre bu kontrollü reçetelere taşındı.
96. ✅ **TAMAMLANDI — Aktif tab göstergesini daha belirgin ama sakin yap.** Seçili sekme altın
    filled ikon, kısa altın çizgi ve router'ın erişilebilir selected state'iyle belirtiliyor.
97. ✅ **TAMAMLANDI — Pressed/focus/disabled görsel durumlarını tokenlaştır.** Ortak interaction
    rolleri pressed, disabled ve 2 dp focus ring değerlerini tanımlıyor; temel kart, düğme ve ekran
    yüzeyleri bunları kullanıyor, kontrat testi eski dağınık opacity değerlerini engelliyor.
98. ✅ **TAMAMLANDI — Ekran geçişi motion dilini üç kalıba indir.** Root stack shared-axis ve
    container, sekmeler fade-through kalıplarını merkezi motion çözümleyicisinden alıyor; Reduce
    Motion açıkken süreler sıfırlanıyor ve kaynak testi başka geçiş kalıbına izin vermiyor.
99. **Paylaşım kartına marka güvenliği ekle.** Render edilen ayet görselinde metin kaynak/sürüm
    kredisi okunur olmalı; hiçbir zaman ayet metni kırpılmamalı veya yeniden akışta bozulmamalı.
100. **Gerçek cihaz görsel kabul testi kur.** 360×640, 390×844, büyük Android, tablet,
    landscape; Vigil/Dawn ve %100/%200 font ölçeğinde ana ekranların ekran görüntüsü karşılaştırılmalı.

## Sabit sınırlar

- Kutsal Kitap metinleri çevrilmez, sadeleştirilmez, özetlenmez veya yeniden yazılmaz.
- Altı kaynak metin yalnız doğrulanmış dosyalardan ve lisans koşulları korunarak kullanılır.
- Tamamlanmış önceki maddeler bu listeye başarı gibi yeniden eklenmez.
- Uygulama değiştikçe bir madde ancak kod, cihaz testi veya yayın kanıtıyla kapatılır.
