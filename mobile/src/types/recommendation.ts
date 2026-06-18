export type RecommendationForm = {
  budget_min: string;
  budget_max: string;
  year_min: string;
  year_max: string;
  km_min: string;
  km_max: string;
  vites: string;
  yakit: string;
  kasa: string;
};

export type RecommendationItem = {
  car_name?: string;
  title?: string;
  score?: number;
  similarity_score?: number;
  uygunluk_yuzdesi?: number;
  price?: number;
  actual_price?: number;
  predicted_price?: number;
  fiyat?: number;
  tahmin_fiyat?: number;
  price_diff?: number;
  fiyat_farki?: number;
  is_opportunity?: boolean;
  opportunity?: boolean;
  year?: number;
  km?: number;
  transmission?: string;
  fuel_type?: string;
  body_type?: string;
  [key: string]: any;
};

export type RecommendationResponse = {
  total_found?: number;
  returned_count?: number;
  total_count?: number;
  total_matches?: number;
  recommendations?: RecommendationItem[];
  results?: RecommendationItem[];
  note?: string;
};

export const DEFAULT_RECOMMENDATION_FORM: RecommendationForm = {
  budget_min: "",
  budget_max: "",
  year_min: "",
  year_max: "",
  km_min: "",
  km_max: "",
  vites: "",
  yakit: "",
  kasa: "",
};

export const VITES_OPTIONS = ["Düz", "Otomatik", "Yarı Otomatik", "Fark etmez"];
export const YAKIT_OPTIONS = ["Benzin", "Dizel", "Elektrik", "Hibrit", "Fark etmez"];
export const KASA_OPTIONS = ["Sedan", "Hatchback/5", "SUV", "Fark etmez"];