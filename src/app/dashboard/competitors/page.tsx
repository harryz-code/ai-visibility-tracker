"use client";

import { useEffect, useState } from "react";
import { loadWorkspace } from "@/lib/workspace/storage";
import {
  getPersonalizedDemo,
  type PersonalizedDemo,
} from "@/lib/demo/personalized";
import { CompetitorOverlayChart } from "@/components/charts";

export default function CompetitorsPage() {
  const [data, setData] = useState<PersonalizedDemo | null>(null);
  useEffect(() => {
    setData(getPersonalizedDemo(loadWorkspace()));
  }, []);
  if (!data) return null;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Competitors</h1>
        <p className="text-sm text-ink-muted">
          Category overlay for {data.trackedBrand}. Scores are fixture-based.
        </p>
      </div>
      <section className="rounded-lg border border-border bg-surface p-6">
        <CompetitorOverlayChart
          data={data.competitors.map((c) => ({
            brand: c.brand,
            score: c.overallScore,
            rate: c.mentionRate,
            ciLow: c.ciLow,
            ciHigh: c.ciHigh,
          }))}
        />
        <table className="mt-6 w-full text-left text-sm">
          <thead className="text-xs uppercase text-ink-muted">
            <tr>
              <th className="py-2">Brand</th>
              <th>Score</th>
              <th>Mention rate</th>
              <th>95% CI</th>
            </tr>
          </thead>
          <tbody>
            {data.competitors.map((c) => (
              <tr key={c.brand} className="border-t border-border">
                <td className="py-2 font-medium">
                  {c.brand}
                  {c.brand === data.trackedBrand && (
                    <span className="ml-2 text-xs text-primary">You</span>
                  )}
                </td>
                <td>{c.overallScore}</td>
                <td>{(c.mentionRate * 100).toFixed(1)}%</td>
                <td className="text-ink-muted">
                  {(c.ciLow * 100).toFixed(1)}–{(c.ciHigh * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
