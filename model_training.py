import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
import joblib
import xgboost as xgb
import time

VERI_DOSYASI = "araba_verisetim_final_son.csv"
MODEL_DOSYASI = "best_model.pkl"

def main():
    print("1. Veri seti yükleniyor...")
    df = pd.read_csv(VERI_DOSYASI)
    print(f"   Toplam Veri: {len(df)} satır")

    #KATEGORİK DÖNÜŞÜM(Encoding)
    # Marka, Model, Seri gibi sözel verileri sayıya çevirmek gerekiyor
    # Label Encoding kullandım çünkü One-Hot Encoding sütun sayısını on binlere çıkarıp bilgisayarı kilitleyebilir.
    print("2. Veriler sayısal formata çevriliyor...")

    le_dict = {}
    categorical_cols = df.select_dtypes(include=['object']).columns

    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = df[col].astype(str)
        df[col] = le.fit_transform(df[col])
        le_dict[col] = le  # Sözlüğü kaydetme

    # Label Encoder'ları da diske kaydetme
    joblib.dump(le_dict, "label_encoders.pkl")

    # EĞİTİM / TEST
    X = df.drop(columns=['Fiyat'])
    y = df['Fiyat']  # Hedef

    # %80 Eğitim, %20 Test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"3. Eğitim seti: {len(X_train)} araç, Test seti: {len(X_test)} araç")

    #MODEL 1: RANDOM FOREST
    print("\n--- RANDOM FOREST EĞİTİLİYOR ---")
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)  # n_jobs=-1 tüm işlemciyi kullanır

    start = time.time()
    rf_model.fit(X_train, y_train)
    end = time.time()
    print(f"   Eğitim Süresi: {round(end - start, 2)} saniye")

    y_pred_rf = rf_model.predict(X_test)

    #MODEL 2: XGBOOST ---
    print("\n--- XGBOOST EĞİTİLİYOR ---")
    xgb_model = xgb.XGBRegressor(n_estimators=1000, learning_rate=0.05, n_jobs=-1)

    start = time.time()
    xgb_model.fit(X_train, y_train)
    end = time.time()
    print(f"   Eğitim Süresi: {round(end - start, 2)} saniye")

    y_pred_xgb = xgb_model.predict(X_test)

    # --- KARŞILAŞTIRMA VE RAPOR ---
    def evaluate(y_true, y_pred, model_name):
        r2 = r2_score(y_true, y_pred)
        mae = mean_absolute_error(y_true, y_pred)
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)

        # MAPE (Yüzdesel Hata) - Sıfıra bölme hatasını engellemek için küçük bir sayı eklenir
        mask = y_true != 0
        mape = np.mean(np.abs((y_true[mask] - y_pred[mask]) / y_true[mask])) * 100

        print(f"\n   {model_name} SONUÇLARI:")
        print(f"   R2 Skoru (Başarı): %{r2 * 100:.2f}")
        print(f"   MAE (Ort. Hata)  : {int(mae)} TL")
        print(f"   RMSE (Kare Hata) : {int(rmse)} TL")
        print(f"   MAPE (Sapma)     : %{mape:.2f}")
        return r2

    print("\n------------------------------------------------")
    r2_rf = evaluate(y_test, y_pred_rf, "RANDOM FOREST")
    r2_xgb = evaluate(y_test, y_pred_xgb, "XGBOOST")
    print("------------------------------------------------")

    #EN İYİ MODELİ KAYDET
    if r2_rf > r2_xgb:
        print("\n KAZANAN: RANDOM FOREST")
        joblib.dump(rf_model, MODEL_DOSYASI)
    else:
        print("\n KAZANAN: XGBOOST")
        joblib.dump(xgb_model, MODEL_DOSYASI)

    print(f" En iyi model '{MODEL_DOSYASI}' olarak kaydedildi.")


if __name__ == "__main__":
    main()