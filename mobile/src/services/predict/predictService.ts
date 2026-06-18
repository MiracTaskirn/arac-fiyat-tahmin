import { api } from "../api/client";
import { PredictForm, PredictResult } from "../../types/predict";

export async function predictPrice(form: PredictForm) {
  const payload = {
    Marka: form.Marka,
    Seri: form.Seri,
    Model: form.Model,
    Yıl: Number(form["Yıl"]),
    Kilometre: Number(form.Kilometre),
    "Vites Tipi": form["Vites Tipi"],
    "Yakıt Tipi": form["Yakıt Tipi"],
    "Kasa Tipi": form["Kasa Tipi"],
    Renk: form.Renk,
    Çekiş: form.Çekiş,
    Motor_Hacmi_CC: Number(form.Motor_Hacmi_CC),
    Motor_Gucu_HP: Number(form.Motor_Gucu_HP),
    Degisen_Parca: Number(form.Degisen_Parca),
    Boyali_Parca: Number(form.Boyali_Parca),
  };

  const response = await api.post<PredictResult>("/predict", payload, {
    params: { strict: false },
  });

  return response.data;
}