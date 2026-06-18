export type PredictionHistoryItem = {
  id: number;
  predicted_price: number;
  created_at: string;
  input_json: Record<string, any>;
};

export type PredictionHistoryResponse = PredictionHistoryItem[];