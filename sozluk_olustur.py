import joblib
import json

# Encoder dosya yükleme
encoders = joblib.load('label_encoders.pkl')

sozluk = {}
for sutun, encoder in encoders.items():
    # Her sütun için kelime: sayı eşleşmesini oluşturur
    # Örneğin: {"renault": 5, "clio": 2, ...}
    sozluk[sutun] = {str(kelime).lower(): i for i, kelime in enumerate(encoder.classes_)}

# Bu sözlüğü React projenin 'public' klasörüne kaydet
with open('araba-fiyat-frontend/public/sozluk.json', 'w', encoding='utf-8') as f:
    json.dump(sozluk, f, ensure_ascii=False, indent=2)

print("✅ Tüm kelime-sayı eşleşmeleri sozluk.json olarak kaydedildi!")