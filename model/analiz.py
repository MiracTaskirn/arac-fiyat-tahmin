import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
import os

MODEL_PATH = "best_model.pkl"

COLUMNS = [
    'Marka', 'Seri', 'Model', 'Yıl', 'Kilometre', 'Vites Tipi', 'Yakıt Tipi',
    'Kasa Tipi', 'Renk', 'Çekiş', 'Motor_Hacmi_CC', 'Motor_Gucu_HP',
    'Degisen_Parca', 'Boyali_Parca'
]

def main():
    if not os.path.exists(MODEL_PATH):
        print("Model dosyası bulunamadı!")
        return

    model = joblib.load(MODEL_PATH)

    # Özellik Önem Skorlarını Alma
    try:
        importance = model.feature_importances_
    except:
        print("Bu model özellik önemini desteklemiyor.")
        return

    # DataFrame oluşturma
    feature_importance_df = pd.DataFrame({
        'Özellik': COLUMNS,
        'Önem Skoru': importance
    })

    # Sırala (En önemliden en aza)
    feature_importance_df = feature_importance_df.sort_values(by='Önem Skoru', ascending=False)

    print("\n--- MODELİN GÖZÜNDE EN ÖNEMLİ KRİTERLER ---")
    print(feature_importance_df)

    # GRAFİK ÇİZ
    plt.figure(figsize=(10, 6))
    sns.barplot(x='Önem Skoru', y='Özellik', data=feature_importance_df, hue='Özellik', palette='viridis', legend=False)
    plt.title('Araba Fiyatını Etkileyen En Önemli Faktörler')
    plt.xlabel('Etki Gücü (Importance Score)')
    plt.ylabel('Özellikler')
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    main()