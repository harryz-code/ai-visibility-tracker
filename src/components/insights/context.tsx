"use client";

import { createContext, useContext } from "react";
import type { InsightsFilters } from "@/components/insights/filter-bar";
import type { InsightsBundle } from "@/lib/demo/insights";

export type InsightsCtx = {
  data: InsightsBundle;
  filters: InsightsFilters;
  setFilters: (f: InsightsFilters) => void;
};

export const InsightsContext = createContext<InsightsCtx | null>(null);

export function useInsights() {
  const ctx = useContext(InsightsContext);
  if (!ctx) throw new Error("useInsights requires Insights layout");
  return ctx;
}
