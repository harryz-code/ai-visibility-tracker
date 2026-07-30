"use client";

import { MentionRateBarChart } from "@/components/charts";
import { useInsights } from "@/components/insights/context";
import { DeltaPill } from "@/components/insights/badges";
import { ModelBadge } from "@/components/model-badge";

export default function InsightsPlatformsPage() {
  const { data } = useInsights();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-ink">Platforms</h2>
        <p className="text-sm text-ink-muted">
          Visibility by answer engine for {data.trackedBrand}.
        </p>
      </div>

      <section className="rounded-[12px] border border-border bg-surface p-5 card-shadow">
        <MentionRateBarChart data={data.perModel} />
      </section>

      <ul className="grid gap-3 sm:grid-cols-2">
        {data.perModel.map((m, i) => (
          <li
            key={m.model}
            className="flex items-center justify-between rounded-[12px] border border-border bg-surface px-4 py-3"
          >
            <ModelBadge model={m.model} showLabel />
            <div className="text-right">
              <p className="font-display text-xl font-semibold tabular-nums text-ink">
                {m.visibilityScore}%
              </p>
              <DeltaPill value={Number((((i % 5) - 2) * 0.7).toFixed(1))} />
              <p className="mt-0.5 text-xs text-ink-muted">
                Mention rate {(m.mentionRate * 100).toFixed(0)}%
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
