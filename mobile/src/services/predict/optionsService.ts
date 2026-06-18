import { api } from "../api/client";
import { OptionsResponse } from "../../types/predict";

export async function getMarkaOptions() {
  const response = await api.get<OptionsResponse>("/options");
  return response.data;
}

export async function getSeriOptions(marka: string) {
  const response = await api.get<OptionsResponse>("/options", {
    params: { marka },
  });
  return response.data;
}

export async function getModelOptions(marka: string, seri: string) {
  const response = await api.get<OptionsResponse>("/options", {
    params: { marka, seri },
  });
  return response.data;
}

export async function getModelDetailOptions(
  marka: string,
  seri: string,
  model: string
) {
  const response = await api.get<OptionsResponse>("/options", {
    params: { marka, seri, model },
  });
  return response.data;
}