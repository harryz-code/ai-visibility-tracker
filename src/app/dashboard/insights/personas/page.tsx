"use client";

import { useInsights } from "@/components/insights/context";
import { BetaBadge, DeltaPill } from "@/components/insights/badges";

export default function InsightsPersonasPage() {
  const { data } = useInsights();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-medium text-ink">Personas</h2>
        <BetaBadge />
      </div>
      <p className="text-sm text-ink-muted">
        How answer engines surface your brand across buyer personas (fixture).
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.personas.map((p) => (
          <article
            key={p.id}
            className="rounded-[12px] border border-border bg-surface p-5 card-shadow"
          >
            <h3 className="font-semibold text-ink">{p.name}</h3>
            <p className="mt-1 text-sm text-ink-muted">{p.description}</p>
            <p className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold tabular-nums">
                {p.score}%
              </span>
              <DeltaPill value={p.delta} />
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
