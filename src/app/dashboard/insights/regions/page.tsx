"use client";

import { useInsights } from "@/components/insights/context";
import { DeltaPill } from "@/components/insights/badges";

export default function InsightsRegionsPage() {
  const { data } = useInsights();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-ink">Regions</h2>
        <p className="text-sm text-ink-muted">
          Market-level visibility scores (fixture markets; workspace default first).
        </p>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-border bg-surface card-shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-3">Market</th>
              <th>Visibility Score</th>
              <th>vs Previous</th>
            </tr>
          </thead>
          <tbody>
            {data.regions.map((r) => (
              <tr key={r.market} className="border-t border-border">
                <td className="px-4 py-3 font-medium text-ink">{r.market}</td>
                <td className="tabular-nums font-semibold">{r.score}%</td>
                <td>
                  <DeltaPill value={r.delta} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
