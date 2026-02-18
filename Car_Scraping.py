import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import os

SAYFA_BASI = 1
SAYFA_SONU = 50  # Her markadan 50 sayfa çeker
KAYIT_DOSYASI = "araba_verisetim_final.csv"

# SÜTUN KAYMASINI ENGELLEME
MASTER_COLUMNS = [
    "İlan No", "İlan Tarihi", "Marka", "Seri", "Model", "Yıl",
    "Kilometre", "Vites Tipi", "Yakıt Tipi", "Kasa Tipi", "Renk",
    "Motor Hacmi", "Motor Gücü", "Çekiş", "Ort. Yakıt Tüketimi",
    "Yakıt Deposu", "Boya-değişen", "Takasa Uygun", "Kimden",
    "Araç Durumu", "Fiyat"
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def get_all_brands():
    """Siteye girip sol menüden markaları otomatik bulur."""
    print("Marka listesi taranıyor...")
    # Otomatik bulamazsa diye en popüler markalar listesi (Yedek)
    yedek_liste = [
        "fiat", "renault", "volkswagen", "ford", "bmw", "mercedes-benz",
        "audi", "peugeot", "opel", "toyota", "honda", "hyundai", "citroen", "dacia",
        "kia", "skoda", "seat", "nissan", "chevrolet"
    ]

    try:
        url = "https://www.arabam.com/ikinci-el/otomobil"
        response = requests.get(url, headers=HEADERS, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')

        markalar = []
        # Sol menü yapısı
        category_container = soup.find(class_='category-facet')

        if category_container:
            links = category_container.find_all('a')
            for link in links:
                href = link.get('href')
                if href and '/ikinci-el/otomobil/' in href:
                    marka_slug = href.split('/')[-1].split('?')[0]
                    if len(marka_slug) > 1 and marka_slug not in markalar:
                        markalar.append(marka_slug)

        if len(markalar) < 5:
            return yedek_liste

        print(f"{len(markalar)} adet marka otomatik bulundu!")
        return markalar

    except Exception as e:
        print(f"Marka tarama hatası, yedek liste kullanılıyor: {e}")
        return yedek_liste


def get_listing_urls(marka, page_number):
    """Marka bazlı link toplama."""
    url = f"https://www.arabam.com/ikinci-el/otomobil/{marka}?page={page_number}"

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200: return []

        soup = BeautifulSoup(response.text, 'html.parser')
        list_items = soup.find_all(class_='listing-list-item')

        urls = []
        for item in list_items:
            link_tag = item.find('a', class_='link-overlay')
            if not link_tag: link_tag = item.find('a')

            if link_tag and link_tag.get('href'):
                full_link = "https://www.arabam.com" + link_tag['href']
                urls.append(full_link)
        return urls
    except:
        return []


def get_car_details(url):
    """Verilen ilanın detaylarını çeker."""
    try:
        time.sleep(random.uniform(0.2, 0.5))
        response = requests.get(url, headers=HEADERS, timeout=10)
        if response.status_code != 200: return None

        soup = BeautifulSoup(response.text, 'html.parser')
        car_info = {}

        price_found = False

        price_div = soup.find(class_='desktop-information-price')

        if price_div:
            clean_price = price_div.get_text(strip=True).replace("TL", "").replace(".", "").replace(",", "").strip()
            if clean_price.isdigit():
                car_info['Fiyat'] = float(clean_price)
                price_found = True

        if not price_found: return None

        prop_items = soup.find_all(['li', 'div'], class_=['property-item', 'product-property-item'])
        for item in prop_items:
            key_tag = item.find(class_=['property-key', 'title'])
            val_tag = item.find(class_=['property-value', 'value'])

            if key_tag and val_tag:
                key = key_tag.get_text(strip=True).replace(":", "")
                val = val_tag.get_text(strip=True)
                car_info[key] = val

        return car_info

    except Exception:
        return None

def main():
    tum_markalar = get_all_brands()

    if os.path.exists(KAYIT_DOSYASI):
        print(f"Uyarı: {KAYIT_DOSYASI} dosyasına ekleme yapılacak.")

    print(f"\nTOPLAM {len(tum_markalar)} MARKA TARANACAK.\n")

    for marka in tum_markalar:
        print(f" MARKA: {marka.upper()} işleniyor...")
        local_cars = []

        for page in range(SAYFA_BASI, SAYFA_SONU + 1):
            urls = get_listing_urls(marka, page)
            if not urls: break

            for link in urls:
                data = get_car_details(link)
                if data:
                    local_cars.append(data)
                    print(f"   + {marka.upper()} | Fiyat: {data.get('Fiyat', 0)}")

        if local_cars:
            df = pd.DataFrame(local_cars)

            for col in MASTER_COLUMNS:
                if col not in df.columns:
                    df[col] = None

            df = df[MASTER_COLUMNS]

            # Dosyaya ekle
            header_status = not os.path.isfile(KAYIT_DOSYASI)
            df.to_csv(KAYIT_DOSYASI, mode='a', index=False, header=header_status)
            print(f" {marka.upper()} bitti -> {len(local_cars)} araç kaydedildi.\n")

    print(" TÜM İŞLEMLER TAMAMLANDI.")

if __name__ == "__main__":
    main()