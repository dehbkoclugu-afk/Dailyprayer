# Lumen — 100 Maddelik Denetim, Hata ve İyileştirme Raporu

_Tarih: 2026-10-27 · Kapsam: `app/`, `src/`, `scripts/`, `content/`, yapılandırma, CI, dokümanlar_

## Özet

| Kontrol | Sonuç |
|---|---|
| `npm run typecheck` | ✅ Temiz |
| `npm run lint` | ✅ Temiz |
| `npm test` | ✅ 56/56 geçti |
| Manuel kod incelemesi | ❗ 100 bulgu (aşağıda) |

Otomatik kontroller yeşil, ancak testler yalnızca saf mantık fonksiyonlarını kapsıyor. Ekran, state ve
servis katmanlarında testlerin yakalamadığı **gerçek kullanıcı hataları** var. Bulgunun bir kısmı
küçük deneylerle doğrulandı (örn. DST gün kayması ve Almanca/Fransızca Mezmur ayetleri — aşağıda “✔ doğrulandı” notu ile).

**Önem dereceleri:** 🔴 Kritik · 🟠 Yüksek · 🟡 Orta · 🔵 Düşük / iyileştirme

### İlk 10 öncelik (önerilen sıra)

1. #1 Toast “Geri al” butonuna basılamıyor
2. #2 Açılışta seri (streak) tick'i hydration'dan önce çalışıyor
3. #4 Ayet havuzunda DE/FR Mezmur ayetleri yanlış ayet numarası
4. #5 Kullanıcıya görünen metinlerde “ , ” bozulması (em-dash kaybı)
5. #7 Plus içeriği deep link ile ücretsiz açılabiliyor
6. #8 `/read?b=x` deep link'i uygulamayı çökertebiliyor
7. #3 DST sonrası her gece 00:00–01:00 arası “dünün” içeriği
8. #21 RevenueCat başlatma hatası oturum boyunca kalıcı
9. #43 `UIBackgroundModes: audio` → App Store reddi riski
10. #46 Gizlilik politikası “Selaora”, uygulama “Lumen”

---

## A. Kritik ve yüksek öncelikli hatalar

**1. 🔴 Toast “Geri al” (Undo) butonu tıklanamıyor** — `src/components/ToastHost.tsx:28`
Dış `View`'da `pointerEvents="none"` var; React Native'de bu, **tüm çocukların** dokunma almasını da engeller.
Günlük kaydı silindiğinde gösterilen “Geri al” hiçbir zaman çalışmaz → veri kaybı.
**Çözüm:** `pointerEvents="box-none"` kullanın.

**2. 🔴 Uygulama açılışındaki seri tick'i persist hydration'ından önce çalışıyor** — `app/_layout.tsx:133-146`
`useStreakStore.getState().tickToday()` ilk mount'ta çağrılıyor; AsyncStorage hydration'ı asenkron olduğu için
tick varsayılan state üzerinde yapılıyor, sonra hydration saklanan state ile üzerine yazıyor. Sonuç: “uygulamayı
açmak alevi yakar” özelliği soğuk açılışta büyük olasılıkla hiç çalışmıyor. Aynı effect `quiz.prayerTime`'ı da
hydration'dan önce okuyor → akşam bildirimi yeniden planlanmıyor.
**Çözüm:** `useStreakStore.persist.onFinishHydration` / `hasHydrated()` bekleyin (scripture restore'da zaten yapılan desen).

**3. 🟠 DST sonrası gün indeksi bir gün geride kalıyor** — `src/lib/dates.ts:17-20` ✔ doğrulandı
`Math.floor((d - 1 Ocak) / 86_400_000)` yaz saatinde 1 saat eksik sayar. `TZ=Europe/Berlin` ile:
30 Mart 00:30 → 87 (29 Mart ile aynı). Yaz saati boyunca her gece 00:00–01:00 arası dünkü ayet/devotional gösterilir.
**Çözüm:** `Date.UTC(y, m, d)` farkı ile hesaplayın.

**4. 🔴 Günlük ayet havuzunda Almanca/Fransızca Mezmurlar yanlış ayet** — `src/data/verses.ts` (üretici: `scripts/build-verses-i18n.mjs`) ✔ doğrulandı
Luther/Louis Segond'da Mezmur başlıkları 1. ayet sayıldığı için numaralar kayıyor:
“Psalm 46:10” DE metni aslında 46:9 (“der den Kriegen steuert…”), “Psalm 23:1” metnine “Ein Psalm Davids.” eklenmiş,
“Psalm 42:11” DE/FR metni 42:10. 368 girişin 139'u Mezmur; çok sayıda kayıt etkilenmiş olabilir.
**Çözüm:** Üretici script'e versification eşleme tablosu (KJV↔LSG/Luther) ekleyin ve EN/DE/FR çapraz doğrulama testi yazın.

**5. 🟠 Kullanıcıya görünen metinlerde “ , ” bozulması** — `src/i18n/translations.ts` (47 yer), `src/data/devotionals.ts` (67), `prayers.ts` (26), `quiz.ts` (12), `content/application/*.json` (~40/dil)
Em-dash (—) toplu biçimde “ , ” ile değiştirilmiş: “Lumen Plus , active”, “Thank you , your subscription…”.
Paylaşılan ayet metni de bozuk: `VerseActionSheet.tsx:80,86` → `“…”\n, Yuhanna 3:16`.
**Çözüm:** ` , ` → ` — ` geri dönüşümü + bunu yakalayan bir locale doğrulama kuralı.

**6. 🟠 “1 / 4” sabit kodlu toast** — `translations.ts:281` (`toast.verse`)
Ayet adımı hangi sırada tamamlanırsa tamamlansın “1 of 4” yazıyor. **Çözüm:** `{done}/{total}` parametreli çeviri.

**7. 🟠 Plus içeriği deep link ile paywall'sız açılabiliyor** — `app/player.tsx:40`, `app/plan/[id]/index.tsx`, `app/plan/[id]/[day].tsx`
Kilit kontrolü yalnızca liste ekranlarında. `lumen://player?id=<plus-dua>` veya `lumen://plan/bible-365` doğrudan açılıyor.
**Çözüm:** Hedef ekranlarda `plus && !isPlus` ise `router.replace('/paywall?from=…')`.

**8. 🟠 `/read` deep link parametreleri doğrulanmıyor → çökme** — `app/read.tsx:50-55, 44-47`
`Number('x')` → `NaN`; `Math.min(NaN, …)` = `NaN`; `bible[NaN]` → `undefined.chapters` hatası.
`v` parametresi bölüm uzunluğundan büyükse `scrollToIndex` “out of range” invariant hatası atar.
**Çözüm:** `Number.isInteger` + aralık kontrolü, `v`'yi `verses.length - 1` ile sınırla.

**9. 🟠 Ayet hedefi her bölüm değişiminde yeniden tetikleniyor** — `app/read.tsx:57-66`
Effect bağımlılıkları `[targetV, bIdx, cIdx]`; aramadan gelinip sonraki bölüme geçilince yeni bölümde de aynı
indekse kaydırıp yanıp sönüyor. **Çözüm:** Hedefi bir kez tüketip (ref) parametreyi `router.setParams` ile temizleyin.

**10. 🟠 Kütüphanedeki vurgular yanlış dilde gösteriliyor** — `app/library.tsx:55`
`getBible(locale)` **arayüz** dilini kullanıyor; okuyucu ise `scriptureLocale` kullanıyor. Arayüz TR, Kutsal Kitap EN ise
vurgular Türkçe metinle görünür. **Çözüm:** `useScriptureLocale()`.

**11. 🟠 Yer imleri ve okuma konumu kitap *indeksi* ile saklanıyor** — `useBookmarkStore.ts`, `useReaderStore.ts`, `read.tsx:228`
Farklı kanonlu (ör. Katolik-73) pakete geçince indeks başka kitaba işaret ediyor; `scripture-language.tsx:78,109`'daki
`'hr'` özel durumu bunun yamalanmış hali. **Çözüm:** `book` yerine kanonik `code` saklayın + persist `version`/`migrate`.

**12. 🟠 Vurgular ayet *dizi indeksi* ile anahtarlanıyor** — `read.tsx:222`
Ayet aralıkları (“2-3”) veya farklı versification yüzünden indeks çeviriler arasında farklı ayete denk gelir.
**Çözüm:** Anahtar olarak ayet etiketi (`item[0]`) kullanın.

**13. 🟠 İzin reddedilince hatırlatıcı “açık” görünüyor** — `app/onboarding/reveal.tsx:56-68`
İzin verilmezse `quiz.prayerTime` '07:30' kalır; Profil “Hatırlatıcı · 07:30” gösterir ama hiçbir bildirim yoktur.
`scheduleDailyReminder` promise'i de beklenmiyor (unhandled rejection). **Çözüm:** Red/hata durumunda `prayerTime: 'none'`.

**14. 🟠 “Onboarding'i yeniden başlat” onaysız ve tutarsız** — `app/(tabs)/profile.tsx:393-410`
`reset()` onay sormuyor, yönlendirme yapmıyor (kullanıcı `onboarded=false` iken Profil'de kalıyor), planlı bildirimleri iptal etmiyor.
**Çözüm:** Onay diyaloğu + `disableReminders()` + `router.replace('/onboarding')`.

**15. 🟡 Hatırlatıcı kapatılınca “Hatırlatıcı ayarlandı” toast'u** — `profile.tsx:67`. **Çözüm:** Ayrı `toast.reminderOff` metni.

**16. 🟡 İzin reddinde Alert ve Ayarlar aynı anda açılıyor** — `profile.tsx:76-77`
`Alert.alert` beklenmeden `Linking.openSettings()` çağrılıyor. **Çözüm:** Alert'e “Ayarları aç” butonu ekleyin.

**17. 🟡 Player: kayıtlı satır konumu yarış durumu** — `app/player.tsx:57-68`
Mount'ta `getItem` ile aynı anda `setItem('0')` effect'i de çalışıyor; okuma geç dönerse ilerleme sıfırlanabilir.
**Çözüm:** Restore tamamlanana kadar `setItem` yapmayan bir `restored` ref'i.

**18. 🟡 Building ekranında state updater içinde yan etki** — `app/onboarding/building.tsx:27-33`
`setDone` updater içinde `clearInterval` + `setTimeout(router.replace)`; StrictMode'da iki kez çalışabilir, unmount'ta timeout temizlenmiyor.
**Çözüm:** `done` değişimine bağlı ayrı bir `useEffect`.

**19. 🟡 Temizlenmeyen zamanlayıcılar** — `devotional.tsx:31`, `read.tsx:63`, `paywall.tsx:62-74`
Unmount sonrası `setState`/`router.back()` çağrıları. **Çözüm:** Cleanup + `active` bayrağı.

**20. 🟡 Non-null assertion ile çökme riski** — `today.tsx:84-85`, `player.tsx:40`
`prayers.find(...)!`; indirilen içerik paketinde `morning`/`sleep` kategorisi yoksa veya `script` boşsa çökme.
**Çözüm:** Fallback + içerik doğrulayıcıda kategori zorunluluğu.

## B. Abonelik / ödeme (RevenueCat)

**21. 🔴 Başlatma hatası oturum boyunca kalıcı** — `src/services/purchases.ts:86-103`
`initPromise` bir kez hata alırsa (ör. çevrimdışı `getCustomerInfo`) `rc=null` kalır; üretimde paywall oturum
boyunca “kullanılamıyor” der. Ayrıca `configure` başarılı olsa bile `getCustomerInfo` hatası `rc`'yi sıfırlıyor.
**Çözüm:** `configure` ile müşteri bilgisi çekmeyi ayırın; hata durumunda `initPromise = null`.

**22. 🟠 Müşteri bilgisi dinleyicisi yok** — `purchases.ts`
`addCustomerInfoUpdateListener` kullanılmıyor; yenileme/iptal/iade uygulama yeniden açılana kadar yansımaz.

**23. 🟠 `isPlus` kalıcı ve süresiz güveniliyor** — `useEntitlementStore.ts`
RevenueCat'e ulaşılamazsa eski `isPlus=true` sonsuza dek geçerli. **Çözüm:** Son doğrulama zamanı + `expirationDate` saklayın.

**24. 🟡 `restore()` hata fırlatabilir; `loadPlans` `.catch`'siz** — `purchases.ts:179-186`, `paywall.tsx:64`
Paywall restore'u yakalıyor ama diğer çağıranlar için sözleşme belirsiz; `loadPlans().then` reddedilirse spinner'da kalır.

**25. 🟡 Plus kullanıcısı paywall'da tekrar satın alabiliyor** — `paywall.tsx`
`isPlus` kontrolü yok. **Çözüm:** Aktifse teşekkür/yönetim görünümü.

**26. 🟡 Deneme bitiş tarihi milisaniye ile hesaplanıyor** — `paywall.tsx:351`
`trialDays * 86_400_000` DST'de saat kaydırır. **Çözüm:** `setDate(getDate() + trialDays)`.

**27. 🟡 Kullanılmayan “indirim” altyapısı ve metni** — `useEntitlementStore.sawDiscountOffer`, `paywall.giftBody`
“İlk yıl %50 indirim, bu teklif bir daha görünmeyecek” metni var ama ne indirimli paket ne de mantık var. Yapay
kıtlık ifadesi mağaza incelemesinde sorun olabilir. **Çözüm:** Kaldırın veya RevenueCat offering ile gerçek kurun.

**28. 🔵 Abonelik yönetim URL'sinde paket adı sabit** — `purchases.ts:188-194`. `Application.applicationId` kullanın.

**29. 🔵 Dokümanlar ile kod uyumsuz** — README/`go-live-checklist.md`: `lumen.weekly`, `API_KEYS`; kod: `monthly`, env değişkenleri.

## C. Bildirimler

**30. 🟠 Akşam “seriyi kurtar” bildirimi koşulsuz her gün** — `src/services/notifications.ts:39-53`
Kullanıcı o gün ritüeli tamamlasa da 20:30'da bildirim gelir; `streak` parametresi hiç kullanılmıyor.
**Çözüm:** Tamamlanınca bugünkü bildirimi iptal edip yarına tek seferlik (DATE trigger) planlayın.

**31. 🟡 Bildirim metinleri dil değişince güncellenmiyor** — `notifications.ts`
Metin planlama anındaki dilde dondurulur. **Çözüm:** Dil değişiminde yeniden planla.

**32. 🟡 Android bildirim kanalı oluşturulmuyor** — `setNotificationChannelAsync` yok; Android 8+ için önerilir.

**33. 🟡 Saat formatı doğrulanmıyor** — `notifications.ts:22-23`. `parseReminderTime` mevcut, burada da kullanın.

**34. 🔵 `setNotificationHandler` modül yan etkisi** — Dinamik import'tan önce gelen ön plan bildirimleri handler'sız kalır; root'ta bir kez kaydedin.

**35. 🔵 Hatırlatıcı 21:00 ise akşam bildirimi (20:30) ondan önce gelir** — Akşam bildirimini hatırlatıcıdan sonraya kaydırın.

## D. Veri, state ve iş mantığı

**36. 🟠 Gün dönümü takibi yok** — `useDailyContent.ts`, `today.tsx:75-77`, `_layout.tsx`
`AppState` dinlenmiyor; uygulama arka planda gece yarısını geçerse ayet, selamlama, tarih ve seri tick'i güncellenmez.

**37. 🟡 Seri “uygulama açma” ile artıyor** — `useStreakStore.ts:32-43`
Hiçbir ritüel yapılmadan seri büyür; “Toplam gün” anlamı belirsiz. Tasarım kararı netleştirilmeli.

**38. 🟡 Tamamlanmış ritüele dokunmak tamamlamayı geri alıyor** — `today.tsx:165,173,181`
Yanlışlıkla dokunma ilerlemeyi siler. **Çözüm:** Tamamlanmış kart içeriği yeniden açsın; geri alma için uzun basma/menü.

**39. 🟡 Ayet kartının herhangi bir yerine dokunmak “okundu” sayıyor** — `VerseCard.tsx:205-207`; karıştırılmış ayet de günün ayeti sayılıyor.

**40. 🟡 Kullanılmayan `useBibleStore`** — `src/state/useBibleStore.ts`
`planProgress`, `savedVerseKeys`, `chapterIndex` hiçbir ekranda kullanılmıyor; `usePlanStore`/`useBookmarkStore`/`useReaderStore` ile çakışıyor. Kaldırın (persist anahtarını temizleyen migration ile).

**41. 🟡 Persist sürüm/migration eksik** — `useHighlightStore` hariç hiçbir store'da `version` yok; #11/#12 gibi şema değişiklikleri veri kaybına yol açar.

**42. 🟡 `clearLocalUserData` başlangıç state'lerini elle tekrar ediyor** — `src/services/localData.ts:21-43`
Store'a alan eklenince unutulma riski; ayrıca `setState` persist'i hemen tekrar yazıyor. **Çözüm:** Her store'a `getInitialState`/`persist.clearStorage()`.

## E. Mağaza uyumu, gizlilik, güvenlik

**43. 🔴 `UIBackgroundModes: ["audio"]` ama ses yok** — `app.json`
Arka plan ses modu kullanmayan uygulama App Store 2.5.4 gerekçesiyle reddedilir. Ses özelliği gelene kadar kaldırın.

**44. 🟠 Android release workflow'u her PR'da çalışıyor** — `.github/workflows/android-apk.yml`
`pull_request` tetikleyicisi imzalama secret'larını istiyor; secret'sız PR'larda kırmızı CI, fork'larda risk. Ayrıca eski
`claude/bible-app-monetization-design-n3uiqr` dalına bağlı. **Çözüm:** Sadece `workflow_dispatch`/tag.

**45. 🟠 Gizlilik politikası ağ isteklerini belirtmiyor** — `src/data/legal.ts`
Uygulama GitHub Releases'tan manifest/paket indiriyor (IP adresi GitHub'a gider), RevenueCat anonim kullanıcı kimliği
oluşturuyor. “Hiçbir şey gönderilmez” ifadesi eksik kalıyor.

**46. 🟠 Marka tutarsızlığı: “Selaora” vs “Lumen”** — `docs/privacy/index.html` (son commit) vs `app.json`, `legal.ts`
Mağazaya girilen gizlilik URL'si farklı ürün adı gösteriyor → inceleme reddi riski. Tek isimde birleştirin.

**47. 🟡 Yasal metinler yalnızca İngilizce** — `legal.tsx`, `legal.ts`; uygulama 38 dilde. En azından bundled 8 dile çevirin veya dil notu ekleyin.

**48. 🟡 Kişisel e-posta kaynak kodunda sabit** — `profile.tsx:155` (`dehbkoclugu@gmail.com`), `android-apk.yml`
Paywall `EXPO_PUBLIC_SUPPORT_EMAIL` kullanırken Profil sabit adres kullanıyor. Tek kaynak + kurumsal destek adresi.

**49. 🟡 İndirme boyutu/süre doğrulaması yok** — `biblePacks.ts:42`, `applicationContentPacks.ts:78`
`release.bytes` kontrol edilmiyor, zaman aşımı/iptal yok; 4 MB+ dosyalar için ilerleme göstergesi ve Wi-Fi uyarısı yok.

**50. 🟡 Bible paketi yükseltmesi atomik değil** — `biblePacks.ts:49-51`
Önce eski dosya siliniyor sonra taşınıyor; arada çökme = paket kaybı. `applicationContentPacks.ts`'teki yedekli desenini kullanın.

**51. 🟡 Manifest fetch'lerinde timeout yok** — `biblePackRegistry.ts:21`, `applicationContentRegistry.ts:70`. `AbortController` ekleyin.

**52. 🔵 `newArchEnabled: false`** — `app.json`. Expo 53'te eski mimari kullanımdan kalkıyor; geçiş planlanmalı.

**53. 🔵 `eas.json` içinde `REPLACE_WITH_…` yer tutucuları** — submit profili çalışmaz.

**54. 🔵 `versionCode = GITHUB_RUN_NUMBER`** — workflow yeniden adlandırılırsa sayaç sıfırlanır, Play düşük sürüm kodunu reddeder.

## F. Performans

**55. 🟠 4 MB'lık Bible JSON'u senkron `require` + parse** — `src/data/bibleFull.ts:25-46`
İlk okuyucu/arama açılışında JS thread'i yüz ms–saniyeler kilitlenir (düşük uç Android). Ayrıca Bible sekmesi sadece
kitap adı için tüm metni yüklüyor (`bible.tsx:30`). **Çözüm:** Kitap adları için `bibleMeta`, metin için bölüm bazlı/asenkron yükleme.

**56. 🟠 Arama her sorguda ~31.000 ayeti `toLocaleLowerCase` ile tarıyor** — `app/search.tsx:42-62`
UI thread'de senkron. **Çözüm:** Normalize edilmiş metni bir kez önbelleğe alın, aramayı parçalara bölün (`InteractionManager`/chunk).

**57. 🟡 Arama vurgusu kayabiliyor** — `search.tsx:53,64-69`
İndeks küçük harfli metinden alınıp orijinal metne uygulanıyor; bazı dillerde küçük harf dönüşümü uzunluğu değiştirir.
Ayrıca aksan/İ-ı duyarsız arama yok (“Isa” ≠ “İsa”). **Çözüm:** `normalize('NFD')` + diakritik temizleme + eşleme tablosu.

**58. 🟡 Minimum 2 karakter CJK için uygun değil** — `search.tsx:43`. Çince/Japonca'da tek karakter anlamlı.

**59. 🟡 Günlük listesi sanallaştırılmamış** — `journal.tsx:162`. Yüzlerce kayıtta `ScrollView + map` yavaşlar → `FlatList`.

**60. 🟡 Tüm store'a abonelik** — `today.tsx:71`, `profile.tsx:37-41`, `read.tsx:28`, `ToastHost.tsx:15`
`useStore()` her alan değişiminde yeniden render. Selektör + `useShallow` kullanın.

**61. 🟡 Kullanılmayan 8,7 MB Bible dosyası depoda** — `src/data/bible-full.fr.json`, `bible-full.pt.json`
Hiçbir yerden `require` edilmiyor. Kaldırın (veya pack üretimi için `scripts/` altına taşıyın).

**62. 🟡 Büyük PNG varlıklar** — `assets/splash.png` 2,0 MB, `adaptive-icon.png` 1,4 MB. Optimize edin (≤300 KB).

**63. 🔵 `.claude/` (12 MB, fontlar/scriptler) depoya commit'lenmiş** — Uygulamayla ilgisiz; `.gitignore`'a alın veya ayrı repo.

**64. 🔵 Okuyucu `FlatList`'te `getItemLayout`/memo yok** — `read.tsx:181`; `renderItem` her render'da yeni closure üretiyor.

**65. 🔵 Ayet-gün alt bileşenleri `React.memo`'suz** — `RitualCard`, `VerseCard` gibi kartlar.

## G. Uluslararasılaştırma (i18n) ve içerik

**66. 🟠 Sabit İngilizce erişilebilirlik/arayüz metinleri** — `VerseCard.tsx:209` (“Verse of the day”), `bible.tsx:130` (“requires Plus”), `today.tsx:277` & `pray.tsx:196` (“PLUS”), `pray.tsx:106` (“· Plus”), `profile.tsx:434` (“Lumen v1.0.0”).

**67. 🟡 Dize birleştirme ile cümle kurma** — `today.tsx:121` (`greet, name`), `reveal.tsx:97`, `paywall.tsx:346-352`, `profile.tsx:220`
Kelime sırası dillere göre değişir (Japonca, Türkçe, RTL). **Çözüm:** `{name}` yer tutuculu çeviriler.

**68. 🟡 Çoğul kuralları yok** — “1 days”, “1 min” gibi. `Intl.PluralRules` ile `one/other` anahtarları.

**69. 🟡 Günlük tarihleri ham `YYYY-MM-DD`** — `journal.tsx:213`. `Intl.DateTimeFormat(locale)` ile gösterin.

**70. 🟡 Onboarding hedef ifadeleri yalnızca 4 dilde** — `reveal.tsx:18-47`; diğer 34 dilde İngilizce ifade Türkçe/Arapça cümlenin ortasına giriyor. İçerik paketine taşıyın.

**71. 🟡 RTL desteği yalnızca `direction` stili ile** — `_layout.tsx:173-178`
`I18nManager` kullanılmıyor; native bileşenler (Tab bar, Modal, gesture'lar) aynalanmaz. `textAlign: 'left'` sabitleri de var.

**72. 🟡 Drop cap ilk karakteri `slice(0,1)` ile alıyor** — `read.tsx:238`, `devotional.tsx:91`
Surrogate çiftleri/birleşik karakterler bölünür; metin tırnakla başlıyorsa büyük harf yerine “ çıkar. 1. ayet numarası da kayboluyor.
**Çözüm:** `Array.from(text)[0]` + baştaki noktalama atlama.

**73. 🟡 Plan “gospels-90” 89 bölüm içeriyor** — `src/data/planReadings.ts`; 90. gün Yuhanna 21'i tekrar ediyor.

**74. 🟡 Çok bölümlü plan günlerinde yalnızca ilk bölüm açılıyor** — `plan/[id]/[day].tsx:42-43`; `endBook/endChapter` yok sayılıyor.

**75. 🟡 Plan günü parametresi sınırlanmıyor** — `[day].tsx:27` (`Number(day) || 0`), `plan.days` üstü değerler kabul ediliyor.

**76. 🔵 Kullanılmayan çeviri anahtarları ve fonksiyonlar** — `paywall.gift*`, `getBookMeta`, `isBiblePackInstalled`, `clearRegisteredApplicationContentPacks` (yalnız test).

**77. 🔵 `tr(\`…\` as never)` tip kaçışları** — `player.tsx`, `pray.tsx`, `profile.tsx`, `quiz.tsx`; tip güvenliği kayboluyor. Anahtar birleşim tipleri tanımlayın.

## H. Erişilebilirlik (a11y)

**78. 🟡 Okuyucu kitap/bölüm seçicisinde etiket eksik** — `read.tsx:155-176, 339, 354, 390`; başlık butonu, geri oku ve bölüm kareleri `accessibilityLabel`/rol içermiyor.

**79. 🟡 Devre dışı butonlarda `accessibilityState` yok** — `read.tsx:108-131` (önceki/sonraki), `PillButton` kontrol edilmeli.

**80. 🟡 Yasal metin başlıklarında `accessibilityRole="header"` yok** — `legal.tsx:24-40`, `SectionHeader`.

**81. 🟡 Yanlış a11y etiketi** — `library.tsx:227` kaldırma butonu “Yer imi kaldırıldı” (geçmiş zaman mesajı) okuyor.

**82. 🟡 Sabit renkler tema dışı** — `#F2EEE6`, `#FFFFFF`, `rgba(...)` 15 dosyada; kontrast denetimi ve tema değişimi zorlaşıyor. `tokens.ts`'e taşıyın.

**83. 🔵 Dynamic Type sınırı yok** — Büyük sistem yazı boyutunda sabit yükseklikli kartlar (VerseCard 340px, tab bar 84px) taşar; `maxFontSizeMultiplier` belirleyin.

**84. 🔵 `Text onPress` buton olarak kullanılıyor** — `today.tsx:232-259`; dokunma alanı ve basılı durum geri bildirimi yok, `Pressable` kullanın.

## I. Kod kalitesi ve mimari

**85. 🟡 Kök seviyede Error Boundary yok** — Expo Router `ErrorBoundary` export'u kullanılmıyor; tek bir render hatası beyaz ekran.

**86. 🟡 Çökme/hata raporlama yok** — Sentry/Crashlytics benzeri bir araç yok; tüm `catch {}` blokları hatayı yutuyor (40+ yer).

**87. 🟡 Manifest doğrulama kodu kopyalanmış** — `biblePackRegistry.ts` ve `applicationContentRegistry.ts` neredeyse aynı;
Bible versiyonunda `generatedAt` ve `Number.isFinite(bytes)` kontrolü eksik. Ortak `validateManifest<T>()`.

**88. 🟡 Paket depolama kodu kopyalanmış** — `biblePacks.ts` ve `applicationContentPacks.ts` (dizin, SHA, temp/backup). Ortak modül.

**89. 🟡 `'hr'` sihirli değeri** — `scripture-language.tsx:78,109`; kanon değişimini kitap kodu ile çözün (#11).

**90. 🟡 Ekranlarda çok büyük inline stil blokları** — `profile.tsx` 519, `paywall.tsx` 469 satır; aynı kart/başlık/geri butonu 8+ ekranda kopya.
`BackButton`, `ArtCard`, `SettingsRow` gibi bileşenlere bölün.

**91. 🔵 Yorumlarda da “ , ” bozulması** — `_layout.tsx:44`, vb.; okunabilirlik.

**92. 🔵 Font adı sabit dize** — `player.tsx:149` `'Fraunces_400Regular'` → `fonts.serif`.

**93. 🔵 `package.json` test listesi elle yazılmış** — Yeni test dosyası eklenince unutulur. `node --test 'src/**/*.test.ts'` glob kullanın.

## J. Test, CI ve DevOps

**94. 🟠 Ekran/state/servis testleri yok** — Yalnızca saf fonksiyonlar test ediliyor; #1, #2, #8, #10 gibi hataları yakalayacak
`@testing-library/react-native` + Jest (veya node:test ile store testleri) ekleyin.

**95. 🟡 Uçtan uca (E2E) test yok** — Onboarding → paywall → bugün akışı için Maestro/Detox senaryosu.

**96. 🟡 İçerik çapraz doğrulama testi yok** — Ayet referansı ↔ metin uyumu (#4) ve “ , ” bozulması (#5) için CI kontrolü.

**97. 🔵 DST / saat dilimi testleri yok** — `dates.test.ts`'e `TZ=Europe/Berlin` ve `America/New_York` senaryoları ekleyin.

## K. UX iyileştirmeleri

**98. 🟡 Onboarding'de isim zorunlu, geri adım yok** — `quiz.tsx:246`, adımlar arası geri butonu yok; donanım geri tuşu tüm quizi kapatıyor. “Atla” + geri butonu ekleyin.

**99. 🟡 Gizlenen eski dua istekleri** — `journal.tsx:28`; `prayer-request` kayıtları görünmüyor ama silinmiyor. Kullanıcı ne görebilmeli ne silebilmeli durumda — dışa aktarım veya taşıma sunun.

**100. 🔵 Veri yedekleme/dışa aktarma yok** — Tüm günlük ve vurgular yalnızca cihazda; telefon değişiminde kaybolur. JSON dışa/içe aktarma veya iCloud/Drive yedeği ekleyin.

---

## Ek: Doğrulama notları

- **DST (#3):** `TZ=Europe/Berlin` altında `dayOfYear(2026-03-30 00:30) = 87`, `dayOfYear(2026-03-29 23:30) = 87`.
- **Mezmur (#4):** `verses.ts` havuzundan “Psalm 46:10” → DE: “der den Kriegen steuert in aller Welt…”, FR: “Il fait cesser les combats…” (her ikisi de 46:9).
- **Toast (#1):** `ToastHost.tsx:28` `pointerEvents="none"` — RN dokümantasyonuna göre alt görünümler de dokunma hedefi olamaz.
- Otomatik kontroller: typecheck ✅, lint ✅, 56 test ✅ (bu raporun hazırlandığı commit üzerinde).
