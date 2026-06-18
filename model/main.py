import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime

MODEL_PATH = "best_model.pkl"
ENCODER_PATH = "label_encoders.pkl"


def sistem_yukle():
    if not os.path.exists(MODEL_PATH) or not os.path.exists(ENCODER_PATH):
        print("HATA: Model dosyaları bulunamadı! Önce 'model_training.py' çalıştırılmalı.")
        return None, None

    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODER_PATH)
    return model, encoders

def kullanici_verisi_al():
    print("-" * 50)
    print("--- ARAÇ FİYAT TAHMİN SİSTEMİ ---")
    print("-" * 50)

    try:
        print("Lütfen ilandaki gibi hatasız giriniz!!!")
        marka = input("1. Marka (Örn: Renault)      : ").strip()
        seri  = input("2. Seri  (Örn: Clio)         : ").strip()
        model = input("3. Model (Örn: 1.0 TCe Joy)  : ").strip()
        yil   = int(input("4. Yıl        : "))
        km    = float(input("5. Kilometre  : "))
        vites = input("6. Vites (Düz/Otomatik)  : ").strip()
        yakit = input("7. Yakıt (Benzin/Dizel)  : ").strip()
        kasa  = input("8. Kasa Tipi (Sedan/Hatchback/SUV) : ").strip()
        renk  = input("9. Renk (Beyaz/Siyah/Gri)          : ").strip()
        cekis = input("10. Çekiş (Önden/Arkadan/4WD)      : ").strip()

        print("\n--- Hasar Durumu (Yoksa '0' yazın veya Enter'a basın) ---")
        # Kullanıcı boş geçerse (Enter'a basarsa) 0 kabul ediyoruz
        degisen_input = input("8. Değişen Parça Sayısı   : ")
        boyali_input  = input("9. Boyalı Parça Sayısı    : ")

        degisen = int(degisen_input) if degisen_input.strip() else 0
        boyali = int(boyali_input) if boyali_input.strip() else 0

        motor_hacmi = float(input("Motor Hacmi (cc) (Örn: 1000) : "))
        motor_gucu  = float(input("Motor Gücü (hp) (Örn: 90)    : "))

        return {
            'Marka': marka,
            'Seri': seri,
            'Model': model,
            'Yıl': yil,
            'Kilometre': km,
            'Vites Tipi': vites,
            'Yakıt Tipi': yakit,
            'Motor_Hacmi_CC': motor_hacmi,
            'Motor_Gucu_HP': motor_gucu,
            'Degisen_Parca': degisen,
            'Boyali_Parca': boyali,
            'Kasa Tipi': kasa,
            'Renk': renk,
            'Çekiş': cekis
        }
    except ValueError:
        print("\n HATA: Lütfen sayısal değerleri düzgün giriniz!")
        return None

def tahmin_et(model, encoders, veri):
    df = pd.DataFrame([veri])

    # Encoding
    for col, le in encoders.items():
        if col in df.columns:
            val = str(df[col].iloc[0]).strip()

            found = False
            known_classes = list(le.classes_)

            if val in known_classes:
                df[col] = le.transform([val])
                found = True

            elif not found and val.title() in known_classes:
                df[col] = le.transform([val.title()])
                found = True

            elif not found and val.upper() in known_classes:
                df[col] = le.transform([val.upper()])
                found = True

            if not found:
                giris_lower = val.lower()
                for known in known_classes:
                    if str(known).lower() == giris_lower:
                        df[col] = le.transform([known])
                        found = True
                        break

            if not found:
                df[col] = 0

    # Sütun Sıralaması (XGBoost Hatası Almamak için)
    ozellik_sirasi = [
        'Marka', 'Seri', 'Model', 'Yıl', 'Kilometre', 'Vites Tipi', 'Yakıt Tipi',
        'Kasa Tipi', 'Renk', 'Çekiş', 'Motor_Hacmi_CC', 'Motor_Gucu_HP',
        'Degisen_Parca', 'Boyali_Parca'
    ]

    # Eksik sütunları doldur ve sırala
    for col in ozellik_sirasi:
        if col not in df.columns:
            df[col] = 0

    X = df[ozellik_sirasi]

    # Tahmin
    tahmin_fiyat = model.predict(X)[0]
    return tahmin_fiyat


def main():
    model, encoders = sistem_yukle()
    if not model: return

    while True:
        veri = kullanici_verisi_al()
        if veri:
            fiyat = tahmin_et(model, encoders, veri)
            print("\n" + "=" * 40)
            print(f" TAHMİN EDİLEN DEĞER: {int(fiyat):,} TL")
            print("=" * 40 + "\n")

        devam = input("Başka araç sorgulamak ister misin? (e/h): ")
        if devam.lower() != 'e':
            break

if __name__ == "__main__":
    main()