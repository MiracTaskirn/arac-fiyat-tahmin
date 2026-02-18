import joblib

# Senin encoder dosyanı yüklüyoruz
encoders = joblib.load('label_encoders.pkl')

for sutun, encoder in encoders.items():
    print(f"\n--- {sutun} Seçenekleri ---")
    # Sayıların hangi kelimelere denk geldiğini listeliyoruz
    for i, kelime in enumerate(encoder.classes_):
        print(f"{i}: {kelime}")