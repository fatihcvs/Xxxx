# Fameworld — Popmundo Tam Parite Yol Haritası (A→Z, Birebir Klon Etabı)

> **Güncel hedef (kullanıcı kararı):** İlk etapta oyun **ismi hariç** Popmundo ile
> **birebir aynı** olacak — ekran yapısı, sayfa düzeni, navigasyon, akışlar ve
> mekanikler dahil. Görsel dil aynı hissi verir; **logo/görsel/metin/veri içerikleri
> telif gereği özgün yeniden üretilir** (yapı ve düzen birebir, varlıklar özgün).
> Tam klon tamamlandıktan sonra özgünleştirme etabı başlar.
>
> Yapı envanteri kaynağı: oynanan gerçek oyundan kaydedilmiş **46 sayfa**
> (karakter bölümünün ~30 alt sayfası, şehir, mekânlar, sanatçı, dükkân, rehber,
> sosyal, hesap). Ayrıntılı ekran/panel dökümü: `docs/DESIGN.md`.

---

## 0. Mevcut Durum

**Mekanik çekirdek (Faz 0–10) tamamlandı** (0–9 prod'da, Faz 10 deploy bekliyor):
gerçek zamanlı simülasyon (1 yıl = 56 gün), pnpm monorepo (web/worker/db/engine/i18n),
Next.js + Postgres + Prisma + Auth.js + next-intl (TR/EN) + BullMQ worker.
Kayıt/giriş, karakter oluşturma, 8 özellik + XP, mood/health/energy, hastane,
şehir/mekân gezinme, iş + Cuma maaşı, zamanlı öğrenme + üniversite + usta/mentor +
skill ağaçları (19 kategori), kira, grup + beste + prova + konser + ün, CD kayıt +
haftalık satış + charts + telif + klip + yayın tazeliği/fame decay + şehir fan
tabanı, ilişkiler + mesaj + çocuk + yaşlanma→ölüm→varis, gayrimenkul + işletme +
seçim/vali + vergi + VIP, çoklu şehir + NPC dünya, admin, PR ajanı + röportaj +
dedikodu + yıllık ödüller + fan kulübü + başarımlar (16 kupa).

**Eksik olan:** klasik Popmundo arayüz iskeleti ve sayfa envanterinin tamamı.
Mevcut UI modern/sade bir düzen kullanıyor; birebir klon hedefi için aşağıdaki
**U-fazları** (UI + eksik sistemler birlikte, dikey dilimler) uygulanacak.

---

## 1. U-FAZLARI — Birebir Klon Planı

Her U-fazı: şema + engine + worker + UI (klasik iskelette) + i18n (TR/EN) + test +
commit. Sıra, oyuncunun her gün dokunduğu yüzeyden dışarı doğru genişler.

### ✅ Faz U0 — Klasik Arayüz Kabuğu (TAMAMLANDI)
- Sabit genişlik (~1000px) ortalanmış düzen; **iki kolon**: geniş içerik + sağda
  **bağlam menüsü** (bölüme göre gruplu link listeleri, VIP öğeleri ★).
- **Header:** logo; **oyun günü adı + saat**; enerji göstergesi; bildirim zili.
- **Ana menü (9 öğe):** Şehir · Mekân · Karakter · Sanatçı · Şirket · Rehber ·
  Sıralamalar · Sosyal · Dükkân.
- **Geri bildirim satırı** (her aksiyonun tek satır sonucu) + "yeni bilgi yok" kalıbı.
- Tipografi/palet: Lucida Grande/Verdana ~12px; beyaz zemin, gri kutular, mavi
  linkler, sarı/turuncu vurgular. `table.data` yoğun tablo bileşeni; **sayı + sıfat**
  seviye etiketleri; görünür ID rozetleri.
- Mevcut tüm sayfalar bu kabuğa taşınır (route'lar korunur).
- Karakter/sanatçı/mekân **üstbilgi blokları** (DESIGN.md B4–B6).

### ✅ Faz U1 — Karakter Bölümü (TAMAMLANDI — ilk dilim)
Tamamlanan: bağlam menüsü 5 grup/31 sayfa; **Günlük** (otomatik kayıt motoru:
beste/konser/kayıt/röportaj) + Genel Bilgiler'de son kayıtlar + **Yakın Takip**
(son 5 mekân); **Beden ve Sağlık** tam panel seti (özellik tablosu sayı+sıfat,
ruh hâli/sağlık, hastalık/bağımlılık/ameliyat/dövme/bağışıklık boş durumları);
**Karakteri Geliştir** (Pazar DP dağıtımı + özellik/yetenek harcama);
**Odaklar**; **Kişilik** (tavır); **Ekonomi** (nakit + faturalar + **banka**:
yatır/çek + haftalık faiz); **Aile**, **Geçmiş** (bio formu), **Oyuncu
Bilgileri**, **Eşyalar**, **Barınma** + 12 iskelet sayfa (Blog, Davetiyeler,
Uçuşlar, Etkinlikler, Görevler, Partiler, Aktiviteler, Tarifler, Araçlar,
Hisseler, Alışveriş Yardımcısı, Hediyeler). Kalan: iskeletlerin sistemleri
(ilgili U-fazlarında dolar).

Orijinal plan (Faz U1 — Karakter Bölümü, 5 menü grubu, ~33 sayfa):
- **Karakter:** Genel Bilgiler (günlük özetleri + Yakın Takip + kıyafet/dövme
  paneli), Başarılar (mevcut + "ilk üç seçimi"), **Günlük** (otomatik kayıt motoru:
  her önemli olay günlüğe yazar), **Blog**, Geçmiş ve Diğer Bilgiler (biyografi),
  Aile (ağaç UI), İlişkiler, **Beden ve Sağlık** (özellik tablosu + ruh
  hâli/sağlık + hastalık/bağımlılık/ameliyat/dövme/bağışıklık panelleri —
  şimdilik boş durumlar dahil), Oyuncu Bilgileri.
- **Kariyer ve Aktivite:** **Odaklar** (boş zaman + kariyer odağı; pasif etkiler),
  **Karakteri Geliştir** (haftalık **DP** sistemi: Pazar dağıtımı, özellik/yetenek
  geliştirme maliyetleri), Davetiyeler ve İstekler, Yetenekler (kategori gruplu
  0–100 + yıldız; gizli yetenek), **Şarkılar** (kişisel beste havuzu; gruba sunma),
  Uçuşlar (iskelet), Etkinlikler, Görevler (iskelet), Partiler (iskelet),
  Aktiviteler (spor salonu vb. mekân aktiviteleri), İstihdam, Öğrencilikler
  (mevcut mentor sistemine sayfa), Kişilik ve Davranış (tavır + tur öncelikleri +
  otel + groupie politikası), Tarifler (iskelet).
- **Varlıklar:** Eşyalar (envanter + yük), Barınma ve Erişim Şifreleri, Ekonomi
  (nakit + **faturalar** + banka hesapları/krediler), Araçlar (iskelet), Şirket
  Hisseleri (iskelet).
- **Ticaret:** Alışveriş Yardımcısı (ürün arama), Hediyeler ve Teklifler.
- **Ekstralar:** Ayarlar ve İzinler, Kredi Ürünleri, Adres Defteri ★, Takvim ★,
  Notlar ★, Portre, Kısayollar ★.
- Model: `DiaryEntry`, `BlogPost`, `CharacterFocus`, `DevelopmentPoint`,
  `Invitation`, `Item`+`Inventory`, `BankAccount`, `Loan`, `Bill`, `GiftOffer`,
  `PermissionSet`, `Note`, `Bookmark`.

### ✅ Faz U2 — Şehir & Mekân Bölümü (TAMAMLANDI)
Tamamlanan: **Şehir sayfası** (`/city`, `/city/[id]`) — nüfus, **Şehir 101**
dizini (havaalanı, hastane, belediye, adliye, otoyol, kayıp eşya, ibadet evi,
spor salonu, otel, banka — linkli), **önümüzdeki 7 gün** takvimi (sabit tatil
seti), **Vali diyor ki** (vali mesajı düzenleme), şehir makaleleri (basın
entegre), **piyango** (haftalık 5/20 çekiliş + bilet + worker çözümü), son
konserler, **37 şehirlik** seçici. **Mekânlar** arama sayfası (`/venues`, ad/tür
filtre). **Mekân sayfası** yeniden: Temel bilgiler (tür/şehir/bölge/idare/kalite
+sıfat/nakit) + Yönetim notu + türe özel eylemler (havaalanı **uçuş**, spor
salonu **antrenman**, ibadet evi, otel **gece**, banka gişesi). **30+ gerçek
şehir** + ülkeler + saat dilimleri + bölgeler; **11 yeni mekân türü**. Worker'a
haftalık piyango çekilişi. `travelAction` artık mekân sayfasına yönlendiriyor;
tüm oyun sayfaları `force-dynamic`. Kalan (sonraki alt-fazlar): mahkeme/hapishane
döngüleri (U5), otel konaklama derinliği, radyo.

Orijinal plan (Faz U2 — Şehir & Mekân Bölümü):
- **Şehir ana sayfası:** nüfus; **Şehir 101** dizini (havaalanı, hastane, belediye,
  adliye, otoyol, kayıp eşya, ibadet evi, spor salonu, otel); **önümüzdeki günler**
  takvimi (tatil/etkinlik); **Vali diyor ki**; şehir makaleleri (basın entegre);
  **şehir piyangosu**; **gelecek konserler** (bilet satışıyla); şehir seçici.
- **Mekânlar sayfası:** arama + tür filtresi + liste.
- **Mekân sayfası:** üstbilgi (tür/şehir/bölge/idare/kalite+durum/nakit),
  **Yönetimin notu**, türe özel eylem panelleri, **Yer menüsü** (Genel Bilgi,
  Çalışanlar, Eşyalar, Etkinlikler, Mekândaki Karakterler, Yönetim).
- **Yeni mekân türleri:** adliye, hapishane, ibadet evi, havaalanı, otoyol, otel,
  spor salonu, kayıp eşya bürosu, banka, giyim/müzik dükkânı, stüdyo.
- **Şehir genişletme:** gerçek şehir seti (30+; Amsterdam'dan Manila'ya), ülke +
  saat dilimi; **bölgeler** (mekânların semti).
- Model: `District`, `CityEvent`, `Lottery`, `LocaleStaff`, `LocaleNote`,
  LocaleType genişletmesi.

### Faz U3 — Sanatçı Bölümü (6 menü grubu)
- **Sanatçı:** Genel Bilgiler (klasman + tür sıralaması + kasa + hareketlilik
  akışı + hayran mesajı + üyeler), Program, Yer Ayırtma Yardımcısı, Günlük,
  Repertuvar (prova durumu), **Kayıt Kontratı** (plak şirketi sözleşmeleri),
  **Popülerlik** (şehir şehir hayran dökümü — mevcut FanBase üstüne UI),
  Televizyon Programları (iskelet), Ziyaret Edilen Şehirler.
- **Konserler:** Performans Planı Düzenleyici (setlist), Gelecek/Son Konserler,
  Konser Ayarla (ileri tarihli planlama + bilet ön satışı), Davetler.
- **Yapımlar:** Kayıtlı Şarkılar, Diskografi, Klipler, Kayıt Partileri.
- **Rodiler/Tur:** sahne ekipmanı, tur aracı, tur öncelikleri, ekip.
- **Üyelere Özel:** üye/rol/pay yönetimi, **Nakit Parayı Yönet** (grup kasası),
  Adaylar (başvuru sistemi).
- **Şarkı Piyasası:** beste alım-satımı (teklifler, piyasa, alımlar).
- Model: `RecordContract`, `Setlist`, `ScheduledConcert` (ön satış), `BandVault`,
  `BandCandidate`, `SongListing`, `Tour`, `StageEquipment`.

### Faz U4 — Şirket, Sıralamalar, Sosyal, Rehber, Dükkân, Hesap
- **Şirket:** şirket sayfası (temel bilgiler + yönetim notu + çalışanlar/reyonlar/
  ürünler), şirket kurma (VIP), vali talepleri, mekân haberleri.
- **Sıralamalar:** liste kataloğu — şarkı/albüm, sanatçı, şehir en iyileri,
  zenginler, yetenek liderleri (mevcut charts genişler).
- **Sosyal:** sosyal kulüpler (organizasyonlar), **The Insider** makale akışı
  (mevcut basın motoru genişler), global yarışmalar, haftalık görev turları.
- **Rehber:** oyun rehberi içerik sistemi (konu başlıklı özgün rehber sayfaları).
- **Dükkân:** VIP üyelik sayfası (avantaj listesi), kredi paketleri, kredi
  ürünleri (ikramlar, ek içerik, yardımcılar).
- **Hesap:** hesap ayrıntıları (kişisel bilgi, e-posta, diller).
- Model: `Organization`, `GuideArticle`, `CreditProduct`, `Contest`, `TaskRound`.

### Faz U5 — Suç, Sağlık, Din, Diğer Kariyerler (derin sistemler)
- **Suç & Hukuk:** suç aksiyonları (şiddet 1–10), polis kariyeri, tutuklama →
  adliye → hapishane; kayıp eşya bürosu döngüsü.
- **Sağlık derinliği:** hastalıklar (bulaşma/tedavi), bağımlılıklar, ameliyatlar
  (kozmetik dahil — Beden ve Sağlık sayfası dolar), aşılar/bağışıklıklar;
  tıp kariyeri.
- **Din/ibadet evi**, itfaiye, bilim, spor kariyer döngüleri; dövme sistemi.
- Model: `Crime`, `Arrest`, `Trial`, `PrisonTerm`, `Disease`, `Addiction`,
  `Surgery`, `Tattoo`, `Vaccination`.

### Faz U6 — Cila & Denge (klon etabının sonu)
- Katmanlı **portre** sistemi (özgün varlıklar), kıyafetlerin görünüme etkisi.
- Ekonomi/ün/öğrenme eğrilerinin Popmundo ritmine kalibrasyonu (haftalık DP,
  Cuma maaş, Pazar puan, 28/112 gün yayın ritmi zaten uyumlu).
- Bildirim sistemi (zil), anlık sohbet iskeleti, moderasyon araçları.
- **Bundan sonrası:** özgünleştirme etabı (kullanıcıyla birlikte ayrışma kararları).

---

## 2. MEKANİK PARİTE MATRİSİ (denetim listesi)

Aşağıdaki matris U-fazlarına dağıtılmış eksiklerin sistem bazlı özetidir
(✅ yapıldı / 🟡 kısmi / ◻︎ eksik):

### A. Karakter & Yaşam Döngüsü
- ✅ 8 özellik + XP; ✅ ruh hâli/sağlık/enerji + hastane; ✅ yaş/ölüm/varis.
- ◻︎ Açlık/susuzluk; ◻︎ kişilik özellikleri (tavır) etkileri (U1);
  🟡 portre (U6); ◻︎ hastalık/bağımlılık/ameliyat (U5); ◻︎ günlük/blog (U1);
  ◻︎ odaklar + DP (U1).

### B. Yetenekler & Eğitim
- ✅ 19 kategori katalog + 5★ + önkoşul + kitap + kurs + usta/mentor.
- ◻︎ Üniversite dereceleri/sınav/diploma; ◻︎ DP ile geliştirme (U1);
  ◻︎ gizli yetenek (U1).

### C. Müzik Kariyeri
- ✅ Tür + 2 sahne rolü (80/20), 17 tür, jam tavanı, konser, kayıt, klip, satış,
  charts, telif, fame decay, şehir fan tabanı.
- ◻︎ Kişisel şarkı havuzu + şarkı piyasası (U1/U3); ◻︎ setlist/performans planı
  (U3); ◻︎ ileri tarihli konser + bilet ön satışı (U3); ◻︎ kayıt kontratı (U3);
  ◻︎ turne/rodiler (U3); ◻︎ TV programları (U3); ◻︎ radyo (U3);
  ◻︎ tür bazlı sıralama ("Rock #1509") (U3).

### D. Ün & Medya
- ✅ PR ajanı + röportaj + dedikodu + yıllık ödüller + fan kulübü + başarımlar.
- ◻︎ The Insider makale akışı + şehir makaleleri (U2/U4); ◻︎ hayranlara mesaj
  (U3); ◻︎ sanatçı hareketlilik akışı (U3); ◻︎ groupie politikası (U1).

### E. Ekonomi
- ✅ İş/maaş, kira, mülk, işletme, vergi, VIP.
- ◻︎ Banka hesabı + kredi + faturalar (U1); ◻︎ envanter/eşya + dükkân reyonları +
  alışveriş yardımcısı (U1/U2); ◻︎ şirket çalışanları/ürünleri + hisseler (U4);
  ◻︎ araçlar (U1); ◻︎ şehir piyangosu (U2).

### F. Sosyal & Topluluk
- ✅ İlişkiler, mesajlaşma, çocuk/varis; 🟡 izinler (U1'de tam).
- ◻︎ Flört→evlilik→boşanma akışı (U1); ◻︎ aile ağacı UI (U1); ◻︎ partiler +
  davetiyeler (U1); ◻︎ organizasyonlar/sosyal kulüpler (U4); ◻︎ günlük/blog/
  ziyaretçi defteri (U1/U3); ◻︎ hediye/teklif sistemi (U1).

### G. Şehirler & Dünya
- ✅ Çoklu şehir + NPC dünya + seçim/vali/vergi.
- ◻︎ 30+ gerçek şehir + bölgeler + saat dilimi (U2); ◻︎ uçuşlar + havaalanı +
  otoyol (U1/U2); ◻︎ şehir takvimi/etkinlikler + tatiller (U2); ◻︎ vali talepleri
  + vali mesajı (U2); ◻︎ otel sistemi (U2).

### H. Suç & Hukuk — ◻︎ tamamı (U5).
### I. Sağlık derinliği — ◻︎ hastalık/bağımlılık/ameliyat/aşı (U5).
### J. Diğer kariyerler — ◻︎ polis/tıp/din/itfaiye/bilim/spor (U5).
### K. Öğeler & Envanter — ◻︎ eşya/kıyafet/enstrüman sahipliği/araç/tarif (U1→U6).
### L. Sistem & Meta — 🟡 VIP perk seti (U4); ◻︎ bildirim zili (U6); ◻︎ kredi
ürünleri (U4); ◻︎ rehber içeriği (U4); ✅ admin, i18n.

---

## 3. Tamamlanan Fazlar (tarihçe)

- ✅ **Faz 0–1:** MVP çekirdeği (altyapı + karakter/dünya döngüsü)
- ✅ **Faz 2:** zamanlı öğrenme + üniversite + haftalık ekonomi
- ✅ **Faz 3:** müzik kariyeri (grup, şarkı, prova, konser, ün)
- ✅ **Faz 4:** CD kayıt, satış simülasyonu, charts
- ✅ **Faz 5:** sosyal & aile (ilişki, mesaj, çocuk, ölüm→varis)
- ✅ **Faz 6:** gayrimenkul, işletme, şehir politikası, VIP
- ✅ **Faz 7:** çoklu şehir, NPC dünya, admin, dağıtım
- ✅ **Faz 8:** müzik derinleştirme (17 tür, sahne rolleri, jam tavanı, klip,
  yayın tazeliği, şehir fan tabanı)
- ✅ **Faz 9:** yetenek ağaçları (19 kategori, 5★, önkoşul, usta/mentor)
- ✅ **Faz 10:** ün & medya (PR ajanı, röportaj, dedikodu, yıllık ödüller,
  fan kulübü, başarımlar) — deploy bekliyor

## 4. Çalışma Biçimi

- Her faz bağımsız, oynanabilir dikey dilim; feature branch'e commit + push;
  prod'da migration + gerekirse seed.
- `docs/DESIGN.md` yapısal sözleşmedir; her yeni ekran envanterdeki panel
  dizilimine birebir uyar.
- Vitest engine testleri + tip kontrol + build her fazda zorunlu.
- **Özgünlük sınırı:** yapı/akış/mekanik birebir; logo, görsel, ikon, açıklama
  metinleri, şarkı/isim havuzları özgün. Şarkı sözü hiç üretilmez.
