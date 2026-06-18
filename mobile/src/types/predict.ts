export type PredictForm = {
  Marka: string;
  Seri: string;
  Model: string;
  Yıl: string;
  Kilometre: string;
  "Vites Tipi": string;
  "Yakıt Tipi": string;
  "Kasa Tipi": string;
  Renk: string;
  Çekiş: string;
  Motor_Hacmi_CC: string;
  Motor_Gucu_HP: string;
  Degisen_Parca: string;
  Boyali_Parca: string;
};

export type PredictResult = {
  tahmini_fiyat: number;
};

export type OptionsResponse = {
  Marka?: string[];
  Seri?: string[];
  Model?: string[];
  "Vites Tipi"?: string[];
  "Yakıt Tipi"?: string[];
  "Kasa Tipi"?: string[];
  Renk?: string[];
  Çekiş?: string[];
  Motor_Hacmi_CC?: number[];
  Motor_Gucu_HP?: number[];
};

export const DEFAULT_PREDICT_FORM: PredictForm = {
  Marka: "",
  Seri: "",
  Model: "",
  Yıl: "",
  Kilometre: "",
  "Vites Tipi": "",
  "Yakıt Tipi": "",
  "Kasa Tipi": "",
  Renk: "",
  Çekiş: "",
  Motor_Hacmi_CC: "",
  Motor_Gucu_HP: "",
  Degisen_Parca: "0",
  Boyali_Parca: "0",
};