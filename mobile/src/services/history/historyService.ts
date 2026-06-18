import { api } from "../api/client";
import { PredictionHistoryResponse } from "../../types/history";

export async function getPredictionHistory() {
  const response = await api.get<PredictionHistoryResponse>("/me/predictions");
  return response.data;
}

export async function deletePredictionHistoryItem(predictionId: number) {
  await api.delete(`/me/predictions/${predictionId}`);
}