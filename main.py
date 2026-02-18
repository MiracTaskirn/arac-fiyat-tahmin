from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import traceback

# 1. Modeli Yükle
try:
    model = joblib.load('best_model.pkl')
    print("✅ Model başarıyla yüklendi.")
except Exception as e:
    print(f"❌ Hata: {e}")
    model = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ArabaVerisi(BaseModel):
    Marka: int
    Seri: int
    Model: int
    Yil: int
    Kilometre: float
    Vites_Tipi: int
    Yakit_Tipi: int
    Kasa_Tipi: int
    Renk: int
    Cekis: int
    Motor_Hacmi_CC: float
    Motor_Gucu_HP: float
    Degisen_Parca: int
    Boyali_Parca: int

@app.post("/tahmin-et")
def tahmin_et(veri: ArabaVerisi):
    if model is None:
        return {"hata": "Model yüklenemedi!"}

    try:
        # 1. React'tan gelen verileri al
        veri_dict = veri.dict()

        # 2. TERCÜME MASASI: React isimlerini Model isimlerine çevir
        # Hata mesajındaki isimlere göre eşleştiriyoruz
        tercüme_rehberi = {
            "Marka": "Marka",
            "Seri": "Seri",
            "Model": "Model",
            "Yil": "Yıl",
            "Kilometre": "Kilometre",
            "Vites_Tipi": "Vites Tipi",
            "Yakit_Tipi": "Yakıt Tipi",
            "Kasa_Tipi": "Kasa Tipi",
            "Renk": "Renk",
            "Cekis": "Çekiş",
            "Motor_Hacmi_CC": "Motor Hacmi (cc)",
            "Motor_Gucu_HP": "Motor Gücü (hp)",
            "Degisen_Parca": "Değişen Parça Sayısı",
            "Boyali_Parca": "Boyalı Parça Sayısı"
        }

        # Yeni isimlerle yeni bir sözlük oluştur
        yeni_veri = {}
        for eski_ad, yeni_ad in tercüme_rehberi.items():
            if eski_ad in veri_dict:
                yeni_veri[yeni_ad] = veri_dict[eski_ad]

        # 3. DataFrame oluştur
        df = pd.DataFrame([yeni_veri])

        # 4. Sütun sırasını modelin beklediği hale getir
        if hasattr(model, "feature_names_in_"):
            # Eksik sütunları 0 ile tamamla ve sırayı modelin istediği gibi yap
            df = df.reindex(columns=model.feature_names_in_, fill_value=0)
        
        print("\n--- MODELE GİREN SON HAL ---")
        print(df)

        tahmin = model.predict(df)
        
        # React'ın beklediği isme göre gönderiyoruz
        return {"tahmin_fiyat": float(tahmin[0])}

    except Exception as e:
        print("HATA AYRINTISI:", e)
        return {"hata": str(e)}