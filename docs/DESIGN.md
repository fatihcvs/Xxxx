# Fameworld — Tasarım Belgesi (Klasik Parite Sürümü)

> **Hedef:** İlk etapta Popmundo'nun ekran yapısını, sayfa düzenini, navigasyonunu ve
> oynanış akışlarını **birebir yapısal parite** ile yeniden inşa etmek. Oyunun adı
> **Fameworld** kalır. Mekanikler, ekran organizasyonu, panel dizilimi ve akışlar
> aynı; **logo, görseller, ikonlar, açıklama metinleri ve veri içerikleri özgün
> olarak yeniden üretilir** (telifli varlık kopyalanmaz). Tam klon hissi hedeflenir;
> sonraki etaplarda özgünleştirerek ayrışılır.
>
> Bu belge, oynanan gerçek sayfalardan (46 kayıtlı sayfa: karakter/şehir/mekân/
> sanatçı/dükkân/rehber/sosyal) çıkarılan yapı envanterine dayanır.

---

## 1. Global Sayfa İskeleti

Her oyun sayfası aynı iskeleti kullanır:

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER: [Logo]        [Oyun günü + saat]  [Enerji]  [Zil]   │
│ ANA MENÜ (yatay, 9 öğe):                                     │
│  Şehir | Mekân | Karakter | Sanatçı | Şirket | Rehber |      │
│  Sıralamalar | Sosyal | Dükkân                               │
│ BİLDİRİM SATIRI: aksiyon geri bildirimi / "yeni bilgi yok"   │
├───────────────────────────────────────────┬──────────────────┤
│ İÇERİK KOLONU (geniş, ~%72)               │ BAĞLAM MENÜSÜ    │
│  H1 sayfa başlığı                         │ (dar, ~%28)      │
│  [Üstbilgi bloğu — sayfa tipine göre]     │  Gruplu link     │
│  H2 panel + açıklama paragrafı + tablo    │  listeleri; grup │
│  H2 panel + ...                           │  başlığı + linkler│
├───────────────────────────────────────────┴──────────────────┤
│ FOOTER: dil seçici, kurallar, yardım                         │
└──────────────────────────────────────────────────────────────┘
```

Temel kurallar:
- **Sabit genişlikte, ortalanmış** klasik sayfa (~980–1000px); mobilde tek kolona düşer,
  bağlam menüsü içeriğin altına iner.
- **Her aksiyon tam sayfa yenilemesiyle** sonuçlanır ve sayfanın en üstünde tek satır
  **geri bildirim mesajı** gösterilir (ör. mekâna yürüme, satın alma sonucu).
- **Kimlik numaraları görünürdür**: karakter, mekân, sanatçı sayfalarında adın yanında
  küçük gri ID rozeti bulunur.
- **Bağlam menüsü** (sağ kolon) bulunulan bölüme aittir ve sayfalar arasında sabittir:
  Karakter bölümündeyken karakter menüsü, Sanatçı bölümündeyken sanatçı menüsü görünür.
- VIP'e özel menü öğeleri **yıldız (★) işareti** ile işaretlenir.

## 2. Görsel Dil (özgün üretim, aynı his)

- **Tipografi:** `"Lucida Grande", Verdana, sans-serif`; gövde 11–12px, yoğun ve
  metin ağırlıklı. Başlıklar (h1/h2) koyu, küçük; süsleme yok.
- **Palet:** beyaz zemin; açık gri panel/kutu zeminleri (`#eee` bandı); koyu metin
  (`#111`); **mavi linkler** (`#09639a` / hover `#0078a3`); **sarı vurgu** (`#fc0`,
  seçim/uyarı rozetleri); **turuncu ikaz** (`#f58400`); kırmızı yalnızca hata.
- **Kutu (panel):** başlık `h2`, hemen altında 1–3 cümlelik **açıklayıcı paragraf**
  (oyun dünyasını anlatan "flavor" metni — özgün yazılır), sonra veri tablosu ya da
  form. Paneller arasında 15px boşluk.
- **Veri tabloları (`table.data`):** çizgisiz, sıkışık, tam genişlik; başlık satırı
  gri; satırlarda değer + **sıfat etiketi** çifti (ör. "93 — mükemmel", "35 — vasat").
  Sıralanabilir kolonlar.
- **Seviye ifadesi:** sayı (0–100) + Türkçe sıfat skalası. Skala (özgün):
  0 berbat · 10 çok kötü · 20 kötü · 30 ortalama altı · 40 vasat · 50 ortalama ·
  60 idare eder · 70 iyi · 73+ şahane · 80 çok iyi · 90 harikulade · 100 mükemmel.
- **Yetenek yıldızları:** 0–5 yıldız görseli + 0–100 iç puan; listelerde `(****)` gibi
  kompakt gösterim.
- **Avatar/portre:** karakter üstbilgi bloğunda dikdörtgen portre alanı (katmanlı
  portre sistemi gelene dek mevcut baş harf avatarı bu çerçevede kullanılır).
- **İkonografi:** küçük, tek renk/duotone ikonlar (meter yanları, menü işaretleri,
  başarı rozetleri). Tümü özgün çizim/emoji geçici.

## 3. Paylaşılan Bileşenler

- **B1. Header durum bloğu:** oyun içi gün adı + saat ("Perşembe 11:36" biçimi),
  enerji sayısı, bildirim zili; tıklanınca bildirim listesi.
- **B2. Ana menü:** 9 sabit öğe (bkz. iskelet). Aktif bölüm koyu.
- **B3. Geri bildirim satırı:** son aksiyonun tek satır sonucu; yoksa
  "Görüntülenecek yeni bilgi yok." kalıbı.
- **B4. Karakter üstbilgi bloğu** (karakter bölümü sayfalarının tepesinde):
  portre; ad + ID; yaş cümlesi; grup üyeliği cümlesi (linkli); konum cümlesi
  ("X şehrinde, Y adlı mekânda", linkli); boş zaman/kariyer odağı cümlesi;
  kişilik/itibar etiketleri; **dört gösterge**: ruh hâli, sağlık, enerji, nakit;
  hızlı linkler: Geliştir · Odaklar · Ayarlar.
- **B5. Sanatçı üstbilgi bloğu:** sanatçı adı + ID, klasman cümlesi (ün kademesi),
  tür + tür sıralaması ("Rock #1509"), kasa, kontrat durumu, üye sayısı.
- **B6. Mekân üstbilgi bloğu:** mekân adı + ID, tür açıklama paragrafı,
  "Temel bilgiler" tablosu (tür, şehir, bölge, idare, kalite+durum sıfatı, nakit).
- **B7. Bağlam menüsü grubu:** gri grup başlığı + link listesi; VIP öğeleri ★.
- **B8. Sayfalama + arama formu** (listeler: mekân ara, karakter ara, şarkı piyasası).
- **B9. Takvim tablosu:** gün no, tarih, hafta günü, tatil/etkinlik kolonu.

## 4. Bölüm ve Sayfa Envanteri (birebir yapı)

### 4.A Ana Sayfa (giriş sonrası)
Paneller: "Hoş Geldin {ad}!" özet; **Camia Haberleri** (oyun duyuruları);
**Son Yenilikler** (changelog özeti); **N'aber?** (arkadaş akışı);
**Sosyal** (öne çıkanlar); **Faydalı Özellikler** (kısayollar).

### 4.B Şehir (`/city`)
- **Şehir ana sayfası:** karşılama + nüfus cümlesi; **"Şehir 101"** önemli mekân
  dizini (Havaalanı, Hastane, Belediye Binası, Adliye, Şehir Dışı Otoyol, Kayıp
  Eşya Bürosu, İbadet Evi, Spor Salonu, Otel — her biri linkli); **önümüzdeki
  günler** takvim tablosu (tatil/etkinlik işaretli); **Vali diyor ki** (başkan
  mesajı); **şehir makaleleri** (basın); **şehir piyangosu** sonuçları;
  **gelecek konserler** listesi (sanatçı, tarih-saat, mekân, satılan bilet);
  **Şehir Seç** listesi (çok sayıda gerçek şehir); "Şehrin En İyileri" linki.
- **Mekânlar sayfası:** mekân arama formu (ad/tür), mekân listesi, şehir seçici.
- **Şehir takvimi** (tam ay görünümü) ve **şehir bilgi/istatistik** sayfası.

### 4.C Mekân (`/locale/[id]`)
- Üstte **geliş cümlesi** (geri bildirim satırı: "... adlı mekâna yürüdünüz").
- Mekân üstbilgi bloğu (B6) + **Yönetimin notu** paneli (yönetici mesajı).
- Mekâna özel **eylem panelleri** (türe göre): dükkânda **Reyonlar** + "Alışverişe
  çık"; belediyede **Resepsiyonistle Konuş / Vatandaşlık / Memleket Değişimi**;
  otel, hastane, stüdyo, kulüp vb. kendi eylem setleri.
- **Yer bağlam menüsü:** Genel Bilgi · Çalışanlar · Eşyalar · Etkinlikler ·
  Mekânda Bulunan Karakterler · Yönetim.
- Mekân türleri (hedef set): kulüp/konser salonu, stadyum, plak şirketi, stüdyo,
  radyo, üniversite, hastane, belediye binası, adliye, hapishane, ibadet evi,
  havaalanı, otoyol, otel, restoran, bar, dükkân (giyim/müzik/genel), spor salonu,
  kayıp eşya bürosu, apartman, park, banka.

### 4.D Karakter (`/character`) — bağlam menüsü 5 grup

**Grup: Karakter**
1. **Genel Bilgiler** — üstbilgi bloğu; oyun/puan/aktif gün/durum kutusu;
   **Son Günlük Kayıtları** (otomatik günlük özetleri); **Yakın Takip** (son 5
   mekân, zaman damgalı); **Göze Çarpan Kıyafetler ve Dövmeler** paneli.
2. **Başarılar** — kazanılan başarı rozetleri ızgarası; "ilk üç"ü seçme/unutma.
3. **Günlük** — otomatik + elle günlük kayıtları; günlüğü yönlendirme formu.
4. **Blog** — karakter blogu (yazı listesi + yazma).
5. **Geçmiş ve Diğer Bilgiler** — biyografi, karakter bilgileri, kişisel bilgiler,
   dünya görüşü panelleri.
6. **Aile** — aile ağacı (en yakın aile + filtreli tam ağaç ★).
7. **İlişkiler** — ilişki listesi (tür + seviye), sayfalı.
8. **Beden ve Sağlık** — **Özellikler** tablosu (8 özellik: Çekicilik, Dış Görünüş,
   Ses, Müzik Yeteneği, Zekâ, Bünye, Güç, Ustalık — değer + sıfat); **Ruh Hali**
   ve **Sağlık** göstergeleri (sayı + açıklama paragrafı); **Hastalıklar ve Özel
   Durumlar**; **Bağımlılıklar**; **Ameliyatlar** (geçmiş listesi); **Dövmeler**;
   **Bağışıklıklar ve Aşılar**.
9. **Oyuncu Bilgileri** — hesabın (kuklacının) profili.

**Grup: Kariyer ve Aktivite**
10. **Odaklar** — boş zaman uğraşı seçimi + kariyer odağı seçimi (radyo listeleri).
11. **Karakteri Geliştir (DP)** — haftalık deneyim puanı; özellik başına DP maliyeti
    tablosu; **Yetenekleri geliştir** (seçim listesi + DP harca); şarkı geliştirme;
    tarif keşfi ★; son DP harcamaları listesi.
12. **Davetiyeler ve İstekler** — bekleyen davet/istek listesi.
13. **Yetenekler** — kategori gruplu yetenek tablosu (yetenek adı + 0–100 seviye +
    yıldız); gizli yetenek sayısı notu; "gizlileri göster" anahtarı.
14. **Şarkılar** — bestelenen şarkılar listesi; **Müzik Bestelemek** paneli;
    eski şarkıları arşivleme; yeni şarkı notu.
15. **Uçuşlar** — gelecek uçuş listesi / "ayarlanmış uçuş yok"; uçuş ayarlama.
16. **Etkinlikler** — gelecek + geçmiş etkinlik listesi.
17. **Görevler** — aktif görev zinciri, görev geçmişi.
18. **Partiler** — parti düzenleme/katılım.
19. **Aktiviteler** — mekân aktiviteleri (spor, ibadet vb. zamanlı uğraşlar).
20. **İstihdam** — iş listesi, maaş, işten ayrılma.
21. **Öğrencilikler** — usta/çırak: mevcut öğrenciler, başvurular, kendi durumun.
22. **Kişilik ve Davranış** — tavır seçimi; tur öncelikleri; otel davranışları;
    groupie/hayran politikası.
23. **Tarifler** — bilinen tarifler (crafting).

**Grup: Varlıklar**
24. **Eşyalar** — envanter tablosu (giyilenler ayrı); yük (ağırlık) göstergesi;
    seçilenleri bırak/at; özel eylemler.
25. **Barınma ve Erişim Şifreleri** — konut listesi; kapı şifreleri.
26. **Ekonomi** — nakit cümlesi; **Faturalar** paneli; **Banka Hesapları ve
    Krediler** paneli.
27. **Araçlar** — kişisel araç listesi; araçla seyahat.
28. **Şirket Hisseleri** — hisse portföyü; pasif hisseler; ticaret lisansı.

**Grup: Ticaret**
29. **Alışveriş Yardımcısı** — tüm dükkânlarda ürün arama (ad/tür/şehir filtre).
30. **Hediyeler ve Teklifler** — teklif edilen eşyalar (gelen/giden), kart teklifleri.

**Grup: Ekstralar**
31. **Ayarlar ve İzinler** — varsayılan izinler (kim ne yapabilir).
32. **Kredi Ürünleri** — kredi bakiyesi, VIP/kredi harcama seçenekleri.
33. Adres Defteri ★ · Takvim ★ · Notlar ★ · Yer İmleri ★ · Portre ·
    Davetli Karakterler · Kısayollar ★ · VIP İstatistikleri ★ · Sohbetler.

### 4.E Sanatçı (`/artist`) — bağlam menüsü 6 grup

**Grup: Sanatçı**
1. **Genel Bilgiler** — sanatçı üstbilgi bloğu (B5); **Sanatçı Hareketliliği**
   (haber akışı); **Hayranlara Mesaj**; **Üyeler** listesi (rol + katılım tarihi).
2. **Program** (haftalık plan) · 3. **Yer Ayırtma Yardımcısı** ·
4. **Sanatçı Anlık Sohbeti** · 5. **Günlük** · 6. **Ziyaretçi Defteri** ★ ·
7. **Repertuvar** (şarkı + prova durumu) · 8. **Kayıt Kontratı** (plak şirketi
   sözleşmesi) · 9. **Popülerlik** (şehir şehir hayran/ün dökümü) ·
10. **Televizyon Programları** · 11. **Sıralama Ayrıntıları** ★ ·
12. **Ziyaret Edilen Şehirler** · 13. **Oyuncu Yarışmaları** ·
14. **Kayıt Kontratı Teklif Et**.

**Grup: Konserler** — Performans Planı Düzenleyici · Gelecek Konserler ·
Son Konserler · **Konser Ayarla** (mekân + tarih + bilet) · Davetler ·
Davetiye Gönder.

**Grup: Yapımlar** — Kayıtlı Şarkılar · **Diskografi** (single/albüm + satışlar) ·
**Klipler** · Kayıt Kutlama Partileri.

**Grup: Rodiler (Tur)** — Sahne Ekipmanı · Tur Aracı · Tur Öncelikleri ·
Ekstra Hizmet · Şahsi Eşyalar · Ekip.

**Grup: Üyelere Özel** — Üyeler (rol/pay yönetimi) · Nakit Parayı Yönet · Adaylar.

**Grup: Şarkı Piyasası** — Mevcut Teklifler · Piyasaya Göz At · Alımlar.

### 4.F Şirket (`/company`)
Şirket sayfası: üstbilgi (ad + ID), **Temel bilgiler**, **Yönetimin Notu**,
çalışanlar/reyonlar/ürünler; "Şirket seç" listesi; vali talepleri; mekân haberleri.

### 4.G Rehber (`/guide`)
Oyun rehberi ana sayfası + konu başlıklı rehber menüsü; mevcut rehberler listesi.

### 4.H Sıralamalar (`/rankings`)
"Önemli şeyler" + liste kataloğu: şarkı/albüm listeleri, sanatçı sıralamaları,
şehir en iyileri, zenginler, yetenek liderleri vb.

### 4.I Sosyal (`/social`)
Öne Çıkan Sosyal Kulüp; **The Insider'dan Makaleler** (oyun içi basın);
Global yarışmalar; "gelecek hafta" ajandası; haftalık görevler (tur numaralı).

### 4.J Dükkân (`/shop`)
**VIP Üyelik** (avantaj listesi + satın alma); **Krediler** (paket satışı);
kredi ürünleri: Özel İkramlar, Ek Oyun İçeriği, Yardımcılar, Mükemmel Bölümler.

### 4.K Hesap (`/account`)
Hesap Ayrıntıları: kişisel bilgi, e-posta, konuşulan diller, hesap menüsü.

## 5. Davranış Kalıpları

- **Açıklama paragrafı zorunlu:** her panelin altında/üstünde dünyayı anlatan 1–3
  cümlelik özgün metin (Popmundo'nun "her ekran öğretir" hissi).
- **Zaman:** oyun günü adı + saat her sayfada; takvimler oyun günü numarası + gerçek
  tarih çifti gösterir.
- **Seviyeler asla çıplak sayı değil:** sayı + sıfat etiketi birlikte.
- **Her varlık linklidir:** karakter adı, mekân adı, sanatçı adı, şehir adı geçen
  her yerde ilgili sayfaya link.
- **Feedback-first:** aksiyonlar sayfanın tepesindeki tek satırla sonuç bildirir.
- **VIP ayrımı:** VIP özellikleri menüde ★ ile görünür ama kilitli sayfa açıklama +
  Dükkân linki gösterir.

## 6. Responsive & Erişilebilirlik

- Masaüstü birincil (sabit ~1000px, iki kolon). Mobil: tek kolon; ana menü yatay
  kaydırmalı şerit; bağlam menüsü içerik altına akordeon olarak iner.
- Tablolar mobilde yatay kaydırma. Kontrast WCAG AA; linkler her zaman ayırt
  edilebilir mavi; `prefers-reduced-motion` desteklenir (animasyon zaten minimal).

## 7. Yerelleştirme

TR birincil, EN eşlik eder (`next-intl`). Tüm panel açıklama metinleri iki dilde
özgün yazılır. Sıfat skalası iki dilde tanımlanır.

## 8. Uygulama Notları

- Bu belge **görsel/yapısal sözleşmedir**; sistemlerin hangi sırayla derinleşeceği
  `docs/POPMUNDO_PARITY_ROADMAP.md`'de fazlanmıştır.
- Mevcut Next.js sayfaları yeni iskelete taşınır (route'lar korunur, layout değişir);
  yeni sayfalar envanterdeki ada ve panel dizilimine birebir uyar.
- Tailwind token'ları bu belgeye göre güncellenir: `font-sans` → Lucida Grande
  yığını; `brand` → klasik link mavisi; panel/kutu sınıfları `box`/`data` kalıbına.
