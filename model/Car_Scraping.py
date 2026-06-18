import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import os

SAYFA_BASI = 1
SAYFA_SONU = 50

KAYIT_DOSYASI = "araba_verisetim_guncel.csv"

# Çekilecek kategoriler
KATEGORILER = [
    "otomobil",
    "arazi-suv-pick-up"
]

# SÜTUN KAYMASINI ENGELLEME
MASTER_COLUMNS = [
    "İlan No", "İlan Tarihi", "Marka", "Seri", "Model", "Yıl",
    "Kilometre", "Vites Tipi", "Yakıt Tipi", "Kasa Tipi", "Renk",
    "Motor Hacmi", "Motor Gücü", "Çekiş", "Ort. Yakıt Tüketimi",
    "Yakıt Deposu", "Boya-değişen", "Takasa Uygun", "Kimden",
    "Araç Durumu", "Fiyat"
]

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/121.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7"
}

# YARDIMCI FONKSİYONLAR
def normalize_url(href):
    """Göreli linki tam arabam.com linkine çevirir."""
    if not href:
        return None

    if href.startswith("http"):
        return href

    if href.startswith("/"):
        return "https://www.arabam.com" + href

    return "https://www.arabam.com/" + href


def get_fallback_brands(kategori):
    """
    Marka listesi otomatik çekilemezse kullanılacak yedek marka listesi.
    Kategoriye göre ayrı tuttum.
    """
    otomobil_markalari = [
        "fiat", "renault", "volkswagen", "ford", "bmw", "mercedes-benz",
        "audi", "peugeot", "opel", "toyota", "honda", "hyundai",
        "citroen", "dacia", "kia", "skoda", "seat", "nissan",
        "chevrolet", "volvo", "mini", "mazda", "mitsubishi"
    ]

    suv_pickup_markalari = [
        "dacia", "nissan", "volkswagen", "toyota", "hyundai", "kia",
        "peugeot", "citroen", "ford", "jeep", "land-rover",
        "range-rover", "bmw", "mercedes-benz", "audi", "volvo",
        "skoda", "seat", "renault", "fiat", "mitsubishi",
        "suzuki", "ssangyong", "isuzu"
    ]

    if kategori == "arazi-suv-pick-up":
        return suv_pickup_markalari

    return otomobil_markalari


def get_all_brands(kategori):
    """
    Verilen kategori için sol menüden markaları otomatik bulur.

    Örnek:
    kategori = "otomobil"
    kategori = "arazi-suv-pick-up"
    """
    print(f"\n[{kategori}] marka listesi taranıyor...")

    yedek_liste = get_fallback_brands(kategori)

    try:
        url = f"https://www.arabam.com/ikinci-el/{kategori}"
        response = requests.get(url, headers=HEADERS, timeout=15)

        if response.status_code != 200:
            print(f"[{kategori}] marka sayfası okunamadı. Status: {response.status_code}")
            print(f"[{kategori}] yedek marka listesi kullanılacak.")
            return yedek_liste

        soup = BeautifulSoup(response.text, "html.parser")

        markalar = []

        # Sol menü yapısı
        category_container = soup.find(class_="category-facet")

        if category_container:
            links = category_container.find_all("a")

            for link in links:
                href = link.get("href")

                if href and f"/ikinci-el/{kategori}/" in href:
                    marka_slug = href.split("/")[-1].split("?")[0].strip()

                    if (
                        len(marka_slug) > 1
                        and marka_slug not in markalar
                        and "page=" not in marka_slug
                    ):
                        markalar.append(marka_slug)

        if len(markalar) < 5:
            print(f"[{kategori}] otomatik marka sayısı az bulundu.")
            print(f"[{kategori}] yedek marka listesi kullanılacak.")
            return yedek_liste

        print(f"[{kategori}] {len(markalar)} adet marka otomatik bulundu.")
        return markalar

    except Exception as e:
        print(f"[{kategori}] marka tarama hatası: {e}")
        print(f"[{kategori}] yedek marka listesi kullanılacak.")
        return yedek_liste


def get_listing_urls(kategori, marka, page_number, max_retry=3):
    """
    Kategori + marka + sayfa bazlı ilan linklerini toplar.
    Timeout olursa aynı sayfayı birkaç kez tekrar dener.
    """
    url = f"https://www.arabam.com/ikinci-el/{kategori}/{marka}?page={page_number}"

    for deneme in range(1, max_retry + 1):
        try:
            time.sleep(random.uniform(1.0, 2.0))

            response = requests.get(url, headers=HEADERS, timeout=25)

            if response.status_code != 200:
                print(f"   Sayfa okunamadı: {url} | Status: {response.status_code}")
                time.sleep(random.uniform(2.0, 4.0))
                continue

            soup = BeautifulSoup(response.text, "html.parser")
            list_items = soup.find_all(class_="listing-list-item")

            urls = []

            for item in list_items:
                link_tag = item.find("a", class_="link-overlay")

                if not link_tag:
                    link_tag = item.find("a")

                if link_tag and link_tag.get("href"):
                    full_link = normalize_url(link_tag.get("href"))

                    if full_link and full_link not in urls:
                        urls.append(full_link)

            return urls

        except Exception as e:
            print(f"   Deneme {deneme}/{max_retry} başarısız: {url} | Hata: {e}")
            time.sleep(random.uniform(3.0, 6.0))

    print(f"   Sayfa {max_retry} denemeden sonra alınamadı: {url}")
    return []

def get_car_details(url):
    """Verilen ilanın detaylarını çeker."""
    try:
        time.sleep(random.uniform(0.4, 1.0))

        response = requests.get(url, headers=HEADERS, timeout=15)

        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, "html.parser")

        car_info = {}

        # Fiyat bilgisi
        price_found = False

        price_div = soup.find(class_="desktop-information-price")

        if price_div:
            clean_price = (
                price_div
                .get_text(strip=True)
                .replace("TL", "")
                .replace(".", "")
                .replace(",", "")
                .strip()
            )

            if clean_price.isdigit():
                car_info["Fiyat"] = float(clean_price)
                price_found = True

        if not price_found:
            return None

        # İlan özellikleri
        prop_items = soup.find_all(
            ["li", "div"],
            class_=["property-item", "product-property-item"]
        )

        for item in prop_items:
            key_tag = item.find(class_=["property-key", "title"])
            val_tag = item.find(class_=["property-value", "value"])

            if key_tag and val_tag:
                key = key_tag.get_text(strip=True).replace(":", "")
                val = val_tag.get_text(strip=True)

                if key:
                    car_info[key] = val

        return car_info

    except Exception:
        return None


def save_cars_to_csv(local_cars):
    """Toplanan araçları CSV dosyasına ekler."""
    if not local_cars:
        return 0

    df = pd.DataFrame(local_cars)

    for col in MASTER_COLUMNS:
        if col not in df.columns:
            df[col] = None

    df = df[MASTER_COLUMNS]

    header_status = not os.path.isfile(KAYIT_DOSYASI)

    df.to_csv(
        KAYIT_DOSYASI,
        mode="a",
        index=False,
        header=header_status,
        encoding="utf-8-sig"
    )

    return len(df)


def clean_duplicates():
    """
    Scraping sonunda aynı ilanlar tekrar geldiyse temizler.
    """
    if not os.path.exists(KAYIT_DOSYASI):
        return

    try:
        df = pd.read_csv(KAYIT_DOSYASI)

        onceki_sayi = len(df)

        if "İlan No" in df.columns:
            df["İlan No"] = (
                df["İlan No"]
                .astype(str)
                .str.replace("Kopyalandı", "", regex=False)
                .str.replace(r"\D", "", regex=True)
                .str.strip()
            )

            df = df.drop_duplicates(subset=["İlan No"], keep="first")
        else:
            df = df.drop_duplicates(keep="first")

        sonraki_sayi = len(df)

        df.to_csv(KAYIT_DOSYASI, index=False, encoding="utf-8-sig")

        print("\nDuplicate temizliği tamamlandı.")
        print(f"Önceki kayıt sayısı : {onceki_sayi}")
        print(f"Sonraki kayıt sayısı: {sonraki_sayi}")
        print(f"Silinen tekrar kayıt: {onceki_sayi - sonraki_sayi}")

    except Exception as e:
        print(f"Duplicate temizliği sırasında hata oluştu: {e}")


# ANA PROGRAM
def main():
    if os.path.exists(KAYIT_DOSYASI):
        print(f"Uyarı: {KAYIT_DOSYASI} zaten var.")
        print("Bu dosyaya ekleme yapılacak.")
        print("Temiz başlamak istiyorsan önce bu dosyayı sil.\n")

    genel_toplam = 0

    for kategori in KATEGORILER:
        tum_markalar = get_all_brands(kategori)

        print(f"\n==========================================")
        print(f"KATEGORİ: {kategori.upper()}")
        print(f"TOPLAM {len(tum_markalar)} MARKA TARANACAK")
        print(f"==========================================\n")

        for marka in tum_markalar:
            print(f"[{kategori.upper()}] MARKA: {marka.upper()} işleniyor...")

            local_cars = []

            for page in range(SAYFA_BASI, SAYFA_SONU + 1):
                print(f"   Sayfa {page} taranıyor...")

                urls = get_listing_urls(kategori, marka, page)

                if not urls:
                    print(f"   Sayfa {page} boş geldi. Bu marka için geçiliyor.")
                    break

                print(f"   {len(urls)} ilan linki bulundu.")

                for link in urls:
                    data = get_car_details(link)

                    if data:
                        local_cars.append(data)
                        print(
                            f"      + {marka.upper()} | "
                            f"Fiyat: {data.get('Fiyat', 0)}"
                        )

            kaydedilen = save_cars_to_csv(local_cars)
            genel_toplam += kaydedilen

            print(
                f"[{kategori.upper()}] {marka.upper()} bitti -> "
                f"{kaydedilen} araç kaydedildi.\n"
            )

    clean_duplicates()

    print("\nTÜM İŞLEMLER TAMAMLANDI.")
    print(f"Toplam kaydedilen araç sayısı: {genel_toplam}")
    print(f"Çıktı dosyası: {KAYIT_DOSYASI}")


if __name__ == "__main__":
    main()