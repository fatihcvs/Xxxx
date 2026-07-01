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

Faz 13 (çekirdek) de tamamlandı: **50 gerçek şehir + ülkeler + zaman dilimleri +
uçuşla şehirler arası seyahat + Dünya sayfası + klasik tasarım yenilemesi** (aşağıda).

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
- ✅ **Basın bülteni + Media Manipulation etkisi** (skill ün artışını 1→5 kat büyütür, 14 oyun günü cooldown); ◻︎ ayrı PR yöneticisi rolü.
- ✅ **Gazete** ("Günlük Sahne"): seçim, chart lideri, ünlü ölümü, ödüller, basın bültenleri; ◻︎ röportaj/dedikodu.
- ✅ **Ödül törenleri** (yıllık: Yılın Grubu/Albümü/Şarkısı/Sanatçısı + ün/star bonusu).
- ◻︎ **Fan kulübü**, fan postası.
- ✅ **Başarımlar/kupalar**: 18 başarımlık katalog + idempotent motor; iş/müzik/medya/dünya/politika/yaşam/öğrenme/ekonomi kancaları.

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
- ✅ **50 gerçek şehir + 39 ülke** (koordinat + IANA zaman dilimi + nüfus bazlı reach; TR: İstanbul/Ankara/İzmir/Antalya).
- ✅ **Şehirler arası seyahat**: uçuş — mesafeden ücret + gerçek-zaman süre + enerji; varış okuma anında veya heartbeat ile işlenir.
- ✅ Mekan seti + **havaalanı**; ◻︎ daha çok mekan türü (stüdyo, banka, mahkeme, hapishane, kilise…).
- ✅ **Zaman dilimleri** (şehir sayfası + Dünya sayfasında yerel saat); ◻︎ yerel müzik sahnesi/kültür.
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
- ✅ **Başarımlar** (18 başarım, tüm ana sistemlere kanca); ◻︎ katalog genişletme.
- ◻︎ **Bildirim/olay akışı** (event feed).
- ✅ Admin paneli (temel), ✅ i18n TR/EN, 🟡 responsive.
- ◻︎ **Moderasyon araçları**, kurallar, raporlama.

---

## 2. FAZLI UYGULAMA PLANI (Faz 8+ → tam parite)

Sıra bağımlılık + değer önceliğine göre. Her faz: şema + engine + worker + UI + i18n + test + commit.

### ✅ Faz 8 — Müzik Derinleştirme (TAMAMLANDI)
Tamamlanan: 17 tür; tür + 2 sahne rolü (%80/%20) + konser rol faktörü; genre-bağlı
jam tavanı (%50–100); müzik klibi (satış/ün etkisi); yayın takvimi → fame decay;
şehir bazlı fan tabanı. Kalan (sonraki müzik alt-fazı): enstrüman 4-yıldız kapısı
derinliği, radyo, turne, plak sözleşmeleri.

Orijinal plan:
- **Tür + 2 sahne rolü** (primary %80 / secondary %20) seçimi; karaktere/banda bağla.
- **Enstrüman & rol hiyerarşisi** + **4-yıldız geçiş kapısı** (Basic → ileri).
- **17 tür** + genre skill'leri; **jam/prova yüzdesi = genre skill** (%50–%100).
- **Söz kalitesi** bestede ağırlıklı; showmanship sahne performansına etki.
- **Müzik klibi** + **yayın takvimi** (single/28g, album/112g) + **gecikince fame decay**.
- **Radyo çalma** + **tür/ulusal charts** + **şehir bazlı fan tabanı**.
- **Groupie'ler** (star value'ya bağlı), **turne** iskeleti.
- Model: `StageRole`, `Genre`(17), `CharacterStageRole`, `GenreSkill`, `MusicVideo`, `FanBaseCity`, `Groupie`, `Tour`.

### ✅ Faz 9 — Yetenek Ağaçları & Eğitim (TAMAMLANDI)
Tamamlanan: 19 kategoriye yayılmış geniş skill kataloğu; 5-yıldız + Basic→ileri
**önkoşul** zorlaması (prereq 4★); **usta/mentor**tan hızlı öğrenme; Skills katalog
sayfası (ağaç + kilit + şehirdeki ustalar). Kalan: üniversite dereceleri/sınav/diploma.

Orijinal plan:
- **19 kategori** + **5-yıldız (0–5)** model + **Basic→ileri önkoşullar**.
- Büyük **skill kataloğu** (seed), kademeli öğrenme süreleri.
- **Usta/Mentor** sistemi (yüksek seviyeli karakterden öğren, karşılıklı).
- **Üniversite dereceleri** + sınav + diploma; kitap çeşitliliği.
- Model: `Skill`(tier, prereq, category), `Mentorship`, `Degree`, `Enrollment`.

### 🟡 Faz 10 — Ün, Medya & Başarımlar (ÇEKİRDEK TAMAMLANDI)
Tamamlanan: **başarım motoru** (18 başarım; iş, grup, şarkı, konser, kayıt, klip,
chart 1 numarası, uçuş/jetsetter, başkanlık, çocuk, mülk/işletme, §10k, 5★ yetenek,
5 çalışma, PR, ödül kancaları); **gazete** ("Günlük Sahne": seçim, chart lideri,
ünlü ölüm ilanı, ödüller, basın bültenleri; şehir + dünya masası); **basın bülteni**
aksiyonu (Media Manipulation etkili, cooldown'lu); **yıllık ödül töreni** (4 kategori,
kazananlara ün/star bonusu + haber + başarım). Model: `NewsArticle`, `Award`,
`AwardShow`, `Achievement`, `CharacterAchievement`.
Kalan: **fan kulübü + fan postası**, röportaj/dedikodu, ayrı PR yöneticisi rolü.

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

### 🟡 Faz 13 — Dünya & Seyahat (ÇEKİRDEK TAMAMLANDI)
Tamamlanan: **50 gerçek şehir + 39 ülke** (koordinat, zaman dilimi, reach) + eski
kurgusal şehirlerin gerçek şehirlere göçü; **uçuşla seyahat** (mesafe→ücret+süre+enerji,
uçuş sırasında aksiyon kilidi, varış read/heartbeat ile); **havaalanı** mekan türü;
**Dünya sayfası** (bayrak + yerel saat + sakinler + uçuş bilgisi); klasik sayfa-tabanlı
**tasarım yenilemesi** (parşömen/serif/zebra tablo).
Kalan:
- **Yeni mekan türleri** (stüdyo, banka, mahkeme, hapishane, kilise).
- **Belediye meclisi + yasalar + suç şiddet ayarları**.
- Model: `Law`, `CouncilSeat`.

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
