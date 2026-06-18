import { api } from "../api/client";
import {
  RecommendationForm,
  RecommendationResponse,
} from "../../types/recommendation";

function toNumberOrNull(value: string) {
  if (!value) return null;
  const cleaned = value.replace(/\./g, "").trim();
  if (!cleaned) return null;
  return Number(cleaned);
}

function toChoiceForBackend(value: string) {
  if (!value) return "Fark etmez";
  return value;
}

export async function getRecommendations(payload: RecommendationForm) {
  const body = {
    budget_min: toNumberOrNull(payload.budget_min),
    budget_max: toNumberOrNull(payload.budget_max),
    year_min: toNumberOrNull(payload.year_min),
    year_max: toNumberOrNull(payload.year_max),
    km_min: toNumberOrNull(payload.km_min),
    km_max: toNumberOrNull(payload.km_max),
    vites: toChoiceForBackend(payload.vites),
    yakit: toChoiceForBackend(payload.yakit),
    kasa: toChoiceForBackend(payload.kasa),
  };

  console.log("RECOMMENDATION REQUEST BODY:", body);

  const response = await api.post<RecommendationResponse>(
    "/recommendations/wizard",
    body
  );

  return response.data;
}