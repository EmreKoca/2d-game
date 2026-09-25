# Boğaziçi Dövüşçüleri 2D - Proje Transfer & Yükleme Rehberi

Bu dosya, oyuna ait tüm kaynak kodlarını, görselleri (sprites, sahneler, arka planlar) ve ses efektlerini farklı bir Google hesabına, AI Studio alanına veya GitHub / yerel bilgisayarınıza nasıl aktaracağınızı anlatır.

---

## 1. ZIP Dosyası İçeriği
İndirdiğiniz `project_export.zip` arşivi şunları içerir:
- `/src`: Tüm oyun motoru (`engine.ts`), ses yönetimi (`audio.ts`), render çizim motoru (`renderer.ts`) ve React arayüz bileşenleri.
- `/public/sprites`: Tüm dövüşçü sprite'ları, K.O. pozları, zafer hareketleri ve özel efektler.
- `/public/assets`: HD stage (dövüş sahnesi) görselleri ve arka planlar.
- `package.json`, `vite.config.ts`, `tsconfig.json`: Proje yapılandırma ve bağımlılık dosyaları.

---

## 2. Başka Bir Google Hesabına / AI Studio'ya Yükleme Yöntemleri

### Yöntem A: AI Studio "Import" / Proje Yükleme (Önerilen)
1. Yeni Google hesabınızla **Google AI Studio** platformuna giriş yapın.
2. Yeni bir uygulama/applet oluşturun veya var olan projeye girin.
3. İndirdiğiniz `.zip` arşivini açıp tüm klasörleri (`src`, `public`, `package.json` vb.) yeni projenize yükleyin.
4. AI Studio dev sunucusu otomatik olarak projeyi derleyecek ve başlatacaktır.

### Yöntem B: GitHub Üzerinden Aktarım
1. İndirdiğiniz `.zip` dosyasını bilgisayarınızda bir klasöre çıkarın.
2. Yeni Google hesabınızla bağlantılı bir **GitHub** deposu (repository) oluşturun ve kodları buraya push edin:
   ```bash
   git init
   git add .
   git commit -m "Boğaziçi Dövüşçüleri 2D ilk sürüm"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADI/REPO_ADI.git
   git push -u origin main
   ```
3. Yeni Google hesabınızdaki AI Studio arayüzünden **"Import from GitHub"** butonuna tıklayarak bu depoyu seçin.

---

## 3. Bilgisayarınızda Yerel Olarak Çalıştırma (VS Code / Localhost)
1. Bilgisayarınızda [Node.js](https://nodejs.org/) (v18+) kurulu olduğundan emin olun.
2. Proje klasöründe terminal açıp bağımlılıkları yükleyin:
   ```bash
   npm install
   ```
3. Geliştirici sunucusunu başlatın:
   ```bash
   npm run dev
   ```
4. Tarayıcınızda `http://localhost:3000` adresine girerek oyunu oynayabilirsiniz.
