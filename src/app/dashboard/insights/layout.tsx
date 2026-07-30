"use client";

import { useEffect, useMemo, useState } from "react";
import { DemoBadge } from "@/components/brand";
import { InsightsTabs } from "@/components/insights/insights-tabs";
import {
  InsightsFilterBar,
  type InsightsFilters,
} from "@/components/insights/filter-bar";
import { ExportButton } from "@/components/insights/export-button";
import { InsightsContext } from "@/components/insights/context";
import {
  getInsightsBundle,
  modelLabel,
  type InsightsBundle,
} from "@/lib/demo/insights";
import { loadWorkspace } from "@/lib/workspace/storage";

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filters, setFilters] = useState<InsightsFilters>({
    range: "7d",
    vsPrevious: true,
    topic: "all",
    platform: "all",
  });
  const [data, setData] = useState<InsightsBundle | null>(null);

  useEffect(() => {
    setData(getInsightsBundle(loadWorkspace(), filters.range));
  }, [filters.range]);

  const platforms = useMemo(
    () =>
      (data?.selectedModels ?? []).map((m) => ({
        id: m,
        label: modelLabel(m),
      })),
    [data?.selectedModels],
  );

  if (!data) {
    return (
      <div className="p-10 text-sm text-ink-muted">Loading insights…</div>
    );
  }

  return (
    <InsightsContext.Provider value={{ data, filters, setFilters }}>
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-6 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <DemoBadge />
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                Answer Engine Insights
              </p>
            </div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              {data.trackedBrand}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Track how often your brand appears in AI-generated answers.
            </p>
          </div>
          <ExportButton
            label={`Export ${data.promptResults.length} answers`}
            filename={`avt-answers-${data.trackedBrand.toLowerCase()}`}
            data={data.promptResults}
          />
        </div>
        <InsightsTabs />
        <InsightsFilterBar
          value={filters}
          onChange={setFilters}
          topics={data.topicGroups.map((t) => t.topic)}
          platforms={platforms}
        />
        {children}
      </div>
    </InsightsContext.Provider>
  );
}
