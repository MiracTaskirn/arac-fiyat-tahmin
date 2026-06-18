# AI-Powered Used Car Price Prediction and Recommendation System

[Türkçe açıklama için aşağı kaydırın.](#yapay-zeka-ile-araç-fiyat-tahmini-ve-kullanıcıya-araç-öneri-sistemi)

## English

This project is an end-to-end decision support system that predicts used car prices based on vehicle features and recommends suitable cars according to user budget and preferences.

The system consists of a web scraping-based dataset, an XGBoost-based price prediction model, a FastAPI backend service, a React web interface, a React Native / Expo mobile prototype, and a KNN-based recommendation module.

## Features

* Used car price prediction
* Random Forest and XGBoost model comparison
* Final XGBoost regression model
* KNN-based car recommendation system
* User registration and login system
* Prediction history records
* React-based web interface
* React Native / Expo mobile prototype
* FastAPI-based REST API
* SQLite database

## Technologies Used

### Machine Learning and Data Processing

* Python
* Pandas
* NumPy
* Scikit-learn
* XGBoost
* KNN
* Label Encoding
* IQR-based outlier cleaning

### Data Collection

* Requests
* BeautifulSoup
* Web Scraping

### Backend

* FastAPI
* SQLAlchemy
* SQLite
* JWT-based authentication

### Web

* React.js
* Vite
* Axios
* Tailwind CSS
* React Router

### Mobile

* React Native
* Expo
* Expo Router
* AsyncStorage
* Axios

## Dataset

The dataset was collected from used car listings on arabam.com using web scraping.

* Raw collected listings: 50,748
* Clean records after preprocessing: 47,143
* Vehicle categories:

  * Automobile
  * Off-road / SUV
  * Pick-up

The model uses features such as brand, series, model, year, mileage, transmission type, fuel type, body type, color, drivetrain, engine displacement, engine power, number of replaced parts, and number of painted parts.

## Model Performance

| Model         | R² Score |        MAE |       RMSE |  MAPE |
| ------------- | -------: | ---------: | ---------: | ----: |
| Random Forest |   93.26% | 135,341 TL | 415,629 TL | 9.64% |
| XGBoost       |   94.20% | 124,896 TL | 385,494 TL | 8.78% |

XGBoost was selected as the final prediction model because it achieved the best performance.

## Project Structure

```text
arac-fiyat-tahmin/
├── backend/              # FastAPI backend service
├── frontend/car-ui/      # React web interface
├── mobile/               # React Native / Expo mobile application
├── model/                # Dataset, model training files and saved model files
├── .gitignore
└── README.md
```

## Installation and Running

### 1. Backend

```bash
cd backend
python -m venv venv
```

For Windows:

```bash
venv\Scripts\activate
```

For macOS / Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the backend server:

```bash
uvicorn api_main:app --reload
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 2. Web Interface

```bash
cd frontend/car-ui
npm install
npm run dev
```

The web interface runs by default at:

```text
http://localhost:5173
```

The API address for the web application can be changed from:

```text
frontend/car-ui/src/config.js
```

### 3. Mobile Application

```bash
cd mobile
npm install
npx expo start
```

For the mobile application to connect to the backend, update the `API_BASE_URL` value in:

```text
mobile/src/utils/constants.ts
```

Example:

```ts
export const API_BASE_URL = "http://192.168.1.100:8000";
```

## Recommendation System

The recommendation system filters vehicles according to the user's budget, year, mileage and preference information. Then, a KNN-based similarity approach is used to calculate suitability scores for vehicles. The most suitable cars are listed for the user.

Vehicles whose actual listing price is below the predicted market value can be evaluated as opportunity vehicles.

## Notes

* `node_modules`, `__pycache__`, `.expo` and local database files should not be included in the repository.
* Saved model files are located under the `model/` folder.
* The backend reads the model and encoder files from `model/best_model.pkl` and `model/label_encoders.pkl`.

## Developer

Miraç Taşkıran
Computer Engineering
GitHub: [MiracTaskirn](https://github.com/MiracTaskirn)

---

# Yapay Zeka ile Araç Fiyat Tahmini ve Kullanıcıya Araç Öneri Sistemi

[For English description, scroll up.](#ai-powered-used-car-price-prediction-and-recommendation-system)

## Türkçe

Bu proje, ikinci el araç piyasasında kullanıcıların araç özelliklerine göre tahmini piyasa değerini hesaplamasını ve bütçe/tercih bilgilerine göre uygun araç önerileri almasını sağlayan uçtan uca bir karar destek sistemidir.

Sistem; web scraping ile oluşturulan veri seti, XGBoost tabanlı fiyat tahmin modeli, FastAPI backend servisi, React web arayüzü, React Native / Expo mobil prototipi ve KNN tabanlı araç öneri modülünden oluşmaktadır.

## Proje Özellikleri

* İkinci el araç fiyat tahmini
* Random Forest ve XGBoost model karşılaştırması
* XGBoost final fiyat tahmin modeli
* KNN tabanlı araç öneri sistemi
* Kullanıcı kayıt ve giriş sistemi
* Geçmiş tahmin kayıtları
* React tabanlı web arayüzü
* React Native / Expo tabanlı mobil prototip
* FastAPI tabanlı REST API
* SQLite veritabanı

## Kullanılan Teknolojiler

### Makine Öğrenmesi ve Veri İşleme

* Python
* Pandas
* NumPy
* Scikit-learn
* XGBoost
* KNN
* Label Encoding
* IQR tabanlı aykırı değer temizliği

### Veri Toplama

* Requests
* BeautifulSoup
* Web Scraping

### Backend

* FastAPI
* SQLAlchemy
* SQLite
* JWT tabanlı kimlik doğrulama

### Web

* React.js
* Vite
* Axios
* Tailwind CSS
* React Router

### Mobil

* React Native
* Expo
* Expo Router
* AsyncStorage
* Axios

## Veri Seti

Veri seti, arabam.com üzerinde yer alan ikinci el araç ilanlarından web scraping yöntemiyle oluşturulmuştur.

* Toplanan ham ilan sayısı: 50.748
* Ön işleme sonrası temiz kayıt sayısı: 47.143
* Araç kategorileri:

  * Otomobil
  * Arazi / SUV
  * Pick-up

Model eğitiminde marka, seri, model, yıl, kilometre, vites tipi, yakıt tipi, kasa tipi, renk, çekiş, motor hacmi, motor gücü, değişen parça sayısı ve boyalı parça sayısı gibi özellikler kullanılmıştır.

## Model Performansı

| Model         | R² Skoru |        MAE |       RMSE |  MAPE |
| ------------- | -------: | ---------: | ---------: | ----: |
| Random Forest |   %93.26 | 135.341 TL | 415.629 TL | %9.64 |
| XGBoost       |   %94.20 | 124.896 TL | 385.494 TL | %8.78 |

En başarılı sonucu verdiği için final model olarak XGBoost seçilmiştir.

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

Web tarafındaki API adresi şu dosyadan değiştirilebilir:

```text
frontend/car-ui/src/config.js
```

### 3. Mobil Uygulama

```bash
cd mobile
npm install
npx expo start
```

Mobil uygulamanın backend'e bağlanabilmesi için aşağıdaki dosyada yer alan `API_BASE_URL` değeri bilgisayarın yerel IP adresine göre güncellenmelidir:

```text
mobile/src/utils/constants.ts
```

Örnek:

```ts
export const API_BASE_URL = "http://192.168.1.100:8000";
```

## Öneri Sistemi

Öneri sistemi, kullanıcıdan alınan bütçe, yıl, kilometre ve tercih bilgilerine göre araçları filtreler. Daha sonra KNN tabanlı yakınlık yaklaşımıyla araçlara uygunluk skoru hesaplanır. Kullanıcıya en uygun araçlar sıralı şekilde gösterilir.

Gerçek fiyatı modelin tahmin ettiği fiyatın altında olan araçlar fırsat olarak değerlendirilebilir.

## Notlar

* `node_modules`, `__pycache__`, `.expo` ve yerel veritabanı dosyaları repoya dahil edilmemelidir.
* Kayıtlı model dosyaları `model/` klasörü altında yer almaktadır.
* Backend çalışırken model ve encoder dosyalarını `model/best_model.pkl` ve `model/label_encoders.pkl` yollarından okur.

## Geliştirici

Miraç Taşkıran
Bilgisayar Mühendisliği
GitHub: [MiracTaskirn](https://github.com/MiracTaskirn)
