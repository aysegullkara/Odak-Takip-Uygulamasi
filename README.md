# Odak Takip Uygulaması (Pomodoro Timer)

Bu uygulama, kullanıcıların odaklanma sürelerini ve dikkat dağınıklığı seviyelerini izlemelerine yardımcı olmak için geliştirilmiş bir zamanlayıcıdır. Pomodoro tekniklerine dayalı olarak çalışır ve her bir seans için bir rapor oluşturur. Ayrıca, günlük, haftalık ve kategori bazlı odaklanma sürelerini grafiksel olarak görselleştirir.

## Özellikler

- **Zamanlayıcı**: Kullanıcıların odaklanma süresini başlatıp duraklatabileceği bir zamanlayıcı.
- **Kategoriler**: Kullanıcılar, "Ders Çalışma", "Kodlama", "Proje", "Kitap Okuma" gibi farklı kategorilerde odaklanma seanslarını izleyebilir.
- **Dikkat Dağınıklığı Takibi**: Uygulama arka planda iken dikkat dağınıklığı sayılır ve kullanıcı uyarılır.
- **Raporlar ve İstatistikler**: Kullanıcılar, günlük ve toplam odaklanma süreleri ile dikkat dağınıklığı sayılarını görüntüleyebilir.
- **Grafikler**: Son 7 gün için bar chart ve kategoriler bazında pie chart ile görselleştirme.
- **Veri Kaydı**: Seanslar `AsyncStorage` kullanılarak kaydedilir ve raporlar sayfasında görüntülenir.

## Kullanılan Teknolojiler

- **React Native**: Mobil uygulama geliştirme için kullanılan framework.
- **Expo**: React Native uygulamaları için geliştirme aracıdır.
- **React Navigation**: Uygulama içinde sayfalar arası geçiş için navigation kütüphanesi.
- **react-native-chart-kit**: Grafiklerin oluşturulması için kullanılır.
- **AsyncStorage**: Kullanıcı verilerini kalıcı olarak depolamak için kullanılır.
- **Ionicons**: Uygulamada ikonlar için kullanılan kütüphane.

## Kurulum

Bu projeyi yerel bilgisayarınıza klonlamak için aşağıdaki komutları izleyebilirsiniz:

1. Projeyi klonlayın:
   ```bash
   git clone https://github.com/<your-username>/odak-takip-uygulamasi.git

2. Gerekli bağımlılıkları yükleyin:
   ```bash
   cd odak-takip-uygulamasi
   npm install

4. Uygulamayı başlatın:
   ```bash
   npx expo start

Ardından, tarayıcıda veya Expo Go uygulamasını kullanarak QR kodu taratarak mobil cihazınızda çalıştırabilirsiniz.

## Kullanım

1. Ana Sayfa (Zamanlayıcı Ekranı):

Başlangıçta, kullanıcılar süreyi seçebilir (1, 10, 25 dakika).
Seans kategorisi seçimi yapılabilir (Ders Çalışma, Kodlama, Proje, Kitap Okuma).
Zamanlayıcı başlatılabilir, duraklatılabilir veya sıfırlanabilir.
Zamanlayıcı çalışırken kullanıcı arka plana geçtiğinde uyarılır ve dikkat dağınıklığı sayacı artar.

2. Raporlar Ekranı:

Kullanıcılar, son 7 günlük odaklanma sürelerini bar chart üzerinden görebilir.
Kategoriler bazında pasta grafik gösterilir.
Tüm seanslar ve bunların detayları listelenir (kategori, süre, dikkat dağınıklığı).

<img width="738" height="1600" alt="image" src="https://github.com/user-attachments/assets/1084c5a3-d191-48d9-95c7-c36f1ee02373" />

<img width="738" height="1600" alt="image" src="https://github.com/user-attachments/assets/6af6e3b2-5651-4495-bc98-cc66fb56cd8f" />


<img width="738" height="1600" alt="image" src="https://github.com/user-attachments/assets/93dd59d4-71a3-49cc-9f5a-26b65948db2a" />


   
