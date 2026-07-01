# Fameworld — Popmundo Tam Parite Yol Haritası (A→Z)

> **Amaç:** Popmundo'nun **tüm** oyun sistemlerini (mekanik ve akış düzeyinde)
> Fameworld'de yeniden inşa etmek. Bu belge, Popmundo'daki her sistemi listeler,
> **mevcut durumu** (✅ yapıldı / 🟡 kısmi / ◻︎ eksik) işaretler ve kalan işi
> **fazlara** böler.
>
> **Özgünlük:** Yalnızca mekanikler/akışlar klonlanır (fikirler telif dışıdır).
> Hiçbir metin/logo/görsel/veri tablosu birebir kopyalanmaz; isim havuzları,
> şarkı başlıkları vb. özgün üretilir; şarkı sözü hiç üretilmez.

---

## 0. Mevcut Durum (Faz 0–7 TAMAMLANDI ve prod'a alındı)
Gerçek zamanlı simülasyon (1 yıl = 56 gün), pnpm monorepo (web/worker/db/engine/i18n),
Next.js + Postgres + Prisma + Auth.js + next-intl (TR/EN) + BullMQ worker.

Çalışan çekirdek: kayıt/giriş, **karakter oluşturma (ad/soyad seçmeli + cinsiyet + doğum şehri)**,
8 attribute + XP, mood/health/energy (gerçek zaman decay), hastane kuralı, şehir/mekan
gezinme, dinlen/ye, **iş + Cuma maaşı**, **kitap→zamanlı öğrenme + üniversite kursu**,
kira, **grup + şarkı bestele + prova + konser + ün**, **CD kayıt + haftalık satış + charts + telif**,
**ilişkiler + mesaj + çocuk + yaşlanma→ölüm→varis**, **gayrimenkul + işletme + seçim/başkan + vergi + VIP**,
**çoklu şehir + prosedürel NPC dünya**, admin paneli, /api/health, avatar, mobil menü.

---

## 1. POPMUNDO SİSTEMLERİ — PARİTE MATRİSİ

### A. Karakter & Yaşam Döngüsü
- 🟡 Attribute'lar (Popmundo: Charisma, Looks, Intelligence, Constitution… + türev). Bizde 8 attribute var; **isim/etki eşlemesi** derinleşmeli.
- ✅ Mood & Health ölçerleri, hastane (<%15).
- ✅ Energy / aksiyon enerjisi.
- ◻︎ **Açlık/Susuzluk** ihtiyacı (ye/iç bunları besler; şu an sadece meter).
- ✅ Yaş, doğum, ölüm, **varis** ile devam.
- ◻︎ **Kişilik özellikleri** (personality traits) ve bunların etkileri.
- 🟡 **Görünüm/portre sistemi** (bizde baş harfli avatar; Popmundo: katmanlı portre + kıyafet etkisi).
- ◻︎ Uyku/dinlenme döngüsü, sağlık durumu bozulmaları (hastalık).

### B. Yetenekler & Eğitim (Popmundo: 19 kategori)
Kategoriler: **Music, Musical Instrument, Music Genre, Stage & Performance, Social,
Sexual, Criminal, Police, Medicine, Sports, Business, Spiritual, Artistic, Science,
Firemen, Nature & Resources, Paranormal Sciences, Crafting, Miscellaneous.**
- 🟡 Yetenek modeli var ama **5-yıldız (0–5) + Basic→ileri kademe** ağaçları eksik.
- 🟡 Kitaptan **zamanlı öğrenme** + üniversite kursu var.
- ◻︎ **Usta/Mentor** (master) ile öğrenme.
- ◻︎ **Üniversite dereceleri**, sınavlar, diplomalar.
- ◻︎ Tam **skill kataloğu** (yüzlerce yetenek, kademeli önkoşullar).

### C. Müzik Kariyeri (oyunun kalbi)
- ◻︎ **Tür + 2 sahne rolü** seçimi (primary %80 / secondary %20).
- ◻︎ **Enstrüman/rol hiyerarşisi** ve **4-yıldız geçiş kapısı** (ör. Basic String → Electric Guitar).
- ◻︎ **17 tür** (African, Blues, Classical, Country & Western, Electronica, Flamenco, Heavy Metal, Hip Hop, Jazz, Latin, Modern Rock, Pop, Punk Rock, Reggae, Rhythm & Blues, Rock, World).
- 🟡 Şarkı **bestele**; ◻︎ **söz kalitesi ağırlığı**, ◻︎ **jam/prova yüzdesi genre skill'e bağlı** (0 skill→%50, 5 yıldız→%100).
- ✅ Repertuar, ✅ konser; ◻︎ **setlist/sahne olayları/showmanship** derinliği.
- 🟡 Kayıt (single/album); ◻︎ **müzik klibi**, ◻︎ **yayın takvimi** (single+klip /28 gün, album /112 gün) ve **gecikince fame düşüşü**.
- 🟡 Charts (global+şehir); ◻︎ **ulusal + tür bazlı** listeler, ◻︎ **radyo çalma**.
- ◻︎ **Şehir bazlı fan tabanı**, ◻︎ **groupie'ler**, ◻︎ **turne**.
- ◻︎ **Plak şirketi sözleşmeleri** (label ↔ band kontratları, avans, telif oranı).
- ✅ Grup üyeleri/rol/pay; ◻︎ band sohbeti, band fame ayrıntısı.

### D. Ün & Medya
- 🟡 Star value / fame (temel). ◻︎ **Star value'nun groupie/klip/konser başarısına etkisi**.
- ◻︎ **PR yöneticisi** + **Media Manipulation** yeteneği etkileri.
- ◻︎ **Gazete/basın**, röportajlar, dedikodu.
- ◻︎ **Ödül törenleri** (yıllık müzik ödülleri).
- ◻︎ **Fan kulübü**, fan postası.
- ◻︎ **Başarımlar/kupalar (achievements)** sistemi.

### E. Ekonomi
- ✅ Mekanlarda iş + **Cuma maaşı**.
- 🟡 İşletme (VIP mantığı yok, **çalışan/ürün yok**). ◻︎ Şirket sayfaları, çalışan alma, ücret, ürün/stok.
- ✅ Apartman kira/satın alma; ◻︎ **ev/mülk piyasası** (al-sat, fiyat dalgalanması), ◻︎ mülk türleri.
- ◻︎ **Banka**: hesap, **kredi**, faiz, havale.
- ◻︎ **Borsa/yatırım** (varsa).
- 🟡 Alışveriş (sadece kitap). ◻︎ **Mağazalar + eşya çeşitliliği + envanter**.
- ✅ Vergi (şehir vergisi işletme kârına).

### F. Sosyal & Topluluk
- ✅ Adres defteri + ilişki seviyeleri; 🟡 **izin sistemi** (kim ne yapabilir).
- 🟡 Arkadaş/partner; ◻︎ **flört → evlilik → boşanma** akışı.
- ✅ Çocuk + varis; 🟡 **hamilelik zaman çizelgesi**, ◻︎ **aile ağacı UI**.
- ✅ Mesajlaşma; ◻︎ **forumlar**, ◻︎ **topluluk sayfaları**, ◻︎ **blog/günlük (diary)**.
- ◻︎ **Gruplar/organizasyonlar** (fan kulüpleri, dernekler).
- 🟡 Sosyalleş; ◻︎ **hediyeler**, ◻︎ farklı etkileşim türleri (öv, hakaret, flört…).

### G. Şehirler & Dünya
- 🟡 4 kurgusal şehir. ◻︎ **Çok sayıda gerçek şehir** + ülkeler.
- ◻︎ **Şehirler arası seyahat** (uçuş, süre, ücret, bagaj/enerji).
- ✅ Mekan seti; ◻︎ **daha çok mekan türü** (stüdyo, radyo istasyonu, havaalanı, banka, mahkeme, hapishane, kilise…).
- ◻︎ **Zaman dilimleri**, yerel müzik sahnesi/kültür.
- 🟡 Politika: ✅ seçim/başkan/vergi; ◻︎ **belediye meclisi**, ◻︎ **yasalar/kararnameler**, ◻︎ **suç şiddet ayarları** başkan tarafından.

### H. Suç & Hukuk
- ◻︎ **Suçlar** (şiddet 1–10): hırsızlık, gasp, dolandırıcılık, çeteler.
- ◻︎ **Polis kariyeri**: devriye, tutuklama.
- ◻︎ **Tutuklama → mahkeme → hapis**, kefalet, ceza süresi.
- ◻︎ Suç yetenekleri (Criminal) ve Police yetenek ağaçları.

### I. Sağlık & Yaşam Kalitesi
- 🟡 Ye/iç (mood/health). ◻︎ **Açlık meter**, ◻︎ yiyecek/içecek çeşitliliği + etkileri.
- ◻︎ **Uyuşturucu/bağımlılık**, ◻︎ **hastalık** (bulaşma, tedavi).
- ◻︎ **Tıp kariyeri** (Medicine): doktor, hastanede tedavi hizmeti.

### J. Diğer Kariyerler & Yetenek Ağaçları
- ◻︎ **Spor** (Sports), ◻︎ **Bilim** (Science), ◻︎ **İtfaiye** (Firemen),
  ◻︎ **Doğa/Kaynaklar** (Nature & Resources), ◻︎ **Paranormal**, ◻︎ **El sanatları** (Crafting),
  ◻︎ **Ruhani/Din** (Spiritual): kilise, rahip, inanç.

### K. Öğeler & Envanter
- 🟡 Kitap. ◻︎ **Kıyafet** (looks etkisi), ◻︎ **enstrüman** (çalmak için gerekli), ◻︎ yiyecek/içecek,
  ◻︎ **araç/taşıt**, ◻︎ hediyeler, ◻︎ tüketilebilirler, ◻︎ **crafting ile üretim**.

### L. Sistem & Meta
- 🟡 VIP (temel: hızlı öğrenme + rozet). ◻︎ **VIP perk seti** (şirket kurma, ekstra slotlar, otomatikler).
- ◻︎ **Başarımlar** her sistemde.
- ◻︎ **Bildirim/olay akışı** (event feed).
- ✅ Admin paneli (temel), ✅ i18n TR/EN, 🟡 responsive.
- ◻︎ **Moderasyon araçları**, kurallar, raporlama.

---

## 2. FAZLI UYGULAMA PLANI (Faz 8+ → tam parite)

Sıra bağımlılık + değer önceliğine göre. Her faz: şema + engine + worker + UI + i18n + test + commit.

### Faz 8 — Müzik Derinleştirme (öncelik #1, oyunun kalbi)
- **Tür + 2 sahne rolü** (primary %80 / secondary %20) seçimi; karaktere/banda bağla.
- **Enstrüman & rol hiyerarşisi** + **4-yıldız geçiş kapısı** (Basic → ileri).
- **17 tür** + genre skill'leri; **jam/prova yüzdesi = genre skill** (%50–%100).
- **Söz kalitesi** bestede ağırlıklı; showmanship sahne performansına etki.
- **Müzik klibi** + **yayın takvimi** (single/28g, album/112g) + **gecikince fame decay**.
- **Radyo çalma** + **tür/ulusal charts** + **şehir bazlı fan tabanı**.
- **Groupie'ler** (star value'ya bağlı), **turne** iskeleti.
- Model: `StageRole`, `Genre`(17), `CharacterStageRole`, `GenreSkill`, `MusicVideo`, `FanBaseCity`, `Groupie`, `Tour`.

### Faz 9 — Yetenek Ağaçları & Eğitim (tam katalog)
- **19 kategori** + **5-yıldız (0–5)** model + **Basic→ileri önkoşullar**.
- Büyük **skill kataloğu** (seed), kademeli öğrenme süreleri.
- **Usta/Mentor** sistemi (yüksek seviyeli karakterden öğren, karşılıklı).
- **Üniversite dereceleri** + sınav + diploma; kitap çeşitliliği.
- Model: `Skill`(tier, prereq, category), `Mentorship`, `Degree`, `Enrollment`.

### Faz 10 — Ün, Medya & Başarımlar
- **PR yöneticisi** + Media Manipulation etkileri; **gazete/basın** + röportaj.
- **Ödül törenleri** (yıllık), **fan kulübü** + fan postası.
- **Başarımlar/kupalar** motoru (tüm sistemlere kanca).
- Model: `NewsArticle`, `Award`, `AwardShow`, `FanClub`, `Achievement`, `CharacterAchievement`.

### Faz 11 — Ekonomi Derinleştirme
- **Şirketler**: çalışan alma, ücret, ürün/stok, gelir; VIP ile kurma.
- **Mülk piyasası**: ev/mülk türleri, al-sat, fiyat dalgalanması.
- **Banka**: hesap, **kredi + faiz**, havale.
- **Mağaza + eşya çeşitliliği + envanter** genişletme.
- Model: `Company`, `Employment`(genişlet), `Product`, `PropertyListing`, `BankAccount`, `Loan`, `Item`, `Inventory`.

### Faz 12 — Sosyal & Aile Derinleştirme
- **Flört → evlilik → boşanma**; **hamilelik zaman çizelgesi**; **aile ağacı UI**.
- **İlişki izin sistemi**; farklı etkileşimler (öv/flört/hakaret), **hediyeler**.
- **Gruplar/organizasyonlar**, **topluluk sayfaları**, **blog/günlük**, **forum**.
- Model: `Marriage`, `Pregnancy`, `Organization`, `Membership`, `BlogPost`, `ForumThread`, `Gift`.

### Faz 13 — Dünya & Seyahat
- **Çok sayıda gerçek şehir** + ülkeler + zaman dilimleri.
- **Şehirler arası seyahat** (uçuş: süre + ücret + enerji).
- **Yeni mekan türleri** (stüdyo, radyo, havaalanı, banka, mahkeme, hapishane, kilise).
- **Belediye meclisi + yasalar + suç şiddet ayarları**.
- Model: `Flight/Trip`, `LocaleType`(genişlet), `Law`, `CouncilSeat`.

### Faz 14 — Suç & Hukuk
- **Suç aksiyonları** (şiddet 1–10), çeteler; **polis kariyeri** (devriye/tutuklama).
- **Mahkeme → hapis → kefalet/ceza**; Criminal & Police yetenek ağaçları.
- Model: `Crime`, `CrimeReport`, `Arrest`, `Trial`, `PrisonTerm`, `Gang`.

### Faz 15 — Sağlık & Yaşam
- **Açlık meter** + yiyecek/içecek çeşitliliği; **uyuşturucu/bağımlılık**; **hastalık**.
- **Tıp kariyeri** (doktor, tedavi hizmeti), hastane derinleştirme.
- Model: `Consumable`, `Addiction`, `Disease`, `Treatment`.

### Faz 16 — Diğer Kariyerler
- **Spor, Bilim, İtfaiye, Doğa/Kaynaklar, Paranormal, Crafting, Ruhani/Din** yetenek ağaçları + kariyer döngüleri.
- **Din**: kilise mekanı, rahip rolü, inanç mekaniği.
- Model: kategori bazlı iş/aktivite tanımları + `Religion/Faith`.

### Faz 17 — Öğeler, Görünüm & Crafting
- **Kıyafet** (looks etkisi), **enstrüman gerekliliği** (çalmak için), **araçlar**, **crafting üretim zinciri**.
- **Katmanlı portre/avatar** sistemi (özgün varlıklar).
- Model: `ItemType`(genişlet), `CraftingRecipe`, `Vehicle`, `Outfit`, `Portrait`.

### Faz 18 — Meta, Denge & Cila
- **Başarımlar** tüm sistemlerde; **bildirim/olay akışı**; **VIP perk seti**.
- Denge ayarı (ekonomi/ün/öğrenme eğrileri), performans, **daha çok dil**, erişilebilirlik, moderasyon.

---

## 3. Çalışma Biçimi
- Her faz kendi içinde bağımsız, oynanabilir bir dikey dilim olarak biter; `main` + feature branch'e push edilir; prod'da migration + gerekirse seed çalıştırılır.
- `docs/DESIGN.md` her yeni ekran için güncellenir.
- Testler (Vitest engine + uçtan uca doğrulama scriptleri) her fazda korunur.

> **Not:** Popmundo 20 yıllık bir oyun; "her şey" çok büyük bir yüzey. Bu yol haritası
> tam pariteyi **8 ek faza** böler. Önerilen başlangıç: **Faz 8 (müzik derinleştirme)** —
> oyunun kalbi ve en yüksek oynanış değeri orada.
