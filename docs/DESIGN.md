# Fameworld — Tasarım Brief'i (Design System: FDS)

> **Tasarım aracı / tasarımcı için:** Bu dosya, Fameworld'ün **tüm ekranlarının,
> bileşenlerinin, durumlarının, animasyonlarının ve gereken görsel varlıklarının**
> tek referans kaynağıdır. Bir ekran veya bileşen tasarlamadan önce **önce bu
> dosyayı oku**; token'lara, bileşen listesine ve ilgili ekranın "Durumlar" +
> "Animasyonlar" + "Varlıklar" bölümlerine göre üret.
>
> **Özgünlük şartı (zorunlu):** Tüm isimler, logo, ikon, illüstrasyon, renk ve
> metinler **%100 özgün** olacak. Mevcut hiçbir oyunun görünümü, logosu, wordmark'ı,
> ekran görüntüsü, ikonu veya varlığı **kopyalanmayacak**. İlham yalnızca **tür ve
> yerleşim düzeni** seviyesinde alınır. Şarkılar yalnızca **başlık + sayısal kalite**
> ile temsil edilir; hiçbir yerde şarkı sözü/telifli metin bulunmaz.

Fameworld: gerçek zamanlı, müzik endüstrisi odaklı bir **yaşam-simülasyonu MMO**'su.
Arayüz **sayfa tabanlı "komuta merkezi"** düzenindedir: üstte kalıcı durum çubuğu,
solda navigasyon menüsü, ortada üst üste panel'ler. Hedef: yoğun bilgi, sakin görünüm,
ilk bakışta okunabilirlik.

---

## 1. Marka & Ton
- **Kişilik (Faz 13'ten itibaren):** klasik, sayfa-tabanlı tarayıcı oyunu estetiği —
  sıcak parşömen zemin, krem paneller, koyu serif panel başlıkları, yoğun/kompakt
  listeler. "Yaşayan eski dünya" hissi; içerik alanı sakin ve okunur.
- **Wordmark:** "Fameworld" — serif italik tipografik wordmark (özgün; hiçbir mevcut
  oyunun logosu/varlığı kopyalanmaz).
- **Ton (metin):** kısa, arkadaşça, ikinci tekil şahıs ("Karakterin hastanede…").

## 2. Tasarım Token'ları (Tailwind ile uygulanacak)
**Renk (klasik tema)**
- brand `#7d2f2f` (bordo), brandDark `#5f2424`
- ink (metin) `#33302a`; ink/60, ink/50 tonları ikincil metin
- soft (sayfa zemini) `#e9e4d3` (parşömen); panel `#faf7ec`; kenarlık (edge) `#c7bfa6`
- band (üst koyu şerit) `#2e2a24`; bandInk `#efe9d6`; altRow (zebra satır) `#f1ecdb`
- Ölçerler: mood/keyif `#c9a227` (hardal), health/sağlık `#a23434` (koyu kırmızı),
  energy/enerji `#4e7a3a` (zeytin yeşili)
- Durum: success `#16a34a`, danger `#dc2626`, warning `#d97706`, info `#2563eb`
- Para pozitif `#16a34a`, negatif `#dc2626`

**Tipografi:** gövde 13px Verdana/Tahoma (yoğun klasik his); panel başlıkları ve
karakter adı Georgia/serif (`font-display`). Küçük etiket 11px; rakamlar `tabular-nums`.

**Uzaklık/biçim:** taban birim 4px; panel iç boşluğu 12px; radius: kart/buton 2px
(keskin klasik köşe), pill/rozet 999px. Gölge: `0 1px 2px rgba(0,0,0,.06)` (panel).

**Breakpoint'ler:** mobil <768, tablet 768–1024, masaüstü >1024. İçerik max genişlik 1024px.
**z-index:** taban 0, sticky durum çubuğu 10, dropdown 20, modal 40, toast 50.

## 3. Global / Paylaşılan Bileşenler
Her biri light tema + hover/focus/disabled/loading durumlarıyla tasarlanacak.
1. **StatusBar (durum şeridi)** — karakter adı+yaş+konum (uçuştaysa "✈ {şehir} yolunda"),
   3 ölçer (keyif/sağlık/enerji), para (§), ün. Mobilde sarar (wrap).
2. **NavMenu (yatay sekme menü)** — üst satır: bölümler (Karakter/Kariyer/Sosyal/Dünya/Ekonomi),
   alt satır: aktif bölümün sayfaları; aktif öğe bordo. Mobilde hamburger → dikey liste.
   Menünün üstünde koyu **masthead** bandı: solda serif wordmark, sağda oyun tarihi.
3. **Panel** — `panel-header` (başlık + opsiyonel sağ aksiyon) + `panel-body`. Temel yapı taşı.
4. **Butonlar** — `btn` (primary mor), `btn-ghost` (kenarlıklı), tehlike varyantı (kırmızı metin).
   Durumlar: hover, active/press, disabled, loading (spinner + kilitli).
5. **Form alanları** — input, select, number, textarea; label + hata metni + yardım metni.
6. **Meter (ölçer çubuğu)** — ince, yuvarlatılmış, renk kodlu; yüzde etiketi.
7. **Yıldız derecelendirme** — attribute seviyesi (★, kısmi yıldız/tier gösterimi).
8. **XP çubuğu** — attribute ilerlemesi (mor dolum + "x/y XP").
9. **Liste/Tablo** — satır ayraçlı; sol içerik + sağ aksiyon/metrik deseni.
10. **Sekmeler (tabs)** — ileride profil/şehir alt bölümleri için.
11. **Modal/Diyalog** — onay + form modali (ör. konser kur, gruptan ayrıl onayı).
12. **Toast/Bildirim** — aksiyon geri bildirimi (kaydedildi, para yetersiz, tahliye).
13. **Avatar** — karakter görseli (bkz. §6 Avatar sistemi); boyutlar 24/40/96.
14. **Rozet/Etiket (badge)** — mekan türü, "Buradasın", "Sahipsin", "Hastanede".
15. **Empty state** — ikon + kısa açıklama + CTA (her liste için).
16. **Skeleton loader** — panel/list/statusbar için shimmer iskeletleri.

---

## 4. Ekran-Ekran Tasarım Listesi

Her ekran için: **Amaç · Route/dosya · Yerleşim · Bileşenler · Durumlar · Animasyonlar · Varlıklar**.
"✅" = kodlandı (mevcut), "◻︎" = sonraki fazlar.

### A. Kimlik / Onboarding
**A1. Giriş / Kayıt** ✅ — `app/[locale]/(auth)/login|register`
- Amaç: hesap oluştur / giriş. Ortalanmış tek kart.
- Bileşenler: logo + tagline, panel, email/parola alanları, primary buton, alt geçiş linki.
- Durumlar: boş, doğrulama hatası (kırmızı satır), gönderiliyor (buton loading), "e-posta zaten kayıtlı".
- Animasyon: kart giriş fade-slide; buton loading spinner; hata satırı shake (hafif).
- Varlıklar: logo, arka plan doku/gradyan (opsiyonel), müzik temalı hafif illüstrasyon.

**A2. Karakter Oluşturma** ✅ — `app/[locale]/create`
- Amaç: ad/soyad, cinsiyet, doğum şehri seç → 18 yaşında başla.
- Bileşenler: panel, ad/soyad ikili alan, cinsiyet select, şehir select, "Yaşamaya başla".
- İleride ◻︎: **görünüm seçici** (avatar: yüz/saç/ten/kıyafet) — bu ekran için avatar
  önizleme + kaydırıcılar/thumbnail'lar tasarlanacak.
- Durumlar: boş/doldurulmuş; gönderiliyor.
- Animasyon: adımlar arası geçiş (çok adımlı yapılırsa); avatar önizleme canlı güncelleme.
- Varlıklar: avatar parça setleri (§6).

### B. Ana Oyun İskeleti (her sayfada)
**B1. Masthead + yatay NavMenu + StatusBar + içerik** ✅ — `app/[locale]/(game)/layout.tsx`
- Yerleşim (Faz 13): koyu masthead (wordmark + tarih) → iki satırlı yatay sekme menü →
  durum şeridi → tek kolon içerik (max 1024px). Mobilde menü hamburger'a düşer.
- Animasyon: ölçerlerin değer değişiminde yumuşak dolum; para değişiminde count-up + renk flaş;
  sayfa geçişinde içerik alanı fade.
- **Hastane durumu:** karakter <%15 iken durum çubuğu "Hastanede" rozeti + kırmızı nabız (pulse);
  aksiyon butonları kilitli görünür.

### C. Karakter
**C1. Karakterim (Home)** ✅ — `(game)/home`
- Amaç: özet — doğum, yaş, konum, hızlı "Şehre git"; hastanede uyarı paneli.
- Durumlar: normal, hastanede (kırmızı bilgi paneli).
- Animasyon: kart giriş; hastane paneli nabız.
- Varlıklar: küçük durum ikonları (doğum, konum, yaş).

**C2. Özellikler & Yetenekler** ✅ — `(game)/attributes`
- Amaç: attribute'lar (yıldız + XP çubuğu), skill listesi, "Devam eden çalışmalar"
  (geri sayım), "Kitaplarım" (Çalış butonu).
- Durumlar: yetenek yok (empty), çalışma yok, kitap yok, çalışma devam ediyor (kilit + kalan süre),
  usta seviye (Mastered).
- Animasyon: **XP çubuğu dolum**; **seviye atlama** yıldız pop + kısa parıltı; çalışma tamamlanınca
  satır yeşil flaş; geri sayım canlı.
- Varlıklar: attribute ikonları (vokal, çekicilik, görünüm, zekâ, bünye, yaratıcılık, el becerisi,
  cazibe), kitap ikonu, saat/ilerleme ikonu.

### D. Dünya
**D1. Şehir / Harita** ✅ — `(game)/city`
- Amaç: şehirdeki mekanları listele; "Buraya git"; "Buradasın" rozeti.
- İleride ◻︎: **görsel harita** (mekan pin'leri, bölge renkleri — politika fazı için zone'lar).
- Durumlar: liste; mevcut konum vurgulu.
- Animasyon: "git" sonrası hedef satırı highlight; (harita) pin hover tooltip.
- Varlıklar: mekan türü ikonları (kulüp, plak şirketi, üniversite, hastane, mağaza, bar,
  restoran, apartman, stadyum, radyo, park), şehir illüstrasyonu/harita zemini.

**D2. Mekan (Venue) Detay** ✅ — `(game)/locale/[id]`
- Amaç: mekana özel aksiyonlar. Tür'e göre değişen bölümler:
  - Genel: **Dinlen**, (bar/restoran) **Yemek ye (§)**
  - İş listesi: başlık + maaş + **Başvur**
  - Mağaza: kitaplar + **Satın al** / "Sahipsin"
  - Üniversite: dersler + **Kaydol**
  - Apartman: **Kirala** / "Kiralıyorsun"
- Durumlar: burada değil (aksiyonlar kilitli + "şehre dön"), para yetersiz (buton disabled),
  hastanede (kilit).
- Animasyon: aksiyon sonrası toast + ilgili ölçer/para güncelleme animasyonu.
- Varlıklar: mekan başlık görseli (tür bazlı), aksiyon ikonları (dinlen, ye, iş, kitap, ders, anahtar/kira).

**D3. Dünya & Seyahat** ✅ — `(game)/world` (Faz 13)
- Amaç: 50 gerçek şehri listele (bayrak + ülke + yerel saat + sakin sayısı) ve uçuş sat.
- Bileşenler: klasik zebra tablo; satırda uçuş bilgisi "§fiyat · dk · -enerji"; **Buraya uç**
  butonu (para yetersiz / uçuştayken disabled); üstte uçuş-durumu paneli (varış saati).
- Durumlar: buradasın (yeşil etiket), uçuşta (banner + tüm butonlar kilitli), para yetersiz.
- Kurallar: fiyat/süre/enerji büyük daire mesafesinden türetilir (game-engine `travel.ts`);
  varış gerçek zamanda işlenir (sayfa okuması veya worker heartbeat'i sonlandırır).
- Varlıklar: bayraklar Unicode bölgesel gösterge (asset yok); uçak için "✈" glifi.

### E. Ekonomi & Kariyer
**E1. Kariyer** ✅ — `(game)/career` — işler + maaş + "Cuma ödeme" notu. Empty state.
**E2. Finans / Banka** ✅ — `(game)/finances` — bakiye + işlem defteri (renkli +/−).
- Animasyon: bakiye count-up; yeni işlem satırı slide-in.
- İleride ◻︎: grafik (haftalık gelir/gider), banka/kredi kartı görseli.

### F. Müzik Kariyeri
**F1. Grup (Band)** ✅ — `(game)/band`
- Amaç: grup yoksa **kur** (ad + tür); varsa: grup başlığı (ün, üyeler), **Repertuar**
  (şarkı: kalite + prova% + **Prova**), **Şarkı bestele**, **Konser ver** (mekan + bilet + **Sahne al**),
  **Son konserler**, **Gruptan ayrıl**.
- Durumlar: grup yok (kur formu), şarkı yok (empty), prova tam (disabled), konser koşulu yok,
  hastanede (kilit).
- Animasyon: **beste** sonrası yeni şarkı satırı pop; **prova** çubuğu dolum; **konser sonucu
  reveal** (katılım/eleştiri/gelir sayaç + yıldız/ün artışı vurgusu); ün çubuğu artışı.
- Varlıklar: enstrüman/sahne rolü ikonları, şarkı/plak ikonu, sahne/konser illüstrasyonu,
  tür rozetleri.

**F2. Kayıt & Charts** ◻︎ (Faz 4) — CD kayıt (single/albüm), satış, haftalık listeler, radyo, ödüller.
- Ekranlar: **Stüdyo/Kayıt** (tracklist seç, single/albüm), **Charts** (şehir/tür/global sıralama tablosu),
  **Ödüller** töreni. Animasyon: chart sıra değişim, satış count-up, ödül reveal.
- Varlıklar: CD/plak kapağı jeneratörü (özgün, otomatik), chart tablo ikonları, kupa/ödül ikonu.

### G. Sosyal & Aile ◻︎ (Faz 5)
**G1. Adres defteri / İlişkiler**, **G2. Mesajlaşma (kutu + konuşma)**, **G3. İlişki profili**
(flört/evlilik/çocuk), **G4. Aile ağacı**, **G5. Yaşam olayları** (doğum/ölüm/varis geçişi).
- Animasyon: mesaj balonu, ilişki seviyesi kalp/çubuk, aile ağacı düğüm bağlanma.
- Varlıklar: avatar (çok kullanımlı), ilişki/kalp ikonları, aile ağacı düğümleri.

### H. Gayrimenkul, İşletme & Politika ◻︎ (Faz 6)
**H1. Emlak** (satın al/kirala, mülk kartı), **H2. İşletme** (yönetim paneli), **H3. Politika**
(seçim, belediye, şehir bölgeleri harita katmanı), **H4. VIP**.
- Varlıklar: bina/mülk illüstrasyonları, harita bölge katmanı, oy/sandık ikonları, VIP rozeti.

### I. Ayarlar ✅/◻︎ — dil (TR/EN) değiştirici, hesap, tema; bildirim tercihleri.

### J. Sistem Ekranları
**J1. 404 / Bulunamadı** ✅, **J2. Hata (error boundary)** ◻︎, **J3. Yükleniyor (skeleton)** ◻︎,
**J4. Admin paneli** ◻︎ (world clock, seed, moderasyon).

---

## 5. Animasyon Kataloğu
Hepsi **hızlı, ince, bloklamayan**. Süre 150–300ms, easing `ease-out` (giriş) / `ease-in-out` (geçiş).
`prefers-reduced-motion` desteklenecek (animasyonlar kapanabilir).
- **Meter fill/drain** — genişlik geçişi 250ms.
- **XP bar fill** — 300ms; dolunca kısa parıltı.
- **Level-up** — yıldız "pop" (scale 1→1.3→1) + parıltı 400ms.
- **Money count-up** — rakam sayaç + yeşil/kırmızı renk flaş 300ms.
- **Concert result reveal** — metrikler sırayla sayaçla belirir; ün artışı vurgusu.
- **Page/panel transition** — fade + 4px slide-up 200ms.
- **Button hover/press** — renk/gölge 120ms; press scale 0.98.
- **Hospital/critical pulse** — durum çubuğunda kırmızı nabız 1.2s döngü.
- **Toast** — sağ-üstten slide-in + auto-dismiss; **Skeleton shimmer** — 1.2s döngü.

## 6. Görsel Varlık Listesi
- **Logo/wordmark** (özgün) + favicon + app ikonu.
- **İkon seti** (özgün, tutarlı çizgi stili): navigasyon (6), attribute (8), mekan türü (11),
  aksiyon (dinlen/ye/iş/kitap/ders/kira/bestele/prova/konser), ekonomi (para/maaş/kira/CD),
  sosyal (mesaj/kalp/aile), durum (hastane/uyarı/başarı).
- **Avatar sistemi (özgün):** katmanlı parça seti — yüz şekli, ten tonu, saç, göz, kıyafet,
  aksesuar; cinsiyet/yaş varyasyonu; 24/40/96 px. (Karakter oluşturma + profil + üye listeleri.)
- **İllüstrasyonlar:** giriş ekranı, boş durumlar (her liste için 1), sahne/konser sahnesi,
  şehir/harita zemini, mekan başlık görselleri (tür bazlı).
- **CD/plak kapağı jeneratörü** (Faz 4, özgün otomatik desenler).
- **Rozet/etiket** görselleri (mekan türü, durum).

## 7. Responsive Davranış
- **>1024:** üç bölge (durum çubuğu / sol menü / içerik), max 1024px içerik.
- **768–1024:** menü daralır (ikon+kısa etiket) veya üstte yatay şerit.
- **<768:** menü hamburger → drawer; durum çubuğu sarar veya "özet + genişlet"; paneller tam genişlik,
  tablolar kart görünümüne düşer; butonlar tam genişlik.

## 8. Erişilebilirlik
- WCAG **AA** kontrast (mor üstü beyaz, ink/60 minimum). Görünür **focus halkası**. Tam **klavye**
  gezinme. Form label + hata `aria` bağlantısı. Ölçerler için metinsel yüzde. `reduced-motion`.

## 9. Yerelleştirme (TR/EN)
- Tüm metin i18n anahtarlarından gelir (`packages/i18n/messages/{en,tr}.json`). Tasarımlarda
  **~%30 daha uzun** Türkçe metinlere yer bırak; sabit genişlikli buton/etiketlerden kaçın.
  Tarih/para biçimi locale duyarlı (§ para simgesi projeye özgü).

## 10. Teslim & Handoff
- **Token'lar** (renk/tipografi/uzaklık/radius/gölge) — `apps/web/tailwind.config.ts` +
  `globals.css` ile eşleşecek şekilde.
- **Bileşen kütüphanesi** — §3 listesi, tüm durumlarıyla; **Tailwind CSS + React** ile uygulanacak
  (mevcut sınıflar: `panel`, `panel-header/body`, `btn`, `btn-ghost`, `field`, `meter`).
- Ekran tasarımları §4'teki route'lara birebir eşlenecek; her ekranın durum ve animasyon
  notları uygulanacak.

---
**Not:** Bu belge yaşayan bir dokümandır; yeni faz/ekran eklendikçe §4 güncellenir. README bu dosyaya
referans verir.
