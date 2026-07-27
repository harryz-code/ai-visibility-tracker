"use client";

import { useEffect, useState } from "react";
import { loadWorkspace } from "@/lib/workspace/storage";
import {
  getPersonalizedDemo,
  type PersonalizedDemo,
} from "@/lib/demo/personalized";
import {
  CompetitorOverlayChart,
  MentionRateBarChart,
  ScoreTimeseriesChart,
} from "@/components/charts";
import { EmptyWorkspace, KpiStrip, PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  const [data, setData] = useState<PersonalizedDemo | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ws = loadWorkspace();
    setData(getPersonalizedDemo(ws));
    setReady(true);
  }, []);

  if (!ready || !data) {
    return (
      <div className="p-10 text-sm text-ink-muted">Loading demo metrics…</div>
    );
  }

  const ws = typeof window !== "undefined" ? loadWorkspace() : null;
  const overall = Math.round(
    data.perModel.reduce((s, m) => s + m.visibilityScore, 0) /
      Math.max(1, data.perModel.length),
  );
  const avgMention =
    data.perModel.reduce((s, m) => s + m.mentionRate, 0) /
    Math.max(1, data.perModel.length);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
      <PageHeader
        title={`${data.trackedBrand} visibility`}
        subtitle={`${data.category.name} · ${data.category.market}. Wilson 95% CIs on rates.`}
      />

      {!ws?.completedOnboarding && (
        <EmptyWorkspace message="You're viewing demo defaults. Complete onboarding to lock brand, industry, and prompts." />
      )}

      <KpiStrip
        items={[
          { label: "Visibility score", value: String(overall) },
          {
            label: "Avg mention rate",
            value: `${(avgMention * 100).toFixed(0)}%`,
          },
          {
            label: "Prompts",
            value: String(data.promptResults.length),
          },
          {
            label: "Competitors",
            value: String(
              data.competitors.filter((c) => c.brand !== data.trackedBrand)
                .length,
            ),
          },
        ]}
      />

      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-medium text-ink">Score over time</h2>
        <ScoreTimeseriesChart data={data.timeseries} />
      </section>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-medium text-ink">Mention rate by model</h2>
        <MentionRateBarChart data={data.perModel} />
      </section>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-medium text-ink">Competitors</h2>
        <CompetitorOverlayChart
          data={data.competitors.slice(0, 6).map((c) => ({
            brand: c.brand,
            score: c.overallScore,
            rate: c.mentionRate,
            ciLow: c.ciLow,
            ciHigh: c.ciHigh,
          }))}
        />
      </section>
    </main>
  );
}
