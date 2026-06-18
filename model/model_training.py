import pandas as pd
import numpy as np
import time
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

import xgboost as xgb

# DOSYA AYARLARI
VERI_DOSYASI = "araba_verisetim_guncel2026.csv"

MODEL_DOSYASI = "best_model.pkl"

ENCODER_DOSYASI = "label_encoders.pkl"

# MODELDE KULLANILMAYACAK KOLONLAR
KULLANILMAYACAK_KOLONLAR = [
    "Fiyat",
    "İlan No"
]


# YARDIMCI FONKSİYONLAR
def evaluate(y_true, y_pred, model_name):
    """
    Model performansını hesaplar ve ekrana yazdırır.
    """
    r2 = r2_score(y_true, y_pred)
    mae = mean_absolute_error(y_true, y_pred)
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)

    mask = y_true != 0
    mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100

    print(f"\n   {model_name} SONUÇLARI:")
    print(f"   R2 Skoru (Başarı): %{r2 * 100:.2f}")
    print(f"   MAE (Ort. Hata)  : {int(mae)} TL")
    print(f"   RMSE (Kare Hata) : {int(rmse)} TL")
    print(f"   MAPE (Sapma)     : %{mape:.2f}")

    return {
        "model_name": model_name,
        "r2": r2,
        "mae": mae,
        "rmse": rmse,
        "mape": mape
    }


def encode_categorical_columns(X):
    """
    Kategorik kolonları LabelEncoder ile sayısal hale getirir.
    Encoder'ları dictionary olarak döndürür.
    """
    le_dict = {}

    categorical_cols = X.select_dtypes(include=["object", "string"]).columns

    for col in categorical_cols:
        le = LabelEncoder()

        X[col] = X[col].astype(str)
        X[col] = le.fit_transform(X[col])

        le_dict[col] = le

    return X, le_dict


# ANA PROGRAM
def main():
    print("1. Veri seti yükleniyor...")

    df = pd.read_csv(VERI_DOSYASI)

    print(f"   Toplam Veri: {len(df)} satır")
    print(f"   Toplam Kolon: {len(df.columns)}")
    print(f"   Kolonlar: {df.columns.tolist()}")

    # Temel kontrol
    if "Fiyat" not in df.columns:
        raise ValueError("Veri setinde 'Fiyat' kolonu bulunamadı.")

    # X ve y ayırma
    y = df["Fiyat"]

    # Fiyat hedef değişken.
    X = df.drop(columns=KULLANILMAYACAK_KOLONLAR, errors="ignore")

    print("\n2. Modelde kullanılacak feature kolonları:")
    print(X.columns.tolist())

    if "İlan No" in X.columns:
        raise ValueError("HATA: İlan No hâlâ X içinde. Model eğitimine girmemeli.")

    # Kategorik dönüşüm
    print("\n3. Kategorik veriler sayısal formata çevriliyor...")

    X, le_dict = encode_categorical_columns(X)

    # Encoder'ları kaydetme
    joblib.dump(le_dict, ENCODER_DOSYASI)

    print(f"   Label encoder dosyası kaydedildi: {ENCODER_DOSYASI}")
    print(f"   Encode edilen kolonlar: {list(le_dict.keys())}")

    # Eğitim / test ayrımı
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    print("\n4. Eğitim / test ayrımı tamamlandı.")
    print(f"   Eğitim seti: {len(X_train)} araç")
    print(f"   Test seti  : {len(X_test)} araç")


    # Model 1: Random Forest
    print("\n--- RANDOM FOREST EĞİTİLİYOR ---")

    rf_model = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )

    start = time.time()
    rf_model.fit(X_train, y_train)
    end = time.time()

    print(f"   Eğitim Süresi: {round(end - start, 2)} saniye")

    y_pred_rf = rf_model.predict(X_test)


    # Model 2: XGBoost
    print("\n--- XGBOOST EĞİTİLİYOR ---")

    xgb_model = xgb.XGBRegressor(
        n_estimators=1000,
        learning_rate=0.1,
        random_state=42,
        n_jobs=-1
    )

    start = time.time()
    xgb_model.fit(X_train, y_train)
    end = time.time()

    print(f"   Eğitim Süresi: {round(end - start, 2)} saniye")

    y_pred_xgb = xgb_model.predict(X_test)

    # Karşılaştırma
    print("\n------------------------------------------------")

    rf_result = evaluate(y_test, y_pred_rf, "RANDOM FOREST")
    xgb_result = evaluate(y_test, y_pred_xgb, "XGBOOST")

    print("------------------------------------------------")

    # En iyi modeli kaydet
    if rf_result["r2"] > xgb_result["r2"]:
        print("\nKAZANAN: RANDOM FOREST")
        best_model = rf_model
        best_result = rf_result
    else:
        print("\nKAZANAN: XGBOOST")
        best_model = xgb_model
        best_result = xgb_result

    joblib.dump(best_model, MODEL_DOSYASI)

    print(f"\nEn iyi model '{MODEL_DOSYASI}' olarak kaydedildi.")
    print(f"En iyi model: {best_result['model_name']}")
    print(f"R2: %{best_result['r2'] * 100:.2f}")
    print(f"MAPE: %{best_result['mape']:.2f}")

    print("\nModel eğitimi tamamlandı.")


if __name__ == "__main__":
    main()