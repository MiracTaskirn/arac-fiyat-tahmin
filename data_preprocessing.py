import pandas as pd
import numpy as np
import re
from datetime import datetime

GIRIS_DOSYASI = "araba_verisetim_final.csv"
CIKIS_DOSYASI = "araba_verisetim_final_son.csv"


def clean_kilometre(text):
    if pd.isna(text): return None
    clean = re.sub(r'[^\d]', '', str(text))
    if clean: return int(clean)
    return None


def clean_range_value(text):
    """ '1401 - 1600 cm3' -> 1500.5 veya '1.6 lt' -> 1600 çevirir """
    if pd.isna(text): return None
    text = str(text).lower().strip()

    if 'lt' in text:
        text = text.replace('lt', '').strip()
        try:
            return float(text) * 1000
        except:
            return None

    text = text.replace('hp', '').replace('kw', '').replace('cc', '').replace('cm3', '').replace('.', '').strip()

    if '-' in text:
        parts = text.split('-')
        try:
            return (float(parts[0].strip()) + float(parts[1].strip())) / 2
        except:
            return None

    clean = re.sub(r'[^\d]', '', text)
    if clean: return float(clean)
    return None


def parse_damage_info(text):
    degisen = 0
    boyali = 0
    if pd.isna(text) or text == "Belirtilmemiş": return 0, 0
    text = text.lower()
    if "orjinal" in text or "hatasız" in text: return 0, 0

    d_match = re.search(r'(\d+)\s*değişen', text)
    if d_match: degisen = int(d_match.group(1))

    b_match = re.search(r'(\d+)\s*boyalı', text)
    if b_match: boyali = int(b_match.group(1))

    if "tamamı boyalı" in text: boyali = 12
    return degisen, boyali


def remove_outliers_by_model(df):
    df_clean = pd.DataFrame()
    grouped = df.groupby(['Marka', 'Model'])
    print("Model bazlı aykırı fiyat temizliği yapılıyor...")
    for name, group in grouped:
        if len(group) < 10:
            df_clean = pd.concat([df_clean, group])
            continue
        Q1 = group['Fiyat'].quantile(0.25)
        Q3 = group['Fiyat'].quantile(0.75)
        IQR = Q3 - Q1
        alt_sinir = Q1 - 1.5 * IQR
        ust_sinir = Q3 + 1.5 * IQR
        valid_cars = group[(group['Fiyat'] >= alt_sinir) & (group['Fiyat'] <= ust_sinir)]
        df_clean = pd.concat([df_clean, valid_cars])
    return df_clean


def main():
    print("Veri seti yükleniyor...")
    df = pd.read_csv(GIRIS_DOSYASI)
    ilk_sayi = len(df)

    #TEMEL DÖNÜŞÜMLER
    df['Kilometre'] = df['Kilometre'].apply(clean_kilometre)
    df['Motor_Hacmi_CC'] = df['Motor Hacmi'].apply(clean_range_value)
    df['Motor_Gucu_HP'] = df['Motor Gücü'].apply(clean_range_value)


    df[['Degisen_Parca', 'Boyali_Parca']] = df['Boya-değişen'].apply(
        lambda x: pd.Series(parse_damage_info(x))
    )

    #TEMİZLİK
    if 'Ağır Hasarlı' in df.columns:
        df['Ağır Hasarlı'] = df['Ağır Hasarlı'].fillna('Hayır')
        df = df[df['Ağır Hasarlı'] != 'Evet']

    df = df[(df['Fiyat'] > 150000) & (df['Fiyat'] < 30000000)]
    df = df[df['Kilometre'] < 700000]

    drop_cols = ['İlan No', 'İlan Tarihi', 'Motor Hacmi', 'Motor Gücü',
                 'Ort. Yakıt Tüketimi', 'Yakıt Deposu', 'Boya-değişen',
                 'Araç Durumu', 'Takasa Uygun', 'Kimden', 'Ağır Hasarlı']

    df.drop(columns=[c for c in drop_cols if c in df.columns], inplace=True)

    # Eksik verileri doldurma
    df.dropna(subset=['Model', 'Marka', 'Yıl', 'Fiyat'], inplace=True)

    if 'Seri' in df.columns:
        df['Seri'] = df['Seri'].fillna("Belirtilmemiş")

    # Sayısal boşlukları medyan ile doldurma
    df.fillna(df.median(numeric_only=True), inplace=True)

    print(f"Global temizlik sonrası veri sayısı: {len(df)}")

    #OUTLIER TEMİZLİĞİ
    df_final = remove_outliers_by_model(df)

    print(f"--- SONUÇ RAPORU ---")
    print(f"Başlangıç: {ilk_sayi} araç")
    print(f"Bitiş     : {len(df_final)} araç")
    print(f"Silinen   : {ilk_sayi - len(df_final)} adet gürültülü veri.")

    df_final.to_csv(CIKIS_DOSYASI, index=False)
    print(f" Hazır dosya kaydedildi: {CIKIS_DOSYASI}")


if __name__ == "__main__":
    main()