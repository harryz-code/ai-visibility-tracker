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

export default function DashboardPage() {
  const [data, setData] = useState<PersonalizedDemo | null>(null);

  useEffect(() => {
    setData(getPersonalizedDemo(loadWorkspace()));
  }, []);

  if (!data) {
    return (
      <div className="p-10 text-sm text-zinc-500">Loading demo metrics…</div>
    );
  }

  const overall = Math.round(
    data.perModel.reduce((s, m) => s + m.visibilityScore, 0) /
      data.perModel.length,
  );

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            {data.category.name} · {data.category.market}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
            {data.trackedBrand} visibility
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            Demo metrics with Wilson 95% CIs. Complete onboarding to personalize
            prompts and competitors.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4 text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            AI Visibility Score
          </p>
          <p className="text-4xl font-semibold tabular-nums text-zinc-900">
            {overall}
          </p>
          <p className="text-xs text-zinc-400">
            Category median {data.benchmarkMedian}
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-medium text-zinc-900">Score over time</h2>
        <ScoreTimeseriesChart data={data.timeseries} />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-medium text-zinc-900">
          Mention rate by model
        </h2>
        <MentionRateBarChart data={data.perModel} />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-medium text-zinc-900">Competitors</h2>
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
