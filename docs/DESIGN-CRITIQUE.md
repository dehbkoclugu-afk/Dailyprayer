# Lumen — Kritik Tasarım Taslağı

**Yöntem:** tek-bağlam design review (native RN — impeccable web detektörü/tarayıcı
overlay'i geçersiz). Kanıt: gerçek cihaz ekran görüntüleri (Bugün, İncil, Dua, Günlük,
Ben, oynatıcı) + kaynak kod. Register: **product** (arayüz ürüne hizmet eder; ölçüt
"kazanılmış tanıdıklık" — araç görevin içinde kaybolmalı).

---

## Genel yargı

Lumen, tür ortalamasının **üstünde** bir iş: koyu gece-indigo zemin, tek mum-amber vurgu,
Fraunces serif ayet + Figtree sans arayüz, tam-kanama A5 ayet arkaplanları. Bu; Calm /
YouVersion sınıfı, düşünülmüş bir devotional uygulaması gibi duruyor — jenerik "AI slop"
değil. Ancak iki **bitmemişlik sinyali** bütün izlenimi aşağı çekiyordu (ikisi de bu
turda düzeltildi), ve birkaç orta-seviye craft açığı kaldı.

**AI-slop testi (product):** "AI mı yaptı" değil, "kategorinin en iyi araçlarına alışkın
biri her bileşende duraksar mı" testi. Kırık ikonlar + dama-tahtası kutuları buradaydı —
kullanıcıyı *her ekranda* duraksatan bitmemişlik. Onlar gidince uygulama "crafted"
okunuyor. Kalan sinyal: jenerik "avatar-daire + başlık + altyazı" liste satırları.

---

## Tasarım Sağlık Skoru (Nielsen 10 · product lens)

| # | Sezgisel (heuristic) | Skor | Ana bulgu |
|---|----------------------|------|-----------|
| 1 | Sistem durumunun görünürlüğü | 3 | Seri, ilerleme noktaları, PLUS rozetleri var; liste yüklemede skeleton yok |
| 2 | Sistem ↔ gerçek dünya eşleşmesi | 2 | **Ayetler İngilizce, arayüz Türkçe** — dil karışımı en görünür uyumsuzluk |
| 3 | Kullanıcı kontrolü ve özgürlüğü | 3 | Kapat/geri/duraklat var (ikonlar düzelince) |
| 4 | Tutarlılık ve standartlar | 3 | Amber vurgu tutarlı; ama 2 ayrı birincil-buton biçimi (pill "Aç" vs. daire oynatıcı) |
| 5 | Hata önleme | 3 | Yıkıcı aksiyon az; günlük/paywall güvenli |
| 6 | Hatırlama yerine tanıma | 3 | Kategori tile'ları + etiketler iyi; tile sanatı fazla küçük |
| 7 | Esneklik ve verimlilik | 3 | Sekmeler, hızlı aksiyonlar |
| 8 | Estetik ve minimalizm | 4 | Uygulamanın en güçlü yanı — sakin, odaklı, tek vurgu disiplini |
| 9 | Hatadan kurtulma | 3 | n/a ağırlıklı |
| 10 | Yardım ve dokümantasyon | 3 | Onboarding mevcut |
| **Toplam** | | **30/40** | **İyi — birkaç hedefli düzeltmeyle "çok iyi"** |

---

## Öncelik sıralı bulgular

### P0 — Bitmemişlik sinyalleri (bu turda DÜZELTİLDİ)
1. **Tüm ikonlar boş render oluyordu** (çıplak altın oynatma butonu, boş ritüel/kütüphane
   ikonları, chevron/kapat). Kök neden: `Ionicons.font` kök layout'ta preload
   edilmiyordu. → `...Ionicons.font` eklendi.
2. **"Şeffaf" spot sanatlar dama-tahtası kutusu gösteriyordu** (A11 tile'ları, A12 filiz,
   A14 etching, A6/A7/A9/A15). Opak PNG'lere dama gömülüydü. → gri arka plan gerçek alfaya
   keylendi, yumuşak kenarlar korundu.

### P1 — Craft açıkları (bu turda ele alınıyor / önerilen)
3. **Ayet/arayüz dil uyumsuzluğu** (heuristic #2). Türkçe arayüzde İngilizce ayet, en çok
   göze batan tutarsızlık. *Öneri:* ayet metinlerini de i18n'e almak (TR çeviri havuzu),
   ya da en azından referansları yerelleştirmek. (İçerik işi — ayrı faz.)
4. **Dua kategori tile'larında illüstrasyon çok küçük** (52px), geniş tile içinde yüzüyor;
   bol ölü alan. → tile sanatı büyütülüp kompozisyon sıkılaştırıldı (bu commit).
5. **Kütüphane liste satırları jenerik** ("avatar-daire + başlık + altyazı" — product-slop
   refleksi). *Öneri:* daire yerine kategori-renk aksanı veya A11 küçük görseli; süre/tür
   meta'sını daha net hiyerarşi. (İsteğe bağlı — standart ve işlevsel, düşük öncelik.)

### P2 — İnce ayarlar
6. **Bugün başlığındaki koyu blob** (seri göstergesi arkasında) niyetsiz duruyor; ya
   belirginleştir ya kaldır.
7. **İki birincil-buton biçimi** (pill vs. daire). Tek bir birincil-aksiyon dili seç.
8. **Muted metin kontrastı**: yeşilimsi-gri alt metinlerin koyu zeminde ≥4.5:1 tuttuğunu
   doğrula ("Her mevsim için rehberli dualar" gibi).

---

## Güçlü yanlar (koru)
- **Vurgu disiplini:** ekran başına tek amber odak — product register'ın "restrained"
  zemininde örnek.
- **Tam-kanama A5 ayet arkaplanları** temaya göre seçiliyor; duygusal isabet yüksek.
- **Serif ayet / sans arayüz** kontrast ekseninde doğru eşleşme (benzer iki font değil).
- **Koyu, sakin, nefes alan yerleşim** — meditasyon/dua bağlamına oturuyor.

## Provokatif sorular
- Ayet İngilizce kalacaksa bu bir ürün kararı mı, eksik mi? Karar verilip tutarlı uygulanmalı.
- Kütüphane satırları ve tile'lar aynı kategori-görsel dilini paylaşabilir mi (tek sistem)?
- "Aç" ve oynatıcı butonu tek bir birincil-aksiyon biçiminde birleşmeli mi?

---

## Ek: "Ben" (Profil) ekranı — amatörlük analizi

**Kanıt:** cihaz ekran görüntüsü + `app/(tabs)/profile.tsx`. Uygulamanın en zayıf
yüzeyi; Bugün/İncil craft'ının (tam-kanama ayet kartı, disiplinli tek-vurgu) hiçbiri
burada yok — "ayarlar çöplüğü" gibi kurulmuş.

### Bug kaynaklı (eksik ikonlar — düzeltildi)
En görünür amatör sinyal, ekrandaki **tüm ikonların boş render edilmesiydi**
(istatistik alev/kupa/takvim, Plus yıldızı, chevron'lar). Kök neden ilk sanıldığı gibi
sadece `Ionicons.font` preload eksikliği değil: uygulama **New Architecture** (`newArchEnabled: true`)
üzerinde ve release build'de `@expo/vector-icons` glyph fontu JS tarafı async yüklemeyle
güvenilmez şekilde geliyordu. Kalıcı çözüm: **`expo-font` config plugin'i ile Ionicons.ttf'yi
(ve gövde fontlarını) native olarak gömmek** — glyph'ler artık async yüklemeden ve New Arch
davranışından bağımsız, anında hazır. Plus kartındaki "metin sağa kaymış, solda boşluk"
görüntüsü de buydu (ikon gelmeyince `gap` yeri boş kalıyordu).

### Kalıcı craft açıkları
| # | Bulgu | Neden amatör | Durum |
|---|-------|--------------|-------|
| 1 | Üç "1"lik hero-metrik kutusu (seri/en iyi/toplam) | impeccable'ın yasakladığı "hero-metric template"; yeni kullanıcıda üçü de 1 → bomboş | Backlog — veri zenginleşince kabul edilebilir; boş-durum tasarımı önerilir |
| 2 | Başlık sadece "Umut", alt-metin/bağlam yok | Üst kısım çıplak/bitmemiş | Backlog |
| 3 | Dil pill'leri 3-3-1 sarıyor, "Deutsch" öksüz | Dağınık chip bulutu | Kısmen düzeltildi (chip kontrastı — grup artık kohezyonlu okunur) |
| 4 | Seçili-olmayan pill kenarları görünmez | Yarım görünüm | **Düzeltildi** — `surface` dolgu eklendi |
| 5 | Üç ayrı "kap" dili (bordürlü kart vs kapsız pill) | Ayar ekranı tutarsızlığı | Backlog |
| 6 | Plus kartı `goldSoft` çamurlu zeytin dolgu | Ucuz duruyor, chip diliyle karışıyor | **Düzeltildi** — temiz `surface` + altın kenar + yıldız |
| 7 | Gevşek/düzensiz dikey ritim | Kademe kurulmamış | Backlog |

**Öncelik:** #1 (üç "1") ve #2 (çıplak başlık) kalan en görünür açıklar; bir sonraki
"Ben" polish turunda ele alınmalı.
