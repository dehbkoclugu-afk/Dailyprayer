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
10. ✅ **TAMAMLANDI — YTC ve Ostervald lisanslarını yayın öncesi doğrula.** YTC lisansı hak sahibinin
    kendi resmî sayfasından doğrulandı (© 2023–2025 İsmail Serinken & eBible.org, CC BY-ND 4.0) ve
    upstream artifact SHA-256 ile sabitlendi. Ostervald 1996 doğrulanamadı — 1996 revizyonu
    C. H. Boughman editörlüğünde, Bearing Precious Seed (Milford, Ohio) tarafından yayınlanmış ve
    onlardan gelen kamu malı beyanı yok; tek “public domain” etiketi üçüncü taraf bir paketleyicinin
    kendi beyanıydı. Portekizce Almeida da takıldı: dosyada başlık, hak beyanı ve tarihli revizyon
    yok. **Her iki metin de değiştirildi:** Fransızca eBible’ın tarihsel Ostervald’ına (`fra_fob`,
    kamu malı, 1996 katmanı olmadan aynı metin geleneği), Portekizce Bíblia Livre’ye (Almeida 1819
    temelli, CC BY 4.0, hak sahipleri ve lisans yetkili beyanla açık). Hak beyanları artık
    `src/data/scriptureRights.ts`’de; uygulama krediyi yalnızca oradan okuyor ve
    `npm run release-gate` doğrulanmamış bir sürüm derlemede kaldığı sürece release’i durduruyor.
    Kapı geçiyor. Kanıt ve reddedilen sürümlerin gerekçesi: `docs/scripture-sources.md`.
11. ✅ **TAMAMLANDI — Kutsal Kitap metnini dönüştüren hiçbir UI/AI akışına izin verme.** Denetim
    sonucu: böyle bir akış hiç yoktu. Runtime kodunda tek bir ağ çağrısı bile yok (`fetch`, `axios`,
    `XMLHttpRequest`, `WebSocket` — hiçbiri), dolayısıyla bir özetleme/çeviri servisi teknik olarak
    erişilemez; ayet sayfasındaki dört aksiyon (işaretle, kopyala, paylaş, günlüğe kaydet) metni
    birebir geçiriyor; `textTransform: 'uppercase'` yalnızca UI etiketlerinde ve referans
    satırında, ayet metninde değil; günlüğe kaydedilen ayet düzenlenemiyor. Bu durumun sonradan
    bozulmaması `src/data/scriptureIntegrity.test.ts` ile makineye bağlandı: ağ istemcisi, AI/çeviri
    bağımlılığı, “summarize/simplify/rewrite/paraphrase/translateVerse” sözcük dağarı, ayet
    aksiyonlarının allowlist’i ve paylaşım yükünün birebirliği kontrol ediliyor. Korumaların
    gerçekten yakaladığı, kasıtlı ihlaller enjekte edilerek doğrulandı.
    **Ek olarak düzeltildi:** kopyala/paylaş ve günlük ayet kartı, lisansların zorunlu kıldığı atıf
    bilgisini göndermiyordu. YTC (CC BY-ND 4.0) ve Bíblia Livre (CC BY 4.0) alıntının telif ve
    kaynak bilgisiyle birlikte dolaşmasını şart koşuyor; artık kredi hem metin paylaşımına hem de
    paylaşılan kartın üzerine işleniyor ve bu da testle sabitlendi.
12. ✅ **TAMAMLANDI — Kaynak ve lisans bilgisini okuyucuda görünür kıl.** `app/source.tsx` eklendi:
    okuyucunun ayar panelinden (“Metin kaynağı” satırı) ve İncil sekmesindeki kredinin kendisine
    dokunularak açılıyor. Ekran her sürüm için sürüm adı, hak durumu (kamu malı / lisansla
    kullanılıyor), telif, lisans, sürüm tarihi, uyduğumuz koşullar ve hakların son inceleme tarihini
    gösteriyor; lisans metnine ve yayıncının hak beyanına doğrudan bağlantı veriyor. Aktif dilin
    sürümü üstte işaretli, diğer beş dil altında listeli. Tüm veriler
    `src/data/scriptureRights.ts`’den geliyor, yani ekran release kapısının denetlediği haklardan
    sapamıyor. Etiketler ve koşul metinleri altı dile çevrildi (koşullar `source.conditions.*`
    anahtarlarıyla; kayıt defteri kanonik İngilizce sürümü tutuyor). Sürüm alanı dile bağımsız
    biçimde (`eBible.org · 2026-07-22`) tutuldu. Bíblia Livre’nin istediği sürüm tarihi de böylece
    karşılandı. Ekran web export üzerinden Playwright ile hem İngilizce/açık temada hem
    Türkçe/koyu temada render edilerek doğrulandı — konsol hatası ve başarısız istek yok.
13. ✅ **TAMAMLANDI — Dini metin bütünlüğü için release kontrolü tasarla.** İki script eklendi.
    `npm run scripture-check` (offline, deterministik): `docs/scripture-sources.md` içindeki
    manifest tablosu **tek yetki** — altı JSON’un SHA-256’sı, kitap/bölüm/ayet sayıları oradan
    okunuyor ve dosyalarla karşılaştırılıyor. Ayrıca 66 kitabın kanonik sırası, boş bölüm/ayet
    olmaması, parser artığı bulunmaması, kitap adlarının dolu olması, JSON kredisinin hak kayıt
    defteriyle uyuşması ve navigasyon meta dosyalarının aynı kanonu kapsaması denetleniyor.
    Kutsal Kitap verisini manifest tablosunu aynı commit’te güncellemeden değiştirmek CI’yı
    durduruyor. `npm run scripture-drift` (ağ gerektirir, yayın öncesi): upstream artifact’ı
    indirip bundled metinle ayet ayet karşılaştırıyor — YTC hâlâ gözden geçirildiği için sapma
    tekrar oluşacak. Bilinçli olarak CI’da değil; yayıncı kesintisi ilgisiz derlemeleri
    düşürmemeli. CI’ya `scripture-check`, APK iş akışına hem `scripture-check` hem `release-gate`
    eklendi — APK bir sürüm artifact’ı olduğu için doğrulanmamış hak veya değiştirilmiş metin
    derlemeye giremiyor. Dört ihlal sınıfı (ayet değiştirme, bölüm boşaltma, dosya yerine
    manifest’i değiştirme, kredi sapması) enjekte edilerek kontrolün gerçekten durdurduğu
    doğrulandı. 2026-07-26’daki 4 ayetlik YTC sapması yeniden export ile kapatıldı; sapma
    kontrolü şu an temiz.
    **Önceki notumdaki düzeltme:** WEB kaynağındaki 5 aralıklı ayet id’si eksik metin *değil* —
    hepsi Sirak’ta (apokrif), yani hiç paketlenmeyen 20 kitaptan birinde, ve içerikleri editoryal
    not. Dört USFX kaynağının kanonik kitaplarında **sıfır** aralıklı id var; hiçbir kanonik ayet
    düşmüyor.
    **Kontrolün bulduğu gerçek sorun:** Luther 1912 İbranice versifikasyonunu izliyor — Yoel 4
    bölüm (diğerleri 3), Malaki 3 bölüm (diğerleri 4). Toplam 1189 aynı kaldığı için bugüne kadar
    görünmemiş. Okuyucu etkilenmiyor (bölüm sayısını yüklü sürümden okuyor, indeksi kırpıyor) ama
    `src/data/planReadings.ts` bölümleri Türkçe sayılardan planlıyor: Almanca okuyucu için Malaki 4
    planlanıp Malaki 3’e kırpılıyor (tekrar) ve Almanca Yoel 4 hiç planlanmıyor. Bilinen fark
    `KNOWN_CHAPTER_DIVERGENCE` içinde beyan edildi, yani yeni bir sapma artık kontrolü düşürür.
    **Bu hata düzeltildi:** `scripts/build-bible-chapters.mjs` bundled metinden dil bazlı bölüm
    sayılarını türetiyor (`src/data/bible-chapters.json`), `bibleMeta.chapterCount(locale, code)`
    bunu sunuyor ve plan zamanlaması artık dile duyarlı — mantık test edilebilmesi için
    `planReadings.logic.ts`’e ayrıldı. `src/data/planReadings.test.ts` altı dil × beş plan × 365 gün
    için planlanan her bölümün o sürümde gerçekten var olduğunu doğruluyor; eski davranış bu testte
    285. günde Malaki 4 ile düşüyordu. Türetilmiş metadatanın bayatlaması hem testle hem
    `scripture-check` ile yakalanıyor.
14. ✅ **TAMAMLANDI — Günlük ve kullanıcı verisi silme akışını iki aşamalı yap.** Önceki durum:
    Profile’daki “Tanışmayı yeniden başlat” satırı **tek dokunuşla, hiçbir onay olmadan** çalışıyordu
    ve gerçek bir veri silme akışı hiç yoktu. Artık iki ayrı yıkıcı eylem var, ikisi de
    `DataActionSheet` üzerinden iki aşamalı: aşama 1 neyin gideceğini ve neyin kalacağını **gerçek
    sayılarla** kalem kalem listeliyor (“Günlük — 12 girdi”, “Seri — 41 gün (en iyi 63)”), aşama 2
    ayrı ve bilinçli bir onay. Sayılar sheet açıldığında anlık olarak alınıyor, karar sırasında
    kaymıyor. `src/state/dataReset.ts` neyin silindiğine tek yerden karar veriyor:
    `restartOnboarding()` yalnızca ad ve karşılama yanıtlarını sıfırlıyor — seri, günlük, vurgular,
    işaretler ve plan ilerlemesi onboarding durumu değil, dokunulmuyor ve bu sheet’te açıkça
    “KORUNACAK” altında gösteriliyor. `deleteAllUserData()` kişisel geçmişin tamamını siliyor ama
    **Plus yetkisine asla dokunmuyor** (satın alma mağaza hesabına ait, oradan geri yükleniyor);
    görünüm ve dil ayarları da korunuyor, böylece kullanıcı temizlik yaparken uygulama başka bile
    dile atlamıyor. Sekiz store’a `reset()` eklendi. `src/state/dataReset.test.ts` dört güvenceyi
    kaynak düzeyinde koruyor: yeniden başlatmanın user store dışına dokunmaması, user store
    reset’inin yalnızca `onboarded`+`quiz` kapsamında kalması, silmenin her kişisel store’u
    sıfırlaması ve hiçbir yolun Plus’ı iptal etmemesi. Dört ihlal enjekte edilerek testlerin
    gerçekten durdurduğu doğrulandı. İki akış da altı dile çevrildi ve web export üzerinden
    Playwright ile Türkçe/koyu temada render edilerek görsel olarak doğrulandı.
15. ✅ **TAMAMLANDI — Günlük girdisi silmeye Undo ekle.** Çöp ikonu artık `remove(e.id)` çağırmıyor;
    `deleteEntry(entry)` girdinin **tamamını** closure’da tutup siliyor ve toast “Girdi silindi ·
    Geri al” sunuyor — `useJournalStore.restore` girdiyi `createdAt`’e göre eski sırasına geri
    koyuyor. Id yeterli olmazdı: silindikten sonra metin, referans ve zaman damgası geri
    çözülemez.
    **Bu iş sırasında bulunan gerçek hata:** toast altyapısı aksiyon düğmesini zaten destekliyordu
    ama dış kapsayıcı `pointerEvents="none"` taşıyordu — yani düğme çiziliyor, dokunma tamamen
    yutuluyordu. Bugüne kadar hiçbir çağıran aksiyon geçirmediği için görünmemiş. Kapsayıcı
    `box-none` oldu, aksiyonlu toast `auto` (aksiyonsuz olan `none` kalıyor, altındaki ekranı
    engellememesi için). Aksiyonlu toast’un süresi 2,2 sn’den 6 sn’ye çıkarıldı ve erişilebilirlik
    duyurusu artık aksiyonu da söylüyor — yoksa ekran okuyucu kullanıcısına bir şeyin olduğu
    söylenip geri alınabileceği söylenmiyordu.
    `src/state/journalUndo.test.ts` yedi güvenceyi koruyor (doğrudan `remove` çağrısı yok, girdi
    bütün olarak yakalanıyor, restore kopyalamıyor ve yeniden sıralıyor, kapsayıcı dokunmayı
    engellemiyor, süre ≥ 4 sn, duyuru aksiyonu içeriyor). Tarayıcıda tam tur doğrulandı: sil →
    girdi kayboldu → “Geri al” → girdi **eski konumunda** geri geldi, konsol hatası yok.
16. ✅ **TAMAMLANDI — Bildirim izni reddedildiğinde ölü başarı mesajı gösterme.** Önceki akış saati
    yazıyor, izin isteğini ateşleyip **sonucu beklemeden** “Hatırlatıcı güncellendi” diyordu; izni
    engellemiş bir kullanıcıya hiçbir şey kurulmamışken hatırlatma varmış gibi söyleniyordu. Satır
    da yalnızca `quiz.prayerTime`’a bakıyordu, yani bildirimler engelliyken “07:30” yazıyordu.
    Artık izin üç durumlu (`granted` / `blocked` / `undetermined`); `blocked`, `canAskAgain`
    false demek — işletim sistemi bir daha sormaz, tek çıkış sistem ayarlarıdır. Başarı toast’ı
    yalnızca izin alınıp **gerçekten planlandıktan sonra** gösteriliyor. Engelliyse saat “none”
    olarak kaydediliyor, ne olduğunu açıklayan bir uyarı ve **“Ayarları aç”** eylemi sunuluyor.
    Profile satırı gerçek durumu gösteriyor: üstü çizili zil ikonu ve “Kapalı — bildirimler
    engelli”, dokununca doğrudan sistem ayarlarına gidiyor; ekran her odaklandığında izin yeniden
    okunuyor, böylece kullanıcı ayarlardan izin verip döndüğünde satır kendini düzeltiyor.
    **Aynı akıştaki ikinci sessiz hata da düzeltildi:** hatırlatmayı kapatmak yalnızca
    `prayerTime: 'none'` yazıyor, planlanmış bildirimleri **iptal etmiyordu** — satır “Kapalı”
    derken bildirimler gelmeye devam ediyordu. `cancelReminders()` eklendi. Web ve desteklenmeyen
    platformlarda izin sorgusu hata verirse `blocked` dönüyor (fail-closed), yoksa ölü başarı
    mesajı oradan geri gelirdi. `src/services/notificationPermission.test.ts` sekiz güvenceyi
    koruyor; dört ihlal enjekte edilerek doğrulandı. Bloklu satır web export üzerinden görsel
    olarak da doğrulandı (izin durumu zorlanarak).
17. ✅ **TAMAMLANDI — Hatırlatıcı saatini gerçek bir saat seçiciyle değiştir.** Önceki hâli üç sabit
    saatli (`07:30`, `12:30`, `21:00`) bir native `Alert`’ti — saat seçici değil; üstelik 12 saatlik
    bir cihazda kullanıcıya “21:00” gösteriliyordu. Artık `@react-native-community/datetimepicker`
    (SDK 53 uyumlu 8.4.1) ile `ReminderTimeSheet`: Android’de sistem saat diyaloğu imperatif
    açılıyor ve yalnızca **OK**’te yazılıyor (kapatınca hatırlatma kurulmuyor), iOS’ta spinner
    satır içi gelip “Saati kaydet” ile onaylanıyor. Android’e `is24Hour` açıkça veriliyor — iOS
    sistem ayarını kendi okur ama Android söylenmezse 12 saate düşer.
    **Saklama ile gösterim ayrıldı:** değer her zaman 24 saatlik `HH:MM` olarak saklanıyor (tek
    anlamlı ve sıralanabilir), gösterim cihazın kendi düzenine bırakılıyor. Aynı `21:00` değeri
    Türkçe cihazda **21:00**, İngilizce cihazda **9:00 PM** görünüyor — tarayıcıda iki dilde
    doğrulandı. Biçimlendirme `src/lib/time.ts`’de saf fonksiyonlar olarak duruyor ve gerçek
    Intl ile birim testli (`parseTime`, `toStoredTime`, `formatTime`, `prefers24Hour`).
    Native seçici iOS/Android dışında hiç render olmadığı için orada yazılabilir bir alan var —
    yoksa sheet “kaydet” düğmesiyle ama seçecek hiçbir şey olmadan kalıyordu; geçersiz giriş
    sessizce eski saati kaydetmiyor. Artık kullanılmayan üç sabit saat çeviri anahtarı silindi.
    **Ayrıca bulunan, bu maddeyle ilgisiz yayın engeli:** `app.json` iki `expo-splash-screen`
    girdisi taşıyordu ve ilki var olmayan `./src/assets/art/A17-splash.png` dosyasını gösteriyordu
    (diskteki dosya `.webp`). Bu yüzden `npx expo prebuild` — yani **APK iş akışının ilk adımı** —
    hata veriyordu. Bozuk kopya girdi kaldırıldı, prebuild artık tamamlanıyor. A17 splash görselini
    geri getirmek için `.webp`’nin PNG dışa aktarımı gerekiyor (bu ortamda dönüştürücü yok).
18. ✅ **TAMAMLANDI — İletişim satırını çalışır hâle getir.** Satır `<Row icon="mail-outline"
    label={tr('profile.contact')} />` idi — `onPress` yok, `Row` da onsuz kendini devre dışı
    bırakıyor, yani satır tamamen ölüydü. Artık dokununca e-posta uygulamasını açıyor;
    `Linking.canOpenURL` ile gerçekten açılabilirliği kontrol ediyor ve açılamıyorsa adresi panoya
    kopyalayıp bunu söylüyor. Pano da başarısız olursa adresi içeren bir uyarı gösteriyor — hiçbir
    yolda sessizce hiçbir şey yapmıyor. Adres ayrıca satırın sağında **yazılı olarak** duruyor,
    yani hiçbir şey açılmasa bile kullanıcı adresi görebiliyor.
    **Adres tek kaynağa indirildi:** `CONTACT_EMAIL` artık `src/data/legal.ts`’de tanımlı ve
    Gizlilik Politikası ile Koşullar onu interpolasyonla kullanıyor; daha önce üç yerde elle
    yazılmıştı. Paywall’daki kopya e-posta çözümleme mantığı da kaldırılıp ortak
    `src/services/support.ts`’e bağlandı, böylece iki yüzey aynı adresi ve aynı yedek davranışı
    paylaşıyor. `EXPO_PUBLIC_SUPPORT_EMAIL` ayarlıysa o kullanılıyor, değilse politikaların vaat
    ettiği adrese düşülüyor — satırın boş kalmaması için.
    Bu sırada madde 17’nin biçimlendirmesinde bir kusur da düzeltildi: `hour: 'numeric'` Türkçe’de
    “7:30” üretiyordu; `timeStyle: 'short'` yerel kanonik biçimi veriyor — tr/de/fr “07:30”,
    en-US “7:30 AM”. `src/services/support.test.ts` yedi güvenceyi koruyor; üç ihlal enjekte
    edilerek doğrulandı. Satır web export’ta görsel olarak doğrulandı.
19. ✅ **TAMAMLANDI — Bilinmeyen rota/veri hatalarına tasarlanmış durum ekle.** Maddenin tarif ettiği
    ekran birebir koddaydı: her iki plan ekranı da bilinmeyen bir id için
    `return <View style={{ flex: 1, backgroundColor: t.bg }} />` döndürüyordu — açıklama yok,
    çıkış yok. Denetimde dört ayrı hata modu çıktı ve hepsi düzeltildi:
    **(1) Bilinmeyen plan** → tasarlanmış durum, “Okuma planlarına bak”.
    **(2) Plan dışı gün** → `Number(day) || 0` “abc”yi sessizce 1. güne çeviriyor, 9999. günü de
    kırpılmış bir okumayla “10000. Gün” başlığı altında gösteriyordu; artık katı ayrıştırma ve
    `0 ≤ gün < plan.days` sınırı var, dışına çıkan “Planı aç” ile karşılanıyor.
    **(3) Geçersiz Kutsal Kitap referansı — bu bir çökmeydi.** `/read?b=abc` →
    `setPos(NaN, 1)` kalıcı okuyucu konumunu **NaN ile bozuyor**, sonraki render’da
    `Math.min(NaN, 65)` yine NaN olduğu için `bible[NaN].chapters` fırlatıyordu. Artık deep link
    yalnızca bu sürümde gerçekten var olan bir referansı kabul ediyor (yoksa kaydedilmiş konuma
    dokunulmuyor), indeksleme sonlu tam sayıya kırpılıyor ve bölüm yine de bulunamazsa
    “Kutsal Kitap’ı aç” durumu geliyor.
    **(4) Bilinmeyen dua** → `?? prayers[0]` kullanıcının istemediği bir duayı sessizce
    oynatıyordu; artık tasarlanmış durum. Hook kuralları için player, koruma + iç ekran olarak
    ikiye ayrıldı.
    Ayrıca `app/+not-found.tsx` eklendi — daha önce eşleşmeyen bağlantılar expo-router’ın
    biçimsiz, yalnızca İngilizce ekranına düşüyordu. Ortak `NotFoundState` ikon, başlık, açıklama,
    adlandırılmış güvenli hedef ve (geri gidilecek bir yer varsa) “Geri dön” sunuyor; 16 metin
    altı dile çevrildi. Dört senaryo da tarayıcıda çalıştırıldı: hiçbiri boş değil, konsol hatası
    yok.
20. ✅ **TAMAMLANDI — Yayın öncesi metin-doğruluk kontrolü oluştur.** `npm run release-claims`
    (`scripts/check-release-claims.mjs`) beş alanda **17 iddiayı** koda karşı doğruluyor ve her
    birini onay/ret ile listeliyor:
    **Lisans** — Terms’teki altı sürüm hak kayıt defteriyle birebir aynı mı, kayıt defterindeki her
    lisans Terms’te geçiyor mu, toptan “hepsi kamu malı” iddiası var mı.
    **Fiyat** — paywall’da elle yazılmış tutar var mı, `DEV_PLANS` release’de erişilemez mi,
    fiyatlar mağaza ürününden mi geliyor.
    **Deneme** — her deneme metni uygunluk kontrolünün arkasında mı, süre mağaza teklifinden mi
    geliyor.
    **Bildirim** — politika “yalnızca cihazda planlanır” diyor, kod uzak push token istemiyor,
    push sağlayıcı bağımlılığı yok.
    **Gizlilik** — analitik/izleme bağımlılığı yok, hesap/oturum açma kodu yok, politikanın andığı
    ödeme sağlayıcısı gerçekten kullanılıyor, HTTP istemcisi yok, uygulama içi iletişim adresi
    politikaların yayımladığıyla aynı.
    Bir politika iddiası bir sözdür; kodun tutmadığı bir sözü yayınlamak kusurun kendisidir — bu
    yüzden kontrol bir belge değil, **çalıştırılabilir** ve başarısızsa sıfırdan farklı çıkıyor.
    Dört ihlal (paywall’a sabit fiyat, `DEV_PLANS`’ı açığa çıkarmak, analitik bağımlılığı eklemek,
    Terms’ten bir sürümü düşürmek) enjekte edilerek yakaladığı doğrulandı.
    **Tek yayın şartı:** `npm run release-check` = `scripture-check` + `release-gate` +
    `release-claims`. APK iş akışı artık derlemeden **önce** bunu çalıştırıyor; CI ise her push’ta
    `scripture-check` ve `release-claims` koşuyor (haklar kapısı bilinçli olarak yalnızca yayında,
    geliştirmeyi durdurmasın diye).
    Not: madde “ekran” diyor; uygulama içi bir geliştirici ekranı kullanıcıya sevk edilen ölü
    yük olurdu ve hiçbir şeyi zorlayamazdı. Kontrol listesi, çıktısı okunabilir bir rapor olan ve
    yayını gerçekten durdurabilen bir komut olarak uygulandı.

## P1 — Erişilebilirlik ve temel kullanım (21–50)

21. ✅ **TAMAMLANDI — Android’de tüm dokunma hedeflerini 48×48 dp’ye çıkar.** `TAP_MIN = 48` token’ı
    eklendi (iOS 44 ister, Material 48; tek sayı tutmak için her yerde 48). Maddede anılan 44×44
    düğmeler — okuyucu, arama, devotional, kütüphane, plan ekranları, VerseCard — ve 40×40 vurgu
    dairecikleri yükseltildi. Yalnızca `hitSlop`’a dayanan ikon düğmeleri (kütüphane silme, okuyucu
    seçici oku, arama temizleme, günlük silme, dua “tümünü göster”) gerçek boyut aldı: `hitSlop`
    dokunulabilir alanı büyütür ama görünen kontrolü küçük bırakır, yani gördüğünle vurduğun şey
    farklı olur — kontrolleri güvenilmez hissettiren tam olarak budur. Arama alanı ve bölüm seçici
    tetikleyicisi de 44’ten 48’e çıktı. Dağınık `48` literalleri token’a çevrildi.
    **Kaynak taraması yetmedi; ölçmek gerekti.** `src/theme/tapTargets.test.ts` bildirilen boyutları
    okuyor ve CI’da çalışıyor, ama yüksekliği padding + satır yüksekliğinden çıkan bir kontrolü
    göremiyor. Bu boşluk gerçekti: `scripts/measure-tap-targets.mjs` ile dokuz ekranı gerçek
    tarayıcıda ölçünce beş hedef daha çıktı — bölüm gezinme düğmeleri **43dp**, İncil sekmesi hızlı
    eylemleri **46dp**, kütüphane filtreleri **35dp**, Bugün’deki uyku kilidi **37dp** — hiçbiri
    minimumun altında bir şey *bildirmediği* hâlde. Hepsine açık `minHeight` verildi; ölçüm artık
    dokuz ekranda **sıfır** ihlal raporluyor. Üç ihlal (hedefi 44’e küçültmek, `hitSlop`-only bir
    düğme geri koymak, token’ı düşürmek) enjekte edilerek testin yakaladığı doğrulandı.
    Not: bu sweep 41, 42 ve 44’ün **boyut** kısmını da kapatıyor; o maddelerin görünür hedef alanı,
    tonal arka plan ve odak kaydırma istekleri açık kalıyor.
22. ✅ **TAMAMLANDI — Yan yana hedefler arasında en az 8 dp boşluk bırak.** Hedefleri 48’e
    çıkarmak komşuları birbirine değdirdiği için bu madde ölçümle çözüldü:
    `scripts/measure-tap-targets.mjs` artık boyutun yanı sıra **komşu hedefler arası boşluğu** da
    ölçüyor. Bulunan ve düzeltilenler: günlük ayet kartındaki karıştır ↔ paylaş (**0dp**, yan yana),
    kütüphanedeki iki filtre segmenti (**0dp**), Profile’daki “tanışmayı yeniden başlat” ↔ “tüm
    verilerimi sil” (**0dp** — biri adı sıfırlıyor, diğeri günlüğü siliyor; bir yanlış dokunuş
    kadar yakın olamazlar), ve metin kaynağı ekranındaki üst üste iki bağlantı (**0dp**).
    **Kural körlemesine uygulanmadı.** Ayırıcı çizgiyle ayrılmış üst üste liste satırları — Profile
    tercihleri gibi — bilinçli olarak muaf: Material’in kendi listelerinde de boşluk yoktur, oraya
    8dp koymak daha güvenli değil daha kötü tasarım olurdu. Ölçüm sınırda çizilmiş bir kuralı
    (üsttekinin alt kenarlığı ya da alttakinin üst kenarlığı, ikisi de aynı çizgiyi çiziyor)
    ayırıcı sayıyor.
    Ölçüm iki kez kendi hatasını gösterdi ve ikisi de düzeltildi: (1) ayırıcıyı yalnızca
    `borderBottomWidth`’te arıyordu, oysa `ValueRow` `borderTopWidth` kullanıyor — altı yanlış
    pozitif; (2) modal açıkken arkadaki erişilemez düğmeleri de karşılaştırıyordu — artık en üstteki
    katmana daralıyor. Ayrıca rapora **hedef sayısı** eklendi: ayet aksiyon sheet’i ilk denemede
    hiç açılmamıştı (6 hedef = arkadaki okuyucu) ve sayı olmasa bu sessizce “geçmiş” görünecekti.
    Ayet satırları `Pressable` değil `<Text onPress>` olduğu için buton rolü taşımıyor — locator
    metne göre düzeltildi; rol eksikliği madde 25’in konusu.
    Kapsam 9 ekrandan **11 görünüme** çıktı (ayet aksiyon ve okuma ayarları sheet’leri dahil);
    hepsinde 0 küçük hedef, 0 dar boşluk.
23. ✅ **TAMAMLANDI — Kitap/bölüm seçicisine erişilebilirlik etiketleri ekle.** Seçicinin dört
    kontrolü de eksikti ya da yanlıştı: **başlık tetikleyicisi** yalnızca “Mezmurlar 23, düğme”
    diyordu — okunan yeri söylüyor ama dokununca *değiştiğini* söylemiyordu; artık
    “Mezmurlar 23, kitap ve bölüm seç”. **Kitap satırları** çıplak `Pressable`’dı: rol yok, etiket
    yok, seçili durum yok — açık olan kitap yalnızca yazı ağırlığı ve altın rengiyle işaretliydi,
    yani ekran okuyucu için görünmezdi. **Bölüm hücreleri** ekran okuyucuya yalnız “3” diyordu;
    kitap adı ekranda var ama hücrede yok, artık etikette. **Sheet’in geri oku** `a11y.back`
    kullanıyordu (“Geri dön”) — oysa sheet’i kapatmıyor, kitap listesine dönüyor: `a11y.backToBooks`.
    Ayrıca sheet başlığı `accessibilityRole="header"` aldı, sheet `accessibilityViewIsModal` ile
    kapatıldı (TalkBack karartmanın arkasındaki okuyucuya kayabiliyordu) ve karartma alanı
    erişilebilirlikten çıkarıldı: dokununca kapanıyor ama söyleyecek bir şeyi yok.
    Üç yeni i18n anahtarı altı dile eklendi; etiketler tarayıcıda Türkçe, Almanca ve Fransızca
    olarak okundu (“Psalmen 23, Buch und Kapitel wählen”, “Psaumes 23, choisir le livre et le
    chapitre”).
    **Yeni koruma:** `src/a11y/labels.test.ts`. İki genel kural — (1) yalnızca ikon içeren bir
    düğmenin okunacak metni yoktur, etiketi olmalı; (2) kendini “aktif” diye boyayan bir kontrol
    aynı durumu erişilebilirliğe de vermeli — artı seçicinin dört kontrolünü adıyla denetleyen bir
    test. Sarmalayıcı `Pressable`’lar içindeki iç kontroller ayrıştırılıyor, yoksa sheet karartması
    içindeki her satırdan sorumlu tutuluyordu (üç yanlış pozitif). Üç ihlal enjekte edilip
    yakalandığı doğrulandı.
    Genel kural sırasında **VerseActionSheet’in yer imi düğmesi** de çıktı: altın tonlu arka planla
    “işaretli” görünüyor ama durumu söylemiyordu; `accessibilityState` eklendi.
    Seçici artık buton rolü taşıdığı için **ölçülebilir** hâle geldi ve
    `scripts/measure-tap-targets.mjs` kapsamı 11’den **13 görünüme** çıktı. İlk ölçüm hemen bir şey
    buldu: kitap listesinin **ilk satırı 47dp** — ayırıcı çizgisi olmayan tek satır olduğu için
    diğerlerinin 1px’i onda yoktu. `minHeight: TAP_MIN` verildi.
    **Doğrulamanın sınırı:** `accessibilityState` bu yığında yalnızca yerel (native) bir kanal;
    react-native-web onu hiçbir ARIA niteliğine çevirmiyor, dolayısıyla seçili durum tarayıcıda
    *gözlemlenemedi* (kaynak koruması ve uygulamanın geri kalanıyla aynı API olması dışında). Rol,
    etiket, başlık ve modal kapatma tarayıcıda doğrulandı. TalkBack ile cihaz testi yayın öncesi
    kontrol listesinde.
24. ✅ **TAMAMLANDI — Bölüm ileri/geri düğmelerinin disabled durumunu seslendir.**
    **Maddenin ilk yarısı zaten çalışıyordu ve bunu söylemek önemli:** RN’in `Pressable`’ı
    `disabled` prop’unu kendiliğinden `accessibilityState`’e katıyor
    (`Pressable.js`: `disabled != null ? {..._accessibilityState, disabled}`), yani düğmeler
    `disabled={!enabled}` sayesinde TalkBack’e “devre dışı” diyordu — tarayıcıda
    `aria-disabled="true"` olarak da doğrulandı. Eksik olan **gerekçeydi**: “Önceki, düğme,
    devre dışı” okuyucuyu neden olduğunu tahmin etmeye bırakıyor. Bu yüzden etiket ikiye ayrıldı:
    açıkken nereye gittiğini söylüyor (“Önceki bölüm, Mezmurlar 22” — kitap sınırını da geçiyor:
    Mezmurlar 150’den sonrası “Süleyman’ın Özdeyişleri 1”), kapalıyken nedenini
    (“Önceki bölüm yok — Kutsal Kitap’ın başı”).
    Bu arada sınır kuralı **üç yerde** yazılıydı — `prev()`, `next()` ve `hasPrev`/`hasNext` — ve
    etiket dördüncüsü olacaktı; tek bir `prevPos`/`nextPos` hesabına indirildi.
    **Aynı kusur iki yerde daha vardı ve düzeltildi:** okuma ayarlarındaki A−/A+ düğmeleri sınırda
    yalnızca soluyordu (artık “Daha küçük metin, hâlihazırda en küçük boyut”), ve oynatıcının
    “önceki satır” düğmesi ilk satırda (artık “Önceki satır yok — ilk satır”). Üçünün de
    `aria-disabled="true"` + gerekçeli etiketi tarayıcıda okundu.
    **Korumaya iki kural eklendi** (`src/a11y/labels.test.ts`): (1) kendini soldurun bir kontrol
    gerçekten `disabled` olmalı — soldurma “basmak bir şey yapmaz” sözüdür, `opacity` tek başına o
    sözü tutmaz; `pressed` temelli soldurmalar basış geri bildirimi olduğu için hariç. Kural boş
    değil: uygulamada basış dışı bir koşulla solan **4** kontrol var ve dördü de denetleniyor.
    (2) sınıra dayanıp solan üç kontrolün etiketi o sınıra göre dallanmalı. Dört ihlal enjekte
    edilip yakalandığı doğrulandı.
    **Bu doğrulama sırasında ayrı ve daha büyük bir kusur çıktı:** oynatıcının etiketleri Türkçe
    dilde İngilizce okunuyordu — `player.*` anahtarları yalnızca İngilizce sözlükte var. Ölçüldü:
    İngilizce dışındaki beş dilde **21–22 anahtar eksik** (tüm oynatıcı ekranı, paywall’ın işlem/
    geri yükleme metinleri, **ve günlük bildirim başlık/gövdeleri**), `lookup()` sessizce
    İngilizce’ye düşüyor. Madde 24’ün konusu değil; ayrı ele alınıyor (aşağıya bakın).
25. ✅ **TAMAMLANDI — Ayet satırlarını gerçek erişilebilir eylemlere dönüştür.** Satırlar
    `onPress` (aksiyon sheet’ini açar) ve `onLongPress` (yerinde vurgular) taşıyan `<Text>`’ti;
    TalkBack ayeti düz metin olarak okuyor ve *hiçbir şey* onun bir şey yaptığını sezdirmiyordu.
    İki eylem artık `accessibilityActions` ile TalkBack’in eylem menüsünde: “Ayet eylemleri” ve
    duruma göre “Vurgula” / “Vurguyu kaldır” (`verse.*` anahtarları altı dilde zaten vardı,
    yeniden kullanıldı). `activate` beyan etmek Android’de standart tıklama eylemini devraldığı
    için `onAccessibilityAction` her iki dalı da ele alıyor.
    **Bilinçli olarak buton yapılmadılar.** Madde 22’nin notu “eksik buton rolü madde 25’in
    konusu” diyordu; maddenin kendi metni rolden değil *eylemlerden* söz ediyor ve doğru cevap bu:
    Kutsal Kitap ayet ayet kaydırılarak okunur, her bölümün her ayetinden sonra “düğme” duymak
    gürültüdür. Bir metin öğesindeki ara sıra kullanılan eylemin yeri eylem menüsüdür.
    **Etiket de eksikti.** Ayet numarası iç içe bir `Text` olduğu için çıplak bir sayı olarak ilk
    kelimeye yapışıyordu; artık “Ayet 1. …” diye adlandırılıyor (`read.verse`, altı dil).
    Vurgu durumu yalnızca arka plan tonuydu — ekran okuyucu için yok. Artık söyleniyor ve
    **ayetten önce**: uzun bir ayetin okunması yirmi saniye sürüyor, sonda gelen bir “vurgulu”
    dinleyicinin beklediği bilgiyi en sona atıyor. Sonuç: “Ayet 2, vurgulu. Beni yeşil
    çayırlarda…”.
    **Eylemi yapmanın onayı da yoktu:** hızlı vurgulama yalnızca haptik veriyordu, ekran okuyucu
    kullanıcısı göremediği bir tondan hiçbir şey öğrenmiyor. `announceForAccessibility` ile
    “Vurgulandı” / “Vurgu kaldırıldı” eklendi.
    `src/a11y/labels.test.ts` ikisi de denetliyor; özellikle **iki ayet dalının** (drop-cap ilk
    ayet ve diğerleri) ikisinin de props’u taşıması — ilk ayet farklı render edildiği için
    unutulmaya en yakın olan buydu. Dört ihlal enjekte edilip yakalandığı doğrulandı.
    **Doğrulamanın sınırı:** `accessibilityActions` da yerel (native) bir kanal —
    react-native-web onu hiçbir DOM niteliğine çevirmiyor (tarayıcıda 0 düğüm). Tarayıcıda
    doğrulanan: birleştirilmiş etiket Türkçe ve Almanca olarak (“Vers 2, markiert. …”), vurgu
    durumunun doğru ayette görünmesi, dokunma yolunun hâlâ sheet’i açması ve konsolda hata
    olmaması. Eylem menüsünün kendisi TalkBack ile cihaz testinde.
26. ✅ **TAMAMLANDI — Highlight renk adlarını altı dilde insan diline çevir.** Swatch etiketi
    `${tr('verse.highlight')} ${c}` diye kuruluyordu, yani TalkBack depolama anahtarını okuyordu:
    “Vurgula gold” — altı dilin beşinde İngilizce bir kelime, altıncısında jargon. Dört renk altı
    dile çevrildi (`highlight.gold` … `highlight.blue`) ve `HIGHLIGHT_LABEL` haritası
    `Record<HighlightColor, TranslationKey>` olarak yazıldı: `tr()` içine `as never` ile şablon
    anahtar gömmek yerine, bir anahtar yeniden adlandırılırsa **derleme kırılıyor**, çalışma
    zamanında sessizce İngilizce’ye düşmüyor.
    **Renk üç yerde okunuyor, üçü de düzeltildi.** (1) Sheet’teki swatch’lar: “Vurgula, Altın”.
    (2) Okuyucudaki ayet etiketi: madde 25 vurguyu duyuruyordu ama hangi rengi değil — artık
    “Ayet 2, vurgulu, Mavi.”. (3) **Kütüphane listesi:** vurgu satırlarını birbirinden ayıran tek
    şey soldaki renk şeridiydi ve o çizilmiş, yazılmamıştı; satır etiketi yalnızca referanstı.
    Artık “Mezmurlar 23:2, vurgulu, Mavi”.
    Uzun basma kısayolu renk seçtirmediği için onayı da hangi rengi kullandığını söylüyor
    (“Vurgulandı, Altın”); `'gold'` sabiti `QUICK_HIGHLIGHT` olarak adlandırıldı.
    **Yan yolda bulunan hata:** kütüphanedeki yer imi silme düğmesinin etiketi
    `verse.bookmarkRemoved` idi — yani “Yer imi kaldırıldı”, *toast* metni, geçmiş zaman. Düğmenin
    adı olarak okunuyordu. `verse.removeBookmark` eklendi (altı dil).
    Koruma: her rengin adı olması, her adın gerçek bir çeviri anahtarı olması, hiçbir etiketin
    çıplak renk değişkeni (`${c}`, `${color}`) enterpole etmemesi, kütüphane satırının rengi
    taşıması ve silme düğmesinin geçmiş zamanlı toast’a dönmemesi. Dört ihlal enjekte edilip
    yakalandığı doğrulandı. Türkçe, Fransızca ve Almanca’da üç yüzeyin de tarayıcıda okunduğu
    doğrulandı; konsol temiz.
27. ✅ **TAMAMLANDI — Renk seçimini yalnız renkle anlatma.** Yalnızca tonuyla ayrılan dört daire,
    kırmızı-yeşil renk körlüğü olan bir okuyucu için dört özdeş dairedir — ve gül/altın ile
    yeşil/altın tam da çakışan çiftler. Madde 26 ekran okuyucuya adı verdi, ama swatch’ı *gören*
    ve ayırt edemeyen birine hiçbir şey vermedi.
    Her renk artık kendi şeklini taşıyor: altın ★, gül ♥, yeşil yaprak, mavi damla
    (`HIGHLIGHT_ICON`). Seçili olan **dolu**, diğerleri **outline** — madde 94’ün Ionicons
    outline/filled ailelerinin karışmasına izin verdiği tek yer bu. Eski işaret yalnız seçili
    swatch’ta beliren bir onay imiydi, yani diğer üçü renkten ibaretti.
    **Kütüphane listesi de aynı kusurdaydı** ve düzeltildi: gül bir vurguyu yeşil bir vurgudan
    ayıran tek şey soldaki 6px renk şeridiydi. Şerit yerini şekle bıraktı — yer imi satırlarının
    zaten ikonunu koyduğu aynı alanda, yani iki sekme nihayet kardeş görünüyor.
    Koruma: her rengin **benzersiz** bir şekli olması, swatch’ın şekli çizmesi, dolu/outline
    ayrımı ve kütüphanenin renk-yalnız şeride dönmemesi. Üç ihlal enjekte edilip yakalandığı
    doğrulandı; ikisi de tarayıcıda ekran görüntüsüyle gözden geçirildi.
28. ✅ **TAMAMLANDI — Bottom sheet odak yönetimini tamamla.** Üç parçanın üçü de eksikti.
    Sheet yukarı kayarken ekran okuyucu odakları onu açan kontrolde kalıyordu — artık sheet’in
    altında — yani sheet kaydırarak *aranıyor* ve bir şeyin açıldığına dair hiçbir duyuru olmuyordu.
    `src/a11y/sheetFocus.ts`: `useSheetTitleFocus` açılışta odağı başlığa taşıyor (slide-in
    animasyonu bitmeden odaklamak ekran dışındaki bir görünümü hedefler ve platform bunu düşürür,
    o yüzden gecikme var), `useTriggerFocus` kapanışta odağı tetikleyen kontrole geri veriyor.
    Altı sheet’in hepsine uygulandı (okuyucu seçicisi, okuma ayarları, ayet aksiyonları, seçenek,
    veri silme, hatırlatıcı saati) ve dört tetikleyiciye (okuyucuda pasaj + ayarlar, profilde
    görünüm + dil).
    **Madde 23’te yazdığım bir ifade yanlıştı ve düzeltildi:** `accessibilityViewIsModal`’ın
    “TalkBack’i sheet içinde tuttuğu”nu yazmıştım. O prop **yalnızca iOS**. Android’de çevreleme
    zaten bedava geliyor: RN’in `Modal`’ı bir `Dialog`, yani ayrı bir pencere ve TalkBack arkasındaki
    pencereye geçmiyor. Yani prop iOS yarısı, Modal Android yarısı. Diğer beş sheet’te prop hiç
    yoktu — eklendi. Sheet karartmaları da erişilebilirlikten çıkarıldı: dokununca kapanıyor ama
    söyleyecek bir şeyi yok, odaklanabilir bırakmak okuyucuyla sheet arasına adsız bir kontrol koyar.
    Veri silme sheet’i iki aşamalı onay kullanıyor ve ikinci aşama başlığı yerinde değiştiriyor —
    aynı karede farklı bir soru. `useSheetTitleFocus` ikinci bir argümanla o geçişte odağı
    yeniden taşıyor; duymayan bir okuyucu ilk soruyu yanıtlıyor olurdu.
    **Ölçüm gerçek bir hata yakaladı:** `findNodeHandle` web’de null döndürmüyor, **fırlatıyor** —
    her sheet açılışında yakalanmamış bir istisna. `Platform.OS === 'web'` ile erken çıkıldı.
    Ayrıca `measure-tap-targets.mjs` sayfa hatalarını yazıp **yok sayıyordu**; not bir dizi yeşil
    onay işaretinin altında kayıp gidiyordu. Artık çalışmayı düşürüyor.
    Altı kural koruyor (`src/a11y/sheetFocus.test.ts`), üstelik **sheet listesinin kendisi de**
    denetleniyor — yoksa bir sheet eşleşmeyi bırakınca kurallar ona bakmayarak “geçer”di. Beş
    ihlal enjekte edilip yakalandığı doğrulandı.
29. ✅ **TAMAMLANDI — Modal arka planlarını erişilebilirlik ağacından çıkar.** Beş sheet’te
    karartma alanı `<Pressable onPress={onClose}>` idi: adsız, odaklanabilir, ekran okuyucuya
    “düğme” diyen ama neyi kapattığını söylemeyen bir kontrol. `OptionSheet`’te bundan daha
    kötüsü vardı — karartma sheet’in **sarmalayıcısıydı** ve içeriği ayrı bir
    `<Pressable onPress={() => {}}>` ile dokunuşu yutarak korumak zorundaydı; yani tek bir
    kapatma alanı için iki adsız kontrol.
    `OptionSheet` karartmayı sarmalayıcıdan **kardeşe** çevrildi (madde 28’in beş sheet’inde
    zaten kullanılan yapı): karartma artık `accessibilityElementsHidden` +
    `importantForAccessibility="no"` ile gizlenebiliyor, sheet’i de gizlemeden — ve dokunuşu
    yutan `Pressable` tamamen gereksiz kaldı, silindi.
    **Doğrulama sırasında bulunan gerçek sınır:** react-native-web bu iki prop’u hiç
    desteklemiyor (pakette arattım, tanımlı değiller); web’de karartma hâlâ `tabindex="0"`
    taşıyan odaklanabilir bir `<div>`. Bu yeni bir bozulma değil — karartma zaten adsızdı — ama
    tarayıcı harness’i burada *doğrulayamıyor*, yalnızca native tarafın (iOS
    `accessibilityElementsHidden`, Android `importantForAccessibility`) doğru API’yi
    kullandığını garanti ediyor. TalkBack/VoiceOver cihaz testi yayın öncesi listede.
    `src/a11y/sheetFocus.test.ts`’teki “sheet backdrop is not an accessibility element” ve
    “nothing in a sheet exists only to swallow a tap” kuralları artık altı sheet’in hepsinde
    geçiyor; iki ihlal enjekte edilip yakalandığı doğrulandı.
30. ✅ **TAMAMLANDI — Büyük yazıda sabit yükseklikleri kaldır.** Aynı kusur üç yerde: `height`
    (sabit) + `overflow:'hidden'` birlikte kullanılmış, üstüne metin bindirilmişti. Büyük sistem
    yazı boyutunda metin kutuyu büyütecek yeri bulamıyor, `overflow:'hidden'` de taşanı kesiyordu.
    **`ArtSlot`** — paywall hero’sunun, her plan kartının, İncil sekmesinin “okumaya devam et”
    kahramanının ve Tonight kartının **tek ortak bileşeni** — `height` prop’unu doğrudan sabit
    yüksekliğe geçiriyordu; tek satır değişiklikle (`minHeight: height`) hepsi birden düzeldi.
    **`VerseCard`**’ın ayet metni kendi `ScrollView`’ında kayıyor, ama üstündeki etiket ve
    altındaki referans/kredi/ikon satırı kaymıyor — büyük yazıda bu iki satır tek başına kartın
    sabit 320dp’sine yaklaşabiliyor. **Bugünün seri (streak) rozeti** aynı kusurun
    `overflow:'hidden'` içermeyen hâliydi: sabit 64×64 kutu üç haneli bir seriyi (`999` gibi)
    kenarlıktan taşırıyordu; kutu artık `minWidth`/`minHeight` ile genişliyor.
    Üçünün de düzeltmesi aynı tek kelime: `height` yerine `minHeight` (satır ise `minWidth`).
    Taban, tasarımın olağan boyutunu korur; büyümeyi yalnız yer darlığı tetikler, o da içeriğin
    gerçekten istediği kadar.
    `src/theme/textGrowth.test.ts` üç kuralı da adıyla denetliyor; üç ihlal enjekte edilip
    (eski `height` satırı geri konarak) yakalandığı doğrulandı. Tarayıcıda 2× yazı boyutuyla
    doğrulandı: İncil sekmesinin kahraman kartı ve beş plan kartı, hepsi `min-height` DOM
    stiliyle render edip **0 kırpma** gösterdi.
    **Doğrulamanın bir sınırı not edildi:** aşırı (3×, ayrıca `line-height`’ı da genel CSS
    seçiciyle ezen) bir tarayıcı testi, react-native-web’e özgü — Yoga’nın native’de hiç
    yaşamadığı — bir yüzde-yükseklik döngüsü belirtisi gösterdi. Gerçekçi (yalnız font-size,
    2×) testler temizdi; aşırı test gerçek bir OS ayarını değil, testin kendi CSS enjeksiyonunun
    aşırılığını yansıtıyor — yine de not edildi, cihazda asla gözlenmezse bile.
31. 🟡 **KISMEN TAMAMLANDI — Metin rollerini merkezi tipe bağla.** Maddenin tam kapsamı —
    uygulamadaki **160 satır içi `fontSize` kullanımının** tümünü adlandırılmış bir role
    bağlamak — bilerek tamamlanmadı; nedeni not edilecek kadar önemli.
    **Yapılan kısım, kesin ve tartışmasız olan:** beş dosyada (`VerseCard`, `read.tsx`,
    `today.tsx` ×2, `bible.tsx`) tam olarak aynı dört değer — `fontSize: 11`,
    `letterSpacing: 2.5`, `textTransform: 'uppercase'`, `fontFamily: fonts.sansSemiBold` —
    birbirinden habersiz beş kez yazılmıştı (kahraman kartının üstündeki küçük büyük harf
    etiketi: “GÜNÜN AYETİ”, “OKUMAYA DEVAM ET”, “BÖLÜM 23”…). Hiçbir şey bunları senkron
    tutmuyordu. `src/theme/typography.ts`’e `type.overline` eklendi; renk role’ün dışında
    tutuldu — her çağıran kendi rengini veriyor, yalnızca şekil paylaşılıyor. Beş yer de
    taşındı.
    **Yapılmayan kısım, kasıtlı:** kalan ~150 kullanım arasında aynı piksel değerini
    paylaşan ama **bağlama göre gerçekten farklı roller** olan çoğu — örneğin 15sp `sans`
    Profile’da bir satırda, paywall’da başka bir satırda — otomatik olarak birleştirilmedi.
    Hangi 14 ham değerin hangi yeni semantic role’e ait olduğuna, ve piksel değeri
    çakışan ama bağlamı farklı metinlerin gerçekten aynı role mi ait olduğuna karar vermek
    tasarım kararı — ~150 yerde görsel regresyonu insan onayı olmadan otomatik sürmek yanlış
    olurdu. Yalnızca **tam, bağlamsız, harfi harfine tekrar eden** küme dokunuldu; bu saf
    tekilleştirme, yeni bir tasarım kararı değil.
    `src/theme/typography.test.ts`: role’ün beş çağıran yerde kullanıldığını ve hiçbir
    dosyanın onu ham değerlerden yeniden kurmadığını denetliyor. İki ihlal enjekte edilip
    yakalandığı doğrulandı. Tarayıcıda beş yerin de doğru boyut/harf aralığı/büyük harfle VE
    her birinin kendi rengiyle render ettiği doğrulandı — sıfır görsel fark.
32. 🟡 **KISMEN TAMAMLANDI — En küçük okunabilir metni yükselt.** Madde iki ölçüt adlandırıyor:
    boyut ve kontrast. Boyut tamamlandı, kontrast’ta gerçek ve önemli bir bulgu var ama
    düzeltilmedi — nedeni aşağıda.
    **Boyut:** tam olarak üç yer 10sp’de kalmıştı — Today’nin kilitli uyku duası “PLUS” rozeti,
    Pray’in kilitli kategori satırlarındaki “PLUS” rozeti, ve `ArtSlot`’un sadece geliştirme
    sırasında görünen (sanat kaydı olmadığında gösterilen) yer tutucu altyazısı. Material’in
    label-small tabanı 11sp; üçü de 11’e çıkarıldı. `src/theme/minTextSize.test.ts` tüm
    uygulamada 11sp altı `fontSize` kalmadığını denetliyor; bir ihlal enjekte edilip yakalandığı
    doğrulandı.
    **Kontrast — bulundu, düzeltilmedi:** Pray’in PLUS rozeti `t.gold` metni `t.goldSoft`
    zeminde gösteriyor; WCAG oranı hesaplandı: **Dawn (açık) temada 2,66:1** — küçük metin için
    gereken 4,5:1’in çok altında. Aynı renk çifti `VerseActionSheet`’in vurgula/yer imle
    eylemlerinde de kullanılıyor, yani izole bir kaza değil, tekrarlayan bir kalıp. Var olan
    `t.onGold` token’ı bunun çözümü değil — o, düz `gold` zemin için kalibre edilmiş ve
    `goldSoft`’a karşı denendiğinde durumu **kötüleştiriyor** (1,22:1). Yani bu “yanlış token
    kullanılmış” hatası değil, **yeni bir renk kararı** gerektiriyor — hangi tonun hem markanın
    altın vurgusunu koruyup hem 4,5:1’i geçeceğine karar vermek, madde 27’nin ayet tonu ve
    madde 31’in geri kalan 150 `fontSize`’ı gibi, gözden geçirilmeden otomatik sürülecek bir
    şey değil. Sayılar ve tam konumlar not edildi; renk kararı ayrı ele alınmalı.
    Tarayıcıda doğrulandı: her iki PLUS rozeti de 11px render ediyor.
33. ✅ **TAMAMLANDI — Uppercase dönüşümünü yerel dile göre yap.** `textTransform: 'uppercase'`
    platformun **yerel dile duyarsız** büyütme kuralını kullanıyor: iOS’ta `-uppercaseString`
    Apple’ın kendi belgelerine göre lokalize değil; Android’de `Locale.getDefault()` **cihazın**
    sistem dilini kullanıyor, uygulamanın kendi dil ayarını değil — yani telefonu İngilizce,
    uygulama dili Türkçe olan bir kullanıcıda ikisi de yanlış sonuç veriyordu. Türkçe’nin
    kuralı: küçük noktalı `i`, büyütülünce noktalı `İ` olur, düz ASCII `I` değil.
    **Somut, o anda canlı hata:** Bugün ekranının tarih satırı ay adını büyük harfle gösteriyor;
    “Nisan” her Nisan ayında “NİSAN” değil **“NISAN”** olarak render ediliyordu. Tarayıcıda saat
    9 Nisan 2026’ya sabitlenip doğrulandı: düzeltmeden önceki kural altında bu satır “NİSAN”
    yerine yanlış biçimi üretirdi; düzeltmeden sonra “9 NİSAN PERŞEMBE” doğru render ediyor.
    `String.prototype.toLocaleUpperCase(locale)` bu istisnayı doğru uyguluyor —
    `'nisan'.toLocaleUpperCase('tr')` → `'NİSAN'`, `.toUpperCase()` ise yanlış `'NISAN'` veriyor.
    `src/lib/text.ts`’e `localeUpper()` eklendi, `useT()` üzerinden `up()` olarak sunuluyor.
    Halihazırda tam olarak yedi ekran metnini büyük harfe çeviren yer vardı (biri
    `type.overline` role’ü üzerinden beş kez, ikisi ayrı ayrı) — hepsinin içeriği artık `up()`
    ile geçiriliyor: bugünün tarih satırı, “Günün ayeti”, “Uyku duası”, “Okumaya devam et”,
    bölüm etiketi, plan günü başlığı ×2, devotional etiketi, günlük şükran etiketi, günlük ayet
    referansı, seçenek sheet’inin başlığı, ayet aksiyon sheet’inin referansı. `style`’lardaki
    `textTransform:'uppercase'` **kaldırılmadı** — zaten doğru büyütülmüş bir Türkçe `İ`’yi
    tekrar büyütmek etkisiz (no-op), yani stil değişmeden kalabildi, yalnızca içerik önden
    doğru büyütüldü.
    `src/i18n/localeCase.test.ts`: `localeUpper`’ın Türkçe istisnayı doğru uyguladığını, altı
    dilin diğer beşinde davranışın değişmediğini, on iki bilinen render yerinin `up()`
    kullandığını, ve yeni bir `textTransform:'uppercase'` eklenirse listeye eklenmediği takdirde
    testin bunu söylediğini denetliyor. İki ihlal enjekte edilip yakalandığı doğrulandı.
34. ✅ **TAMAMLANDI — Tüm sabit İngilizce erişilebilirlik metinlerini çeviri anahtarına taşı.**
    Maddenin adlandırdığı dördü de bulundu ve düzeltildi: `VerseCard`’ın “Verse of the day”
    etiketi, `bible.tsx`’in “requires Plus”u, `pray.tsx`’in kendi ayrı yazılmış “· Plus”u,
    `RitualCard`’ın “locked”u — ve madde 35 ile aynı bulguda çıkan `StreakFlame`’in “day streak”i.
    “Verse of the day” için yeni anahtar gerekmedi: `today.verseOfDay` zaten vardı (kartın kendi
    üst etiketinde), erişilebilirlik etiketi olarak da doğal okunuyor. “Plus”ın kendisi hiçbir
    dilde çevrilmiyor — kayıt defterinde marka adı olarak kalıyor (`data.keepPlus` gibi yerlerde
    de aynı kural) — yalnızca cümlenin çevresi çevrildi: `a11y.requiresPlus`, `a11y.locked`.
    `bible.tsx` ve `pray.tsx`’in **iki farklı ifadesi** (“, requires Plus” / “· Plus”) tek ortak
    anahtarda birleştirildi; ekran okuyucu için tutarlı, tam bir cümle iki farklı kısaltılmış
    biçimden daha iyi.
    **`StreakFlame` çevrilmedi, kaldırıldı.** Kendi etiketi çeviri eksikliği değildi — Today’nin
    zaten doğru etiketlediği aynı seri rozetinin **içinde**, onunla çakışan ikinci bir duyuruydu.
    Doğru çözüm: `StreakFlame`’i erişilebilirlikten tamamen çıkarmak (`importantForAccessibility="no"`
    + `accessibilityElementsHidden`), `litToday` bilgisini dışarıdaki tek etikete taşımak.
35. ✅ **TAMAMLANDI — ProgressRing ve StreakFlame etiketlerini yerelleştir.** `ProgressRing`’in
    “3 of 4 completed today” tümcesi hiç `useT()` kullanmıyordu; sayılar rakam olarak kalıyor
    (`${done}/${total}`), yalnızca “completed today” çevrildi (`today.completedToday`, altı dil) —
    uygulamadaki her sayılı etiketin zaten izlediği aynı `${sayı} ${tr(anahtar)}` kalıbı.
    **Yol boyunca bulunan, ayrı bir hata:** `today.tsx`’in seri rozeti `${count} ${tr('today.dayStreak')}`
    kullanıyordu — sayılı bir adın düz çeviriciyle okunması, `bible.days`/`read.results`/
    `player.minLeft` için zaten düzeltilmiş “1 días seguidos” hatasının **aynısı**, bu tek yerde
    gözden kaçmış. `today.dayStreak.one` eklendi; tarayıcıda doğrulandı: Almanca “1 Tag in Folge”
    (çoğul “Tage” değil), Fransızca “1 jour de suite” (çoğul “jours” değil).
    Koruma: `src/a11y/hardcodedText.test.ts` — altı bilinen sabit-İngilizce etiketin gittiğini,
    yeni anahtarların gerçekten kullanıldığını, `StreakFlame`’in artık kendi etiketini
    taşımadığını, ve Today’nin seri etiketinin hem sayıyı hem `litToday` durumunu taşıdığını
    denetliyor. Üç ihlal enjekte edilip yakalandığı doğrulandı. Tarayıcıda Türkçe/Almanca/
    Fransızca’da hem seri rozeti hem ilerleme halkası hem kilitli plan/dua etiketleri okundu;
    konsol temiz.
36. ✅ **TAMAMLANDI — Reduce Motion kapsamını bütün uygulamaya genişlet.** Beklenenden farklı
    bir bulgu: `react-native-reanimated`’ın `withTiming`/`withSpring`/`withRepeat` ve her
    layout-animasyon builder’ı (`FadeIn`, `ZoomIn`, …) **zaten** `ReduceMotion.System`’a
    varsayılan olarak geliyor — kütüphane kaynağında doğrulandı
    (`getReduceMotionFromConfig`), ve tarayıcıda `prefers-reduced-motion: reduce` ile de
    ampirik olarak kanıtlandı: `ToastHost`’un `FadeInDown`/`FadeOutUp`’ı azaltılmış hareket
    açıkken **sıfır animasyonlu kare** ile render ediyor (opacity doğrudan 1, transform yok),
    kapalıyken kademeli render ediyor. Uygulamada hiçbir yerde `ReduceMotion.Never` yok, yani
    beş animasyonlu dosyanın (`player.tsx`, `StreakFlame`, `RitualCard`, `ProgressRing`,
    `ToastHost`) hepsi zaten sistem ayarına uyuyordu — “yalnız player ve flame uyuyor”
    öncülü güncel değildi.
    **“Zaten doğru” yeterli değil — sessiz bir üçüncü taraf varsayılığına dayanmak kırılgan.**
    İkisi (`player.tsx`, `StreakFlame`) bunu zaten açıkça yazıyordu; üçü (`ProgressRing`,
    `ToastHost`, `RitualCard`’ın shimmer’ı) hiçbir şey söylemeden kütüphanenin varsayılanına
    güveniyordu — gelecekte bir düzenleme ya da kütüphane sürümü bunu fark etmeden bozabilirdi.
    Beşi de artık kendi kaynağında açık: `ProgressRing` ve `ToastHost`’a `useReducedMotion()`
    eklendi ve `entering`/`exiting` buna göre koşullandırıldı (davranış **değişmedi** —
    tarayıcıda önce/sonra aynı sıfır-kare sonucu doğrulandı); `RitualCard`’ın zaten var olan
    `reduceMotion: ReduceMotion.System`’ı artık “kütüphane varsayılanı da bu ama bilerek
    yazıldı” diye yorumlanıyor.
    Onboarding’de kontrol edildi, **hiç animasyon yok** — madde onu önden anıyor ama şu an
    düzeltilecek bir şey değil.
37. ✅ **TAMAMLANDI — Hareket azaltmada shimmer’ı kaldır.** `RitualCard`’ın shimmer’ı
    `-CARD_W`’dan `CARD_W`’a kayıyor — ikisi de kartın **dışında**. Azaltılmış harekette
    animasyon sıfır kareyle direkt `CARD_W`’a atlıyor, yani shimmer’ın “hızlı versiyonu” değil,
    **hiç görünmeyen hâli** oluyor. Maddenin istediği statik ödül zaten vardı ve animasyona
    bağlı değildi: altın kenarlık, altın ikon rozeti ve “Tamamlandı” metni hepsi düz `done`
    boolean’ına bağlı, shimmer çalışsın ya da çalışmasın aynı render ediyor.
    Koruma (`src/a11y/reduceMotion.test.ts`, beş kural): animasyonlu dosya kümesinin
    değişmediği (yoksa yeni bir dosya sessizce kapsam dışı kalır), her animasyonlu dosyanın
    kendi kaynağında bir reduce-motion referansı taşıdığı, hiçbir yerde `ReduceMotion.Never`
    olmadığı, `ProgressRing`/`ToastHost`’un yalnızca *bildirmediği* — gerçekten ternary’de
    *kullandığı*, ve ritüel ödülünün shimmer’a bağlı olmadığı. Dört ihlal enjekte edilip
    yakalandığı doğrulandı.
38. ✅ **TAMAMLANDI — Animasyonlu durum değişimlerini seslendir.** Maddenin adlandırdığı üç
    geçişten biri (“tamamlandı”) zaten bildiriliyordu: her tamamlama zaten `toast(...)`
    çağırıyor, her toast da zaten `ToastHost` üzerinden `announceForAccessibility` ile
    duyuruluyor (madde 24’ün altyapısı). Eksik olan **“geri alındı”**, **“plan günü bitti”** ve
    **“dua sona erdi”** yarısıydı — üçü de yalnız görsel bir değişimdi.
    **Ritüel geri alındı:** `today.tsx`’in üç `uncompleteStep(...)` çağrısı hiçbir şey
    duyurmuyordu; tamamlanmış bir kartı tekrar dokunmak kartın kendi etiketini değiştiriyordu
    ama TalkBack’e bunu söyleyen hiçbir şey yoktu. `undo()` sarmalayıcısı eklendi:
    `uncompleteStep` + `toast(tr('today.undone'))`.
    **Plan günü bitti:** `plan/[id]/[day].tsx`’in `complete()`’i haptik verip **hemen**
    `router.back()` çağırıyordu — ekran okuyucuya “gün tamamlandı” diyen hiçbir şey yoktu.
    `toast(tr('plan.dayCompletedToast'))` eklendi; zaten var olan `!done` koruması altında,
    yani tamamlanmış bir günü tekrar “Bugünü tamamla”ya basmak sahte bir onay duyurmuyor.
    **Dua sona erdi:** `player.tsx` her satırı zaten duyuruyordu (`AccessibilityInfo.
    announceForAccessibility(prayer.script[line])`), ama son satıra ulaşınca prev/pause/next
    satırının yerini Amin düğmesinin aldığını — tamamen görsel bir geçişi — hiçbir şey
    söylemiyordu. `lastLine`’a (satıra değil) bağlı ayrı bir `useEffect` eklendi, durumu
    girildiğinde bir kez duyuruyor.
    Üç yeni anahtar altı dilde (`today.undone`, `plan.dayCompletedToast`,
    `player.prayerEnded`).
    **Doğrulama sırasında bulunan, madde 38’in dışında kalan gerçek bir hata:**
    `useStreakStore`’un `_layout.tsx`’teki `tickToday()` çağrısı, Zustand’ın `persist`
    ara katmanının **asenkron** `AsyncStorage`’dan yeniden hidrasyonunu beklemiyor —
    `getState()` mount anında henüz varsayılan (boş) durumu döndürüyorsa `tickToday()` o güne
    ait `doneDay`/`doneSteps`’i sıfırdan hesaplayıp storage’a geri yazıyor, gerçek kayıtlı
    veriyle **yarışıyor**. Tarayıcıda doğrulanırken doğrudan gözlemlendi: seed edilen
    `doneSteps` sayfa yüklenince sıfırlanıyordu. Web’e özgü değil — `AsyncStorage` native’de de
    asenkron, aynı yarış her cold start’ta olası. Madde 38’in konusu değil, ayrı ele alınmalı.
    Koruma (`src/a11y/announcedTransitions.test.ts`): üç yerin de doğru anahtarla doğru
    koşulda duyurduğunu denetliyor. Üç ihlal enjekte edilip yakalandığı doğrulandı. Tarayıcıda
    doğrulandı: plan günü tamamlama tostu (“Gün tamamlandı”), oturum içinde canlı tamamlanan
    bir ritüeli geri alma tostu (“Geri alındı”, etiket doğru “Şükran”a döndü), ve oynatıcının
    son satıra ulaşınca Amin düğmesinin doğru anda belirmesi.
39. ✅ **TAMAMLANDI — PillButton `busy` ile `disabled` durumunu ayır.**
    `accessibilityState={{ disabled: Boolean(disabled), busy: Boolean(disabled) }}` — `disabled`
    ne zaman true olursa `busy` da true oluyordu, tek bir prop’tan ikisi birden. Uygulamadaki
    **her iki gerçek çağrı yeri de** (quiz’in “Devam”ı ad boşken, günlüğün “Kaydet”i metin
    boşken) yükleme değil — form eksik — yine de her ikisi TalkBack’e “meşgul” diyordu.
    Ayrı bir `busy?: boolean` prop’u eklendi: `inactive = disabled || busy` görsel/native
    devre-dışı durumunu veriyor, ama `accessibilityState.busy` artık **yalnız** kendi prop’undan
    geliyor. Meşgulken düğme içinde bir `ActivityIndicator` da beliriyor (madde “spinner
    gösterilmeli” diyordu).
    Paywall’ın satın alma düğmesi — bileşenin **tek gerçek meşgul** çağrısı — `disabled`’ı
    (üç nedeni de kapsayan hâliyle: meşgul, bekleyen işlem, seçili plan yok) korurken artık
    ayrıca `busy={busy}` veriyor, yani yalnız GERÇEKTEN süren işlem TalkBack’e “meşgul” diyor.
    **Yan yolda bulunan, aynı kusurun bir örneği daha:** paywall’ın “Satın alımları geri
    yükle” düğmesi görünür metni “Geri yükleniyor…”ya değişirken erişilebilirlik etiketi hep
    sabit “Satın alımları geri yükle” kalıyordu — `busy` durumu doğru taşınıyordu ama etiket
    ekrandakiyle uyuşmuyordu. Etiket artık aynı koşula bağlı.
    Koruma (`src/a11y/busyState.test.ts`, dört kural), dört ihlal enjekte edilip yakalandığı
    doğrulandı. Tarayıcıda doğrulandı: quiz ve günlük düğmeleri artık `aria-disabled="true"`
    ile **`aria-busy` hiç yok** (öncesinde `"true"` olurdu) — react-native-web’in
    `aria-busy`’i gerçekten desteklediği de bağımsız olarak doğrulandı, yani bu “native-only”
    bir sınır değil.
40. ✅ **TAMAMLANDI — Silme ve destructive işlemlerde erişilebilir doğrulama kullan.** Native Alert
    düğme sırası, iptal varsayılanı ve TalkBack açıklaması bütün dillerde kontrol edilmeli.
    Uygulamadaki 7 `Alert.alert` çağrısı tek tek tarandı: hiçbiri silme/destructive onayı değil
    (paywall’da 4’ü satın alma hatası/destek, profile’da 2’si hata, 1’i de hatırlatma izni
    engellendiğinde çıkan basit Cancel/Ayarlar’a git seçimi — destructive değil ama tek gerçek
    iki seçenekli Alert olduğu için sırası da kontrol edildi: `[Cancel, Aç Ayarlar]`, Android’in
    negatif/pozitif eşlemesiyle ve iOS’un “cancel solda” alışkanlığıyla uyumlu). Gerçek destructive
    onayı zaten `DataActionSheet` (madde 14) — native Alert değil, özel iki aşamalı bir sheet.
    Üç ölçüte karşı denetlendi: **düğme sırası** — Confirm üstte, Cancel en altta, bu iOS action
    sheet alışkanlığı (destructive eylem üstte, Cancel her zaman sabit çıkış), yatay Alert
    alışkanlığıyla aynı olmak zorunda değil, ikisi de kendi bileşeninde doğru. **İptal
    varsayılanı** — `onRequestClose={onClose}` donanım/gesture geri tuşunu zaten Cancel’a bağlıyor.
    **TalkBack açıklaması, altı dilde** — `data.deleteTitle/Body/FinalTitle/FinalBody/Confirm`,
    `data.restart*`, `data.cancel`, `data.continue` altı dilde de eksiksiz, aşamaya göre ayrı ve
    son aşamanın metni her dilde “geri alınamaz”ı açıkça söylüyor (“There is no undo.” / “Geri
    alma yok.” / “No hay vuelta atrás.” / “Não há como desfazer.” / “Aucun retour possible.” /
    “Es gibt kein Zurück.”). Confirm düğmesinin `t.danger` (kırmızı) rengi de yalnız 2. aşamada
    geliyor — 1. aşamada nötr “Continue”.
    **Asıl bulunan kusur bunların hiçbiri değildi:** sheet kapanınca (Cancel, backdrop veya
    işlemi tamamlama) erişilebilirlik odağı onu açan satıra geri dönmüyordu. `useTriggerFocus`
    (madde 28’in kancası, tam bunun için yazılmış) profile.tsx’te appearance/language sheet’leri
    için bağlıydı ama uygulamanın **tek geri alınamaz eylemini** açan “Restart onboarding” ve
    “Delete all my data” satırları için hiç bağlanmamıştı. İkisine de kendi `dataAction`
    değerine bağlı birer `useTriggerFocus` ref’i eklendi.
    Koruma: yeni `src/a11y/destructiveConfirm.test.ts` (ref’lerin varlığı ve doğru satıra bağlı
    olması, `onRequestClose`, aşamalı `t.danger`, Alert sırası, altı dilde `deleteFinalBody`
    varlığı) + madde 28’in `sheetFocus.test.ts`’teki “2 sheet” sayımı 4’e güncellendi (satır
    listesi büyüdü, gevşetilmedi). Altı ihlal tek tek enjekte edilip yakalandığı doğrulandı.
    `npm test` (161/161), typecheck, lint, release-check, tap-targets (13 görünüm, değişmedi),
    Android export temiz. **Tarayıcı doğrulaması denendi ve bu düzeltme için anlamsız çıktı:**
    react-native-web’in kendi `<Modal>`’ı `document.activeElement`’i açılışta kaydedip
    kapanışta zaten geri yüklüyor (`ModalFocusTrap.js`) — `useTriggerFocus` olmadan da web’de
    aynı sonucu veriyor. Bu kusur yalnız native’de (Android/iOS) var; web’de platformun kendisi
    zaten yapıyor, tarayıcı test bunu ayırt edemiyor. Doğrulama Task 4’teki statik testlerle
    yapıldı. Detaylar: `docs/superpowers/plans/2026-08-09-destructive-confirm-focus-return.md`.
41. ✅ **TAMAMLANDI — Arama temizleme düğmesini 48 dp hedefe çıkar.** Küçük 18 px ikon yalnızca
    `hitSlop` ile bırakılmamalı; görünür/fiziksel hedef alanı sağlanmalı.
    Bu, bu oturumdan önceki bir işte (`f46bea8`, o zamanki numaralandırmayla “madde 21”) zaten
    yapılmış: `app/search.tsx`’teki temizleme `Pressable`’ı artık `hitSlop` değil,
    `width: TAP_MIN, height: TAP_MIN` (48×48) gerçek bir kutuya sahip; geri düğmesi de aynı
    kutuya kavuşmuş, üstüne `hitSlop={12}` yalnızca ekstra pay için kalmış (kendi 48 dp’si zaten
    var, tek başına dayanmıyor). Kod hâlâ bu hâlde, yeni bir değişiklik gerekmedi — sadece
    doğrulandı ve işaretlendi. Kanıt: `src/theme/tapTargets.test.ts`’teki genel kural (“an icon
    button is not left with only hitSlop”) `search.tsx` dâhil tüm kaynağı tarıyor ve boyutsuz +
    hitSlop’lu hiçbir Pressable bulamıyor; bu oturumda madde 40 doğrulaması sırasında yeniden
    çalıştırılan `npm run tap-targets`, “Search (typed)” görünümünde 18 hedefin hepsinin 48 dp’nin
    üstünde olduğunu ölçtü (0 under 48dp).
42. ✅ **TAMAMLANDI — Prayer kategori chip’lerini 48 dp yap.** Mevcut 44 dp minimumu Android
    hedefinin altında; yatay liste de odak sırasında seçili chip’i görünür alana kaydırmalı.
    Yükseklik yarısı zaten yapılmıştı: chip’ler `minHeight: TAP_MIN` (48 dp) taşıyor, `tap-targets`
    ölçümü “Pray” için 0 hedefin 48 dp’nin altında olduğunu doğruluyor. Asıl eksik kaydırmaydı.
    Altı kategori (`prayers.ts`) 390 px’lik bir ekrana sığmıyor — son chip (“Strength”) `x: 582`’de,
    tamamen ekranın dışında. Bir chip’i seçmek (dokunarak veya önceden seçili gelerek) onu ekran
    kenarında kırpılmış bırakıyordu, kaydırmadan aktif olduğunu bile anlamak mümkün değildi.
    Her chip’in kendi `onLayout`’u konumunu bir map’e yazıyor; `ScrollView`’ın kendi `onLayout`/
    `onScroll`’u görünür genişliği ve kaydırma konumunu takip ediyor; `cat` değiştiğinde bir
    `useEffect` — chip görünür pencerenin solunda veya sağında taşıyorsa — onu tam görünür kılacak
    **en az** miktarda kaydırıyor (ortalamıyor, her seçimde kayıtsız şartsız kaydırmıyor).
    `useReducedMotion()` (madde 36/37’nin eklediği kanca) OS azaltılmış hareket istediğinde
    kaydırmanın kendi animasyonunu kapatıyor.
    Koruma (`src/a11y/chipScrollIntoView.test.ts`, dört kural), dört ihlal enjekte edilip
    yakalandığı doğrulandı. `npm test` (165/165), typecheck, lint, release-check, tap-targets
    (13 görünüm, değişmedi), Android export temiz.
    **Tarayıcı doğrulamasında gerçek bir tuzak bulundu ve düzeltildi:** ilk Playwright betiği
    hedef chip’e `.click()` yapıyordu — Playwright’ın kendi actionability kontrolü tıklamadan
    önce hedefi zaten görünür alana kaydırıyor, uygulamanın kodundan tamamen bağımsız. Bu yüzden
    betik, düzeltmesiz derlemeyi de (scrollTo çağrısı yorum satırına alınmış) “çalışıyor” olarak
    raporladı. `elementHandle.evaluate(el => el.click())` ile ham DOM tıklamasına geçilince
    (Playwright’ın kaydırma adımını atlıyor) fark netleşti: düzeltmesiz derlemede “Strength”
    `x: 582`’de kalıyor (390 px görünümde ekran dışı); düzeltmeli derlemede `x: 254`’e taşınıp
    tamamen görünür oluyor. Detaylar:
    `docs/superpowers/plans/2026-08-09-prayer-chip-scroll-into-view.md`.
43. ✅ **TAMAMLANDI — “Tümünü göster” metin bağlantısını gerçek düğme alanına çevir.** Sadece
    metne basmak yerine 48 dp satır ve belirgin pressed/focus durumu kullanılmalı.
    48 dp satır zaten vardı (`minHeight: TAP_MIN`). Eksik olan, basılı durumdu: `style` sabit bir
    nesneydi, `pressed`’in fonksiyonu değil — bu dosyadaki her chip ve satır basılıyken 0.6–0.7
    opaklığa iniyor, bu tek kontrol basılı tutulurken bile tam opaklıkta kalıyordu; dokunulabilir
    bir düğme değil, altı çizili gibi görünen düz metin gibi okunuyordu. `style` artık
    `({ pressed }) => ({ ..., opacity: pressed ? 0.6 : 1 })`; dokunma alanı da `paddingHorizontal`
    ile metnin kenarlarının biraz ötesine taşındı (görünen metin aynı yerde kalsın diye negatif
    `marginRight` eşleniyor). Focus durumu zaten platformun varsayılan halkasıyla ücretsizdi —
    kod tabanında hiçbir yerde `outlineStyle: 'none'` yok, yani klavye/switch-control odağı
    zaten görünür.
    Koruma (`src/a11y/pressedFeedback.test.ts`), iki ihlal (tam eski hâle dönüş; sadece `opacity`
    satırının silinmesi) enjekte edilip yakalandığı doğrulandı. `npm test` (166/166), typecheck,
    lint, release-check, tap-targets (13 görünüm, değişmedi), Android export temiz. Tarayıcıda
    doğrulandı: bir kategori seçilip “Show all” göründükten sonra mouse basılı tutulunca
    `getComputedStyle(el).opacity` `1`’den `0.6`’ya düşüyor; düzeltme geri alınan derlemede aynı
    ölçüm `1`’den `1`’e kalıyor (test anlamlı, ayırt ediyor). Detaylar:
    `docs/superpowers/plans/2026-08-09-showall-pressed-state.md`.
44. ✅ **TAMAMLANDI — Günlük silme ikonuna görünür hedef ver.** Küçük çöp simgesi, 48 dp alan ve
    hafif tonal arka planla hem dokunma hem destructive anlamı taşımalı.
    48 dp kutu zaten vardı (`width/height: TAP_MIN`); eksik olan görünürlüktü — 18 px `inkFaint`
    ikon tamamen şeffaf bir zemindeydi, dekorasyon gibi okunuyordu, destructive bir kontrol gibi
    değil. Arka plana `` `${t.danger}26` `` eklendi — yeni bir isimli renk **değil**, mevcut
    `danger` token’ının hex alfa ekiyle (yaklaşık %15 opaklık) soluk hâli; madde 32’nin
    gold-on-goldSoft kontrast boşluğu gibi yeni tam hex değerleri seçmek bu oturumun tek başına
    vereceği bir tasarım kararı olurdu, mevcut onaylı rengin şeffaf bir türevi ise mekanik ve
    savunulabilir bir dilim. `borderRadius: TAP_MIN / 2` ile tam bir daire; ikonun kendisi de
    `t.danger`’a boyandı (arka planın taşıdığı “destructive” anlamını ikonla da güçlendiriyor).
    Yol boyunca bulunan bir eksik daha: bu dosyadaki diğer her Pressable’ın basılı-durum
    geri bildirimi vardı, bu ikincisi yoktu — `opacity: pressed ? 0.7 : 1` eklendi.
    Koruma (`src/a11y/journalDeleteTarget.test.ts`), iki ihlal enjekte edilip yakalandığı
    doğrulandı. `npm test` (167/167), typecheck, lint, release-check, tap-targets (13 görünüm,
    değişmedi), Android export temiz.
    Tarayıcıda doğrulandı: gerçek bir kayıt canlı composer üzerinden oluşturuldu (madde 38’in
    bulduğu Zustand hydration yarışını atlamak için, `localStorage`’a doğrudan yazmak yerine).
    Silme düğmesi ölçüldü: `48×48px`, `border-radius: 24px`, `background-color: rgba(176, 73,
    47, 0.15)` — Dawn temasının `danger` değeri beklenen opaklıkta. Düzeltme geri alınan
    derlemede aynı ölçüm `background-color: rgba(0, 0, 0, 0)` (tamamen şeffaf) veriyor — test
    ayırt ediyor. Detaylar: `docs/superpowers/plans/2026-08-09-journal-delete-target.md`.
45. ✅ **TAMAMLANDI — Okuyucu font ayarında örnek paragraf göster.** Sadece büyük/küçük A
    düğmeleri, gerçek satır uzunluğu ve leading etkisini anlatmıyor.
    `ReadingSettingsSheet`’e `read.tsx`’in gerçek ayet metni için kullandığı **aynı** formülle
    (`fontFamily: fonts.serifLight`, `fontSize: Math.round(18 * fontScale)`,
    `lineHeight: Math.round(30 * fontScale)`) bir örnek paragraf kartı eklendi — yaklaşık bir
    değer değil, okuyucunun gerçekten göstereceği boyut. Örnek metin Kutsal Kitap değil, yeni bir
    arayüz cümlesi (“This is how a page of Scripture will look at this size and spacing.” ve beş
    dil daha) — önizlemeyi *tanımlıyor*, kendisi önizlenen içerik değil, yani “Kutsal Kitap metni
    asla yeniden yazılmaz” sınırına dokunmuyor. Önizleme ekran okuyucudan gizlendi
    (`accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`) — satır
    kaydırmanın görsel bir gösterimi göremeyen birine bir şey söylemiyor, yanındaki yüzde zaten
    sayıyı veriyor.
    Koruma (`src/theme/readerPreview.test.ts`), üç ihlal enjekte edilip yakalandığı doğrulandı —
    biri özellikle `read.tsx`’in kendi `bodySize` formülünü değiştirip önizlemenin **gerçek
    kaynağı okuduğunu**, sabit bir kopya olmadığını kanıtladı. `npm test` (170/170), typecheck,
    lint, release-check, tap-targets (13 görünüm, değişmedi), Android export temiz.
    Tarayıcıda doğrulandı: sheet açılıp önizleme örnek metniyle bulunarak (rol/isimle
    ulaşılamıyor, kasıtlı olarak erişilebilirlikten gizli) %100’de `font-size: 18px` okundu;
    “Larger text” üç kez dokunulunca `23px`’e çıktı (`Math.round(18 * 1.3)` ile eşleşiyor).
    Önizleme bloğu tamamen kaldırılmış bir derlemede test zaman aşımına uğrayıp doğru şekilde
    başarısız oldu. Detaylar: `docs/superpowers/plans/2026-08-09-reader-size-preview.md`.
46. 🟡 **KISMEN TAMAMLANDI — Reader “paper” switch’ini platform semantiğiyle düzelt.** Görsel
    olarak özel kalabilir ama swipe/tap, checked state ve büyük yazı düzeni Material switch
    beklentisini karşılamalı.
    Üç ölçüt ayrı ayrı denetlendi, üçü de farklı bir sonuç verdi. **Checked state** zaten
    doğruydu: `accessibilityRole="switch"` + `accessibilityState={{ checked: paper }}` — native
    erişilebilirlik köprüsünün TalkBack/VoiceOver’a “switch, açık/kapalı” dedirten standart RN
    API’si. Taze bir web derlemesinde ampirik olarak da kontrol edildi: `aria-checked` hem
    açmadan önce hem açtıktan sonra `null` kalıyor — ama bu bileşenin kusuru değil, kurulu
    `react-native-web` paketinin **tamamında** `accessibilityState.`’in herhangi bir alt alanını
    (checked, busy, selected, expanded — hiçbiri) hiçbir bileşen için hiçbir DOM özniteliğine
    bağlamadığı `grep -rn "accessibilityState\." dist/` ile doğrulandı; native zaten çalışıyor,
    tarayıcı sadece göremiyor — bu geçişte birkaç maddenin tersinden yaşadığı aynı sınır.
    **Büyük yazı düzeni** gerçek bir kusurdu: etiketin kapsayıcısında `flex`/`minWidth: 0` yoktu,
    bu yüzden büyük sistem yazı boyutunda etiketin sarılacak genişliği yoktu — switch’in üstüne
    binmek yerine onu ekran kenarına itiyordu. `flex: 1, minWidth: 0` ve `flexShrink: 1`/`0`
    eklendi; normal (kısa etiket) durumda görsel değişiklik yok.
    **Swipe/drag jesti** uygulanmadı: gerçek bir sürükle-bırak eşiği/animasyonu inşa etmek mekanik
    bir düzeltme değil, bu geçişin dışında tutulan tasarım kararlarına (yeni renk, yeni tip rolü)
    daha yakın yeni bir etkileşim özelliği eklemek. Satırın kendi dokunma alanı zaten kartın
    tamamı — Material’ın 48 dp minimumunu çok aşıyor ve native bir switch’in thumb-sürükleme
    alanından daha büyük/kolay bir hedef; dokunma zaten sürüklemenin başlayacağı her pikseli
    kapsıyor. Tasarım incelemesi olmadan inşa edilmedi, açık bırakıldı.
    Koruma (`src/theme/paperSwitchLayout.test.ts`), iki ihlal enjekte edilip yakalandığı
    doğrulandı. `npm test` (172/172), typecheck, lint, release-check, tap-targets (13 görünüm,
    değişmedi), Android export temiz.
    Tarayıcıda doğrulandı (360 px dar görünüm): etiketin metin düğümü çok daha uzun bir metinle
    değiştirildi (büyük sistem yazı boyutunun aynı metne yapacağının yerine geçen bir test).
    Düzeltmeli derleme: satır 54px’den 98px’e büyüyor (iki satıra sarılıyor), switch track
    `x: 272`’de, satırın içinde kalıyor. Düzeltme geri alınan derlemede: satır 54px’de düz kalıyor
    (sarılmıyor), track `x: 686.6`’ya itiliyor — 360 px’lik ekranın sağ kenarının tamamen dışında.
    Detaylar: `docs/superpowers/plans/2026-08-09-paper-switch-material-semantics.md`.
47. ✅ **TAMAMLANDI — Ekran okuyucuda ayet numarası + metni tek anlamlı cümle yap.** İç içe Text
    düğümlerinin kesik veya tekrarlı okunmadığı cihaz testleriyle doğrulanmalı.
    Kod zaten doğruydu: madde 25 her ayete tam olarak bu yüzden açık bir `accessibilityLabel`
    (`${tr('read.verse')} ${item[0]}. ${item[1]}`) vermişti — görünen rakam iç içe bir `Text`,
    açık etiket olmadan çıplak bir sayı ilk kelimeye yapışık okunurdu. `src/a11y/labels.test.ts`
    bunun kaynak kodda doğru bildirildiğini (dropcap ve düz ayet dalının ikisinde de) zaten
    kanıtlıyordu. Eksik olan: gerçek bir render’ın bunu temiz mi ortaya çıkardığı, yoksa
    tarayıcının/erişilebilirlik ağacının kendisinin tam bu maddenin uyardığı parçalanma/tekrarı
    mı yarattığı — hiç kontrol edilmemişti. Bu ortamda gerçek bir TalkBack/VoiceOver cihazı yok;
    madde 47’nin “cihaz testi” isteğinin en yakın karşılığı, gerçek bir tarayıcı derlemesinin
    erişilebilirlik ağacı.
    Yeni bir kalıcı geliştirici aracı: `scripts/check-verse-accessibility.mjs`
    (`npm run verse-a11y`) — Mezmur 23’e (İngilizce) tohumlanmış `/read` sayfasında ilk iki ayeti
    (dropcap ve düz dal) okuyor, `aria-label`’ı `Verse N. <kuyruk>` şeklinde ayrıştırıyor, sayının
    kuyruğun başında tekrar etmediğini, kuyruğun kesik görünmediğini ve içindeki hiçbir iç
    öğenin kendi `aria-label`’ı olmadığını (bu, ekran okuyucuya tek isim yerine iki isim verirdi)
    doğruluyor. `tap-targets` ve Scripture drift kontrolüyle aynı düzenleme — tarayıcı gerektiği
    için CI kapısı değil, geliştirici aracı.
    İki ihlal enjekte edilip yakalandığı doğrulandı: `accessibilityLabel`’ı tamamen kaldırmak
    (kontrol beklenen öğeyi hiç bulamayıp doğru şekilde başarısız oldu — açık etiket olmadan
    tarayıcının varsayılan erişilebilir-ad algoritması tam bu maddenin tarif ettiği parçalı
    okumaya dönerdi) ve etiketin metin yarısını ayet numarasıyla değiştirmek (`${item[0]}.
    ${item[0]}`, kesik/tekrarlı bir etiketin yerine geçen bir test — hem tekrar hem kesiklik
    kontrolü her iki ayette de yakaladı).
    `npm test` (172/172, değişmedi — bu madde yeni bir birim testi eklemedi, çünkü asıl
    düzeltme zaten vardı ve zaten `labels.test.ts` tarafından korunuyordu), typecheck, lint,
    release-check, tap-targets (13 görünüm, değişmedi), Android export temiz.
    Gerçek derlemede `npm run verse-a11y` geçti: Ayet 1 `aria-label: "Verse 1. Yahweh is my
    shepherd: I shall lack nothing."` — temiz. Ayet 2 `aria-label: "Verse 2. He makes me lie
    down..."` iken **görünen** `textContent`’in hâlâ `"2  He makes me lie down..."` (iç içe
    Text’ten gelen çıplak rakam + iki boşluk) olduğu doğrulandı — etiketin gerçekten iş
    gördüğünü kanıtlıyor: görünen DOM çıplak rakamı taşımaya devam ediyor, erişilebilir ad ise
    onu doğru şekilde tekrarlamadan atlıyor. Detaylar:
    `docs/superpowers/plans/2026-08-09-verse-a11y-device-check.md`.
48. ✅ **TAMAMLANDI — Player otomatik ilerlemeyi erişilebilirlik açıkken varsayılan duraklat.**
    Kullanıcı satırı bitirmeden ekran değişmemeli; devam etme açık bir tercih olmalı.
    `paused` koşulsuz `false` başlıyordu. Otomatik ilerleme zamanlayıcısı (`Math.max(4000,
    satır.length * PACE_FACTOR[pace])`) görsel bir okuma hızına göre ayarlı; TalkBack/
    VoiceOver’ın kendi okuma hızıyla hiçbir ilgisi yok, ekran okuyucu kullanan biri hâlâ mevcut
    satırı dinlerken ekran değişebiliyordu.
    Yeni bir efekt, mount’ta `AccessibilityInfo.isScreenReaderEnabled()`’ı kontrol ediyor ve
    `true` dönerse `setPaused(true)` çağırıyor — `StreakFlame.tsx`’in kendi
    `isReduceMotionEnabled()` kontrolü için kullandığı `cancelled` bayrağı deseniyle aynı.
    `screenReaderChanged`’a da abone oluyor, yani player açıkken ekran okuyucu açılırsa da
    duraklıyor. Kasıtlı olarak tek yönlü: hiçbir dal `setPaused(false)` çağırmıyor — ekran
    okuyucuyu kapatmak otomatik ilerlemeyi sessizce yeniden başlatmamalı.
    Koruma (`src/a11y/playerAutoAdvance.test.ts`), dört ihlal enjekte edilip yakalandığı
    doğrulandı — biri özellikle “değişkenle otomatik devam ettirme” (`setPaused(enabled)`),
    biri de “gerçek `setPaused(false)` dalı” olmak üzere iki farklı otomatik-devam şeklini ayrı
    ayrı kontrol etti. `npm test` (175/175), typecheck, lint, release-check, tap-targets
    (13 görünüm, değişmedi), Android export temiz.
    Tarayıcıda ilginç bir gerçek bulundu: react-native-web’in `isScreenReaderEnabled()`’ı hep
    `true` döner (web’de gerçek bir ekran okuyucuyu güvenilir şekilde algılamanın yolu yok) —
    yani düzeltmeyle her tarayıcı derlemesi player’ı duraklatılmış açar; bu da kontrolü
    kolaylaştırdı. `/player?id=morning-light` açıldı: düzeltmeli derleme mount’ta hemen “Resume”
    gösteriyor (“Pause” değil) ve ilk satır 8 saniye sonra hâlâ ekranda — normal hızda ilk satırın
    kendi zamanlayıcısının ihtiyaç duyacağı ~7.2 saniyeyi aşıyor. Düzeltme kaldırılan derlemede:
    mount’ta “Pause” gösteriyor (zaten oynatılıyor) ve satır 8. saniyede kayboluyor — tam olarak
    bu maddenin tarif ettiği kusur. Detaylar:
    `docs/superpowers/plans/2026-08-09-player-screenreader-pause.md`.
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

## Liste dışında, yol boyunca bulunan hatalar

Bu maddeler 100’lük listede yok; yukarıdaki maddeleri doğrularken çıktılar. Numaralı bir
maddeymiş gibi sayılmıyorlar, ama düzeltildikleri için kaydı burada.

- ✅ **İngilizce dışındaki beş dil, sözlüğün 21–22 anahtarını hiç taşımıyordu.** Madde 24’ü
  tarayıcıda doğrularken oynatıcı Türkçe dilde İngilizce okundu. Ölçüm: `player.*` (12 anahtar)
  ve `notification.*` (4 anahtar) yalnızca İngilizce sözlükte vardı, `paywall.*` 6 anahtar
  eksikti. `lookup()` sessizce İngilizce’ye düşüyor — çalışma zamanı için doğru davranış (boş
  etiket yerine İngilizce), ama güvenilecek şey değil: uygulama hiçbir iz bırakmadan İngilizce
  metin yayınlıyordu. **Hatırlanacak somut sonuç:** hatırlatıcıları açık bir Türk kullanıcı her
  sabah İngilizce bir bildirim alıyordu.
  17 kullanılan anahtar beş dile çevrildi. Üç anahtar çevrilmedi, **silindi**: `player.close`,
  `player.previous` ve `player.next` zaten altı dilde çevrili olan `a11y.closePlayer`,
  `a11y.prevLine` ve `a11y.nextLine`’ın İngilizce-yalnız kopyalarıydı — oynatıcı artık mevcut
  olanları kullanıyor. İki ölü anahtar da silindi: `paywall.thenAnnual` (hiç kullanılmıyor ve
  kopyanın içine sabit `$59.99` fiyat gömüyor) ve `bible.credit` — **hiç kullanılmıyor, bayat, ve
  `docs/scripture-integrity.md`’nin “hak beyanı yalnız `src/data/scriptureRights.ts`’te durur”
  kuralını ihlal ediyordu**; üstelik *İngilizce* girdi Türkçe sürümün telifini taşıyordu. Canlı
  kredi `getBibleCredit()`’ten geliyor.
  **Koruma:** `src/i18n/completeness.test.ts` — sekiz kural: altı dil; her dilde her anahtar;
  İngilizce’de olmayan anahtar yok; başka bir dilde İngilizce metin bırakılmamış (kısa ortak
  sözcükler için 24 karakter eşiği); çeviri içinde kredi satırı yok (`source.conditions.*`
  kasıtlı olarak muaf — o metinler lisansın bize gösterme yükümlülüğü); tekil biçim eşleşmesi;
  sayılı adın `tn` ile okunması; ve uygulamanın istediği her anahtarın var olması. Dört ihlal
  enjekte edilip yakalandığı doğrulandı.

- ✅ **“1 resultados”, “1 días”, “1 min restantes”.** Sayının yanındaki ad her zaman çoğuldu.
  Bir tanesini bu turda ben eklemiştim; sınıfın tamamı düzeltildi. `useT()` artık sayıya duyarlı
  bir `tn(count, key)` veriyor: `<key>.one` varsa tam olarak 1 için kullanılıyor. Bilinçli olarak
  yalnız iki biçim — bu altı dilin hepsi 1’e karşı çoğul ayrımı yapıyor, tam CLDR çoğul
  kategorileri hiçbirinin ihtiyacı olmayan bir kural için makine olurdu. Dört çağrı yeri
  (`search`, `player`, `plan/[id]`, `bible`) `tn`’e geçti; `pray.min` değişmedi çünkü “min”/“Min.”
  altı dilde de değişmez. Tarayıcıda doğrulandı: İspanyolca “1 min restante” ve “1 resultado”,
  “0 resultados/résultats” çoğul kalıyor.

## Sabit sınırlar

- Kutsal Kitap metinleri çevrilmez, sadeleştirilmez, özetlenmez veya yeniden yazılmaz.
- Altı kaynak metin yalnız doğrulanmış dosyalardan ve lisans koşulları korunarak kullanılır.
- Tamamlanmış önceki maddeler bu listeye başarı gibi yeniden eklenmez.
- Uygulama değiştikçe bir madde ancak kod, cihaz testi veya yayın kanıtıyla kapatılır.
