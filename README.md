# İkinci El Araç Fiyat Tahmin Sistemi (Machine Learning)
Bu proje, ikinci el araç verilerini toplayan, işleyen ve Makine Öğrenmesi algoritmaları (Random Forest & Xgboost) kullanarak araç fiyatlarını yüksek doğrulukla tahmin eden uçtan uca bir yapay zeka uygulamasıdır.

# Proje İçeriği ve Dosyalar
Bu depoda projenin backend ve modelleme aşamaları yer almaktadır:

* **`Car_Scraping.py`**: Web scraping teknikleri ile binlerce araç verisinin (Marka, Model, Yıl, KM, vb.) çekilmesini sağlar.
* **`data_preprocessing.py`**: Ham verinin temizlenmesi, eksik verilerin giderilmesi ve kategorik verilerin (Örn: "BMW", "Otomatik") sayısal değerlere dönüştürülmesi (Label Encoding) işlemlerini yapar.
* **`analiz.py`**: Modelin "Feature Importance"(Özellik Önem) skorları hesaplar ve veri dağılımlarını inceler.
* **`model_training.py`**: Temizlenen veri ile makine öğrenmesi modellerini (Random Forest & Xgboost) eğitir ve en iyi modeli (`best_model.pkl`) kaydeder.
* **`app.py`**: Eğitilen modeli bir **FastAPI** servisi olarak dış dünyaya açar. Kullanıcıdan alınan araç özelliklerine göre anlık fiyat tahmini yapar.
* **`araba_verisetim_final.csv`**: Model eğitiminde kullanılan işlenmiş veri seti.

# Kullanılan Teknolojiler
* **Dil:** Python 3.x
* **Veri İşleme:** Pandas, NumPy
* **Makine Öğrenmesi:** Scikit-learn (Random Forest Regressor, Xgboost)
* **API & Backend:** FastAPI, Uvicorn
* **Veri Toplama:** BeautifulSoup

# Model Başarısı
Proje kapsamında geliştirilen Random Forest modelinin r2 skoru: %93.44 iken Xgboost modelinin r2 skoru: %94.12 dir.

---
**Geliştirici:** Miraç Taşkıran
*Konya Teknik Üniversitesi - Bilgisayar Mühendisliği*
