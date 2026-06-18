import React, { createContext, useContext, useMemo, useState } from "react";
import { RecommendationResponse } from "../../types/recommendation";

type RecommendationContextType = {
  recommendationResult: RecommendationResponse | null;
  setRecommendationResult: (data: RecommendationResponse | null) => void;
};

const RecommendationContext = createContext<RecommendationContextType | undefined>(
  undefined
);

export function RecommendationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [recommendationResult, setRecommendationResult] =
    useState<RecommendationResponse | null>(null);

  const value = useMemo(
    () => ({
      recommendationResult,
      setRecommendationResult,
    }),
    [recommendationResult]
  );

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
}

export function useRecommendationResult() {
  const context = useContext(RecommendationContext);

  if (!context) {
    throw new Error(
      "useRecommendationResult must be used within RecommendationProvider"
    );
  }

  return context;
}