# Web Project Frontend 

Bu proje, kullanıcıların market ürünlerini kategori bazında görüntüleyip online sipariş verebileceği bir platform olarak tasarlanmıştır. 
Platform, kullanıcı dostu bir deneyim sağlamak için modern web teknolojileriyle geliştirilmiştir.

## 📁 İçerik

- [🚀 Özellikler](#-özellikler)
- [🔧 Kurulum](#-kurulum)
- [📖 Kullanım](#-kullanımı)
- [📂 Dosya Yapısı](#-dosya-yapısı)
- [📜 Lisans](#-lisans)

---

## 🚀 Özellikler

- Kullanıcı yönetimi (Kayıt, giriş ve çıkış)
- Ürün listeleme ve detayları
- Sepet yönetimi
- Ödeme yöntemleri ve işlemleri
- Favoriler ve sipariş geçmişi
- Kampanya detayları ve adres yönetimi

---

## 🔧 Kurulum

### Gereksinimler

- Node.js (>= 14.x)
- NPM veya Yarn paket yöneticisi

### Adımlar

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/gokaydervisoglu/web_frontend.git
   cd web_frontend
   ```
2. Bağımlılıkları yükleyin:
    ```bash
   npm install
   npm run build
   ```
3. Uygulamayı Başlatın:
    ```bash
   npm start
   ```
4. Uygulama, tarayıcınızda http://localhost:3000 adresinde çalışacaktır.

---

## 📖 Kullanımı

Uygulama aşağıdaki ana sayfalardan oluşmaktadır:

- Ana Sayfa: Kullanıcıların ürünleri görebileceği bir genel görünüm.
- Sepet: Kullanıcıların alışveriş sepetine eklediği ürünler.
- Favoriler: Kullanıcıların favori olarak işaretlediği ürünler.
- Siparişler: Geçmiş siparişlerin bir listesi.
- Giriş/Kayıt: Kullanıcıların oturum açması veya yeni bir hesap oluşturması için gerekli sayfalar.

---

## 📂 Dosya Yapısı
 ```bash
web_frontend/
├── public/                  # Statik dosyalar
├── src/
│   ├── components/          # Tekrar kullanılabilir bileşenler
│   ├── pages/               # Uygulama sayfaları
│   ├── styles/              # CSS dosyaları
│   ├── App.js               # Uygulama başlangıç noktası
│   ├── index.js             # Giriş noktası
│   └── api.js               # API işlemleri
├── .env                     # Çevre değişkenleri
├── package.json             # Proje bağımlılıkları
└── README.md                # Proje dokümantasyonu
   ```
---

## 📜 Lisans
Bu proje MIT Lisansı ile lisanslanmıştır.

  

