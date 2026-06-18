# Yapay Zeka ile Araç Fiyat Tahmini ve Kullanıcıya Araç Öneri Sistemi

Bu proje, ikinci el araç piyasasında kullanıcıların araç özelliklerine göre tahmini piyasa değerini hesaplamasını ve bütçe/tercih bilgilerine göre uygun araç önerileri almasını sağlayan uçtan uca bir karar destek sistemidir.

Sistem; web scraping ile oluşturulan veri seti, XGBoost tabanlı fiyat tahmin modeli, FastAPI backend servisi, React web arayüzü, React Native / Expo mobil prototipi ve KNN tabanlı araç öneri modülünden oluşmaktadır.

## Proje Özellikleri

- İkinci el araç fiyat tahmini
- Random Forest ve XGBoost model karşılaştırması
- XGBoost final fiyat tahmin modeli
- KNN tabanlı araç öneri sistemi
- Kullanıcı kayıt ve giriş sistemi
- Geçmiş tahmin kayıtları
- React tabanlı web arayüzü
- React Native / Expo tabanlı mobil prototip
- FastAPI tabanlı REST API
- SQLite veritabanı

## Kullanılan Teknolojiler

### Makine Öğrenmesi ve Veri
- Python
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- KNN
- Label Encoding
- IQR aykırı değer temizliği

### Veri Toplama
- Requests
- BeautifulSoup
- Web Scraping

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- JWT tabanlı kimlik doğrulama

### Web
- React.js
- Vite
- Axios
- Tailwind CSS
- React Router

### Mobil
- React Native
- Expo
- Expo Router
- AsyncStorage
- Axios

## Veri Seti

Veri seti arabam.com üzerinde yer alan ikinci el araç ilanlarından web scraping yöntemiyle oluşturulmuştur.

- Toplanan ham ilan sayısı: 50.748
- Ön işleme sonrası temiz kayıt sayısı: 47.143
- Kategoriler:
  - Otomobil
  - Arazi / SUV
  - Pick-up

Model eğitiminde marka, seri, model, yıl, kilometre, vites tipi, yakıt tipi, kasa tipi, renk, çekiş, motor hacmi, motor gücü, değişen parça sayısı ve boyalı parça sayısı gibi özellikler kullanılmıştır.

## Model Performansı

| Model | R² Skoru | MAE | RMSE | MAPE |
|---|---:|---:|---:|---:|
| Random Forest | %93.26 | 135.341 TL | 415.629 TL | %9.64 |
| XGBoost | %94.20 | 124.896 TL | 385.494 TL | %8.78 |

Final model olarak XGBoost seçilmiştir.

## Proje Klasör Yapısı

```text
arac-fiyat-tahmin/
├── backend/              # FastAPI backend servisi
├── frontend/car-ui/      # React web arayüzü
├── mobile/               # React Native / Expo mobil uygulama
├── model/                # Veri seti, model eğitimi ve kayıtlı model dosyaları
├── .gitignore
└── README.md
```

## Kurulum ve Çalıştırma

### 1. Backend

```bash
cd backend
python -m venv venv
```

Windows için:

```bash
venv\Scripts\activate
```

macOS / Linux için:

```bash
source venv/bin/activate
```

Bağımlılıkları kurun:

```bash
pip install -r requirements.txt
```

Backend servisini başlatın:

```bash
uvicorn api_main:app --reload
```

API dokümantasyonu:

```text
http://127.0.0.1:8000/docs
```

### 2. Web Arayüzü

```bash
cd frontend/car-ui
npm install
npm run dev
```

Web arayüzü varsayılan olarak şu adreste çalışır:

```text
http://localhost:5173
```

Web tarafındaki API adresi `frontend/car-ui/src/config.js` dosyasından değiştirilebilir.

### 3. Mobil Uygulama

```bash
cd mobile
npm install
npx expo start
```

Mobil uygulamanın backend'e bağlanabilmesi için `mobile/src/utils/constants.ts` dosyasındaki `API_BASE_URL` değeri bilgisayarınızın yerel IP adresine göre güncellenmelidir.

Örnek:

```ts
export const API_BASE_URL = "http://192.168.1.100:8000";
```

## Öneri Sistemi

Öneri sistemi, kullanıcıdan alınan bütçe, yıl, kilometre ve tercih bilgilerine göre araçları filtreler. Daha sonra KNN tabanlı yakınlık yaklaşımıyla araçlara uygunluk skoru hesaplanır. Kullanıcıya en uygun araçlar sıralı şekilde gösterilir.

Gerçek fiyatı modelin tahmin ettiği fiyatın altında olan araçlar fırsat olarak değerlendirilebilir.

## Notlar

- `node_modules`, `__pycache__`, `.expo` ve yerel veritabanı dosyaları repoya dahil edilmemelidir.
- Kayıtlı model dosyaları `model/` klasörü altında yer almaktadır.
- Backend çalışırken model ve encoder dosyalarını `model/best_model.pkl` ve `model/label_encoders.pkl` yollarından okur.

## Geliştirici

Miraç Taşkıran  
Bilgisayar Mühendisliği  
GitHub: [MiracTaskirn](https://github.com/MiracTaskirn)
