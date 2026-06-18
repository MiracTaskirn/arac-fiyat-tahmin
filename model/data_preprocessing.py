import pandas as pd
import os
import re

# DOSYA YOLLARI
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Yeni scraping sonucu oluşan dosya
GIRIS_DOSYASI = os.path.join(BASE_DIR, "araba_verisetim_guncel.csv")

# Backend ve model_training.py bu dosyayı kullanacak.
CIKIS_DOSYASI = os.path.join(BASE_DIR, "araba_verisetim_guncel2026.csv")

# TEMİZLİK AYARLARI
MIN_FIYAT = 200_000
MAX_FIYAT = 30_000_000
MAX_KILOMETRE = 700_000

# Model için gerekli temel kolonlar
ZORUNLU_KOLONLAR = [
    "Marka", "Seri", "Model", "Yıl", "Kilometre", "Vites Tipi",
    "Yakıt Tipi", "Kasa Tipi", "Motor Hacmi", "Motor Gücü",
    "Çekiş", "Boya-değişen", "Fiyat"
]

# Eğitimde kullanmayacağım kolonlar
DROP_COLS = [
    "İlan Tarihi",
    "Motor Hacmi",
    "Motor Gücü",
    "Ort. Yakıt Tüketimi",
    "Yakıt Deposu",
    "Boya-değişen",
    "Araç Durumu",
    "Takasa Uygun",
    "Kimden",
    "Ağır Hasarlı"
]

# YARDIMCI FONKSİYONLAR
def clean_ilan_no(text):
    """
    Örnek:
    'Kopyalandı35834614' -> '35834614'
    'İlan No: 35834614' -> '35834614'
    """
    if pd.isna(text):
        return None

    clean = re.sub(r"\D", "", str(text))

    if clean:
        return clean

    return None


def clean_price(text):
    """
    Fiyatı sayısal hale getirir.
    Örnek:
    '1.250.000 TL' -> 1250000
    """
    if pd.isna(text):
        return None

    if isinstance(text, (int, float)):
        return float(text)

    clean = (
        str(text)
        .replace("TL", "")
        .replace("₺", "")
        .replace(".", "")
        .replace(",", "")
        .strip()
    )

    clean = re.sub(r"[^\d]", "", clean)

    if clean:
        return float(clean)

    return None


def clean_kilometre(text):
    """
    Örnek:
    '125.000 km' -> 125000
    """
    if pd.isna(text):
        return None

    clean = re.sub(r"[^\d]", "", str(text))

    if clean:
        return int(clean)

    return None


def clean_year(text):
    """
    Yıl bilgisini sayısal hale getirir.
    Örnek:
    '2020' -> 2020
    """
    if pd.isna(text):
        return None

    clean = re.sub(r"[^\d]", "", str(text))

    if clean:
        return int(clean)

    return None


def clean_range_value(text):
    """
    Motor hacmi ve motor gücü gibi aralıklı değerleri sayıya çevirir.

    Örnek:
    '1401 - 1600 cm3' -> 1500.5
    '1.6 lt' -> 1600
    '100 HP' -> 100
    '101 - 125 HP' -> 113
    """
    if pd.isna(text):
        return None

    text = str(text).lower().strip()

    if text in ["", "belirtilmemiş", "nan", "none", "-"]:
        return None

    # 1.6 lt gibi değerler
    if "lt" in text:
        text = text.replace("lt", "").strip()
        text = text.replace(",", ".")

        try:
            return float(text) * 1000
        except:
            return None

    text = (
        text
        .replace("hp", "")
        .replace("kw", "")
        .replace("cc", "")
        .replace("cm3", "")
        .replace(".", "")
        .replace(",", ".")
        .strip()
    )

    # 1401 - 1600 gibi aralıklar
    if "-" in text:
        parts = text.split("-")

        try:
            sayi1 = float(re.sub(r"[^\d.]", "", parts[0]))
            sayi2 = float(re.sub(r"[^\d.]", "", parts[1]))
            return (sayi1 + sayi2) / 2
        except:
            return None

    clean = re.sub(r"[^\d.]", "", text)

    if clean:
        try:
            return float(clean)
        except:
            return None

    return None


def parse_damage_info(text):
    """
    Boya-değişen bilgisinden iki ayrı sayısal özellik üretir.

    Örnek:
    '2 boyalı 1 değişen' -> Degisen_Parca=1, Boyali_Parca=2
    'Tamamı boyalı' -> Boyali_Parca=12
    'Orjinal' -> 0, 0
    """
    degisen = 0
    boyali = 0

    if pd.isna(text):
        return 0, 0

    text = str(text).lower().strip()

    if text in ["", "belirtilmemiş", "nan", "none", "-"]:
        return 0, 0

    if "orjinal" in text or "orijinal" in text or "hatasız" in text:
        return 0, 0

    d_match = re.search(r"(\d+)\s*değişen", text)
    if d_match:
        degisen = int(d_match.group(1))

    b_match = re.search(r"(\d+)\s*boyalı", text)
    if b_match:
        boyali = int(b_match.group(1))

    if "tamamı boyalı" in text:
        boyali = 12

    if "tamamı değişen" in text:
        degisen = 12

    return degisen, boyali


def clean_text_columns(df):
    """
    Kategorik kolonlardaki baş/son boşlukları temizler.
    Boş stringleri NaN yapar.
    """
    object_cols = df.select_dtypes(include=["object"]).columns

    for col in object_cols:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace(["", "nan", "None", "NONE"], pd.NA)

    return df


def check_required_columns(df):
    """
    Veri setinde gerekli kolonlar var mı kontrol eder.
    Eksik kolon varsa daha anlaşılır hata verir.
    """
    eksik_kolonlar = [col for col in ZORUNLU_KOLONLAR if col not in df.columns]

    if eksik_kolonlar:
        raise ValueError(
            f"Veri setinde eksik kolonlar var: {eksik_kolonlar}"
        )


def remove_outliers_by_model(df):
    """
    Marka + Model bazında aykırı fiyatları temizler.
    Grup çok küçükse o gruba dokunmaz.
    """
    df_clean = pd.DataFrame()

    grouped = df.groupby(["Marka", "Model"])

    print("Model bazlı aykırı fiyat temizliği yapılıyor...")

    for name, group in grouped:
        if len(group) < 10:
            df_clean = pd.concat([df_clean, group], ignore_index=True)
            continue

        q1 = group["Fiyat"].quantile(0.25)
        q3 = group["Fiyat"].quantile(0.75)
        iqr = q3 - q1

        alt_sinir = q1 - 1.5 * iqr
        ust_sinir = q3 + 1.5 * iqr

        valid_cars = group[
            (group["Fiyat"] >= alt_sinir) &
            (group["Fiyat"] <= ust_sinir)
        ]

        df_clean = pd.concat([df_clean, valid_cars], ignore_index=True)

    return df_clean


def print_missing_report(df, title):
    """
    Eksik veri raporu basar.
    """
    print(f"\n--- {title} ---")
    print(f"Satır sayısı: {len(df)}")
    print("Eksik veri sayıları:")

    missing = df.isna().sum()
    missing = missing[missing > 0].sort_values(ascending=False)

    if len(missing) == 0:
        print("Eksik veri yok.")
    else:
        print(missing)


# ANA PROGRAM
def main():
    print("Veri seti yükleniyor...")

    if not os.path.exists(GIRIS_DOSYASI):
        raise FileNotFoundError(f"Giriş dosyası bulunamadı: {GIRIS_DOSYASI}")

    df = pd.read_csv(GIRIS_DOSYASI)
    ilk_sayi = len(df)

    print(f"Başlangıç veri sayısı: {ilk_sayi}")
    print(f"Kolon sayısı: {len(df.columns)}")

    check_required_columns(df)

    # Metin kolonlarını sadeleştir
    df = clean_text_columns(df)


    # İlan No temizliği
    if "İlan No" in df.columns:
        df["İlan No"] = df["İlan No"].apply(clean_ilan_no)

        onceki_sayi = len(df)
        df = df.drop_duplicates(subset=["İlan No"], keep="first")
        sonraki_sayi = len(df)

        print(f"Duplicate İlan No temizliği: {onceki_sayi - sonraki_sayi} kayıt silindi.")


    # Temel sayısal dönüşümler
    df["Fiyat"] = df["Fiyat"].apply(clean_price)
    df["Kilometre"] = df["Kilometre"].apply(clean_kilometre)
    df["Yıl"] = df["Yıl"].apply(clean_year)

    df["Motor_Hacmi_CC"] = df["Motor Hacmi"].apply(clean_range_value)
    df["Motor_Gucu_HP"] = df["Motor Gücü"].apply(clean_range_value)

    df[["Degisen_Parca", "Boyali_Parca"]] = df["Boya-değişen"].apply(
        lambda x: pd.Series(parse_damage_info(x))
    )

    # Ağır hasarlı araçları çıkarma
    if "Ağır Hasarlı" in df.columns:
        df["Ağır Hasarlı"] = df["Ağır Hasarlı"].fillna("Hayır")
        df = df[df["Ağır Hasarlı"] != "Evet"]


    # Temel temizlik filtreleri
    df = df[
        (df["Fiyat"] > MIN_FIYAT) &
        (df["Fiyat"] < MAX_FIYAT)
    ]

    df = df[df["Kilometre"] < MAX_KILOMETRE]

    # Mantıksız yıl değerlerini çıkarma
    df = df[
        (df["Yıl"] >= 1990) &
        (df["Yıl"] <= 2026)
    ]


    # Eksik temel alanları silme
    df.dropna(
        subset=[
            "Marka",
            "Model",
            "Yıl",
            "Fiyat",
            "Kilometre"
        ],
        inplace=True
    )


    # Kategorik eksikleri doldurma
    kategorik_doldurulacaklar = [
        "Seri",
        "Vites Tipi",
        "Yakıt Tipi",
        "Kasa Tipi",
        "Çekiş",
        "Renk"
    ]

    for col in kategorik_doldurulacaklar:
        if col in df.columns:
            df[col] = df[col].fillna("Belirtilmemiş")

    # Sayısal eksikleri medyan ile doldurma
    sayisal_kolonlar = [
        "Motor_Hacmi_CC",
        "Motor_Gucu_HP",
        "Degisen_Parca",
        "Boyali_Parca"
    ]

    for col in sayisal_kolonlar:
        if col in df.columns:
            df[col] = df[col].fillna(df[col].median())

    print_missing_report(df, "Outlier öncesi veri raporu")

    print(f"\nGlobal temizlik sonrası veri sayısı: {len(df)}")

    
    # Kullanılmayacak kolonları düşür
    df.drop(
        columns=[col for col in DROP_COLS if col in df.columns],
        inplace=True
    )

    
    # Model bazlı aykırı fiyat temizliği
    df_final = remove_outliers_by_model(df)


    # Son düzenlemeler
    df_final = df_final.reset_index(drop=True)

    if "İlan No" in df_final.columns:
        df_final["İlan No"] = df_final["İlan No"].astype(str)

    
    # Sonuç raporu
    print("\n--- SONUÇ RAPORU ---")
    print(f"Başlangıç          : {ilk_sayi} araç")
    print(f"Temizlik sonrası   : {len(df)} araç")
    print(f"Outlier sonrası    : {len(df_final)} araç")
    print(f"Toplam silinen     : {ilk_sayi - len(df_final)} araç")
    print(f"Çıkış dosyası      : {CIKIS_DOSYASI}")

    print("\nSon kolonlar:")
    print(df_final.columns.tolist())

    # Kaydet
    df_final.to_csv(CIKIS_DOSYASI, index=False, encoding="utf-8-sig")

    print("\nHazır dosya kaydedildi.")


if __name__ == "__main__":
    main()