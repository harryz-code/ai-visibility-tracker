"use client";

import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Bar,
  BarChart,
} from "recharts";
import { useInsights } from "@/components/insights/context";
import { DeltaPill, OwnedBadge } from "@/components/insights/badges";
import { EmptyWorkspace } from "@/components/page-header";
import { loadWorkspace } from "@/lib/workspace/storage";
import { useEffect } from "react";

export default function VisibilityPage() {
  const { data, filters } = useInsights();
  const [showPrevious, setShowPrevious] = useState(true);
  const [compareCompetitors, setCompareCompetitors] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hasWorkspace, setHasWorkspace] = useState(true);

  useEffect(() => {
    const ws = loadWorkspace();
    setHasWorkspace(Boolean(ws?.completedOnboarding));
  }, []);

  const chartData = useMemo(() => {
    return data.timeseries.map((t, i) => {
      const prev = data.previousTimeseries[i];
      const row: Record<string, string | number> = {
        date: t.date,
        current: Math.round(
          (t.openai + t.anthropic + t.gemini + t.perplexity) / 4,
        ),
      };
      if (filters.vsPrevious || showPrevious) {
        row.previous = prev
          ? Math.round(
              (prev.openai + prev.anthropic + prev.gemini + prev.perplexity) /
                4,
            )
          : 0;
      }
      if (compareCompetitors) {
        data.visibilityRank
          .filter((r) => !r.owned)
          .slice(0, 2)
          .forEach((r, idx) => {
            row[`comp${idx}`] = Math.max(
              10,
              r.score + ((i % 3) - 1) * 2 - idx * 4,
            );
          });
      }
      return row;
    });
  }, [data, filters.vsPrevious, showPrevious, compareCompetitors]);

  const sovData = data.shareOfVoice.slice(0, 6).map((r) => ({
    brand: r.brand,
    sov: Number((r.shareOfVoice * 100).toFixed(1)),
  }));

  const ranks = expanded
    ? data.visibilityRank
    : data.visibilityRank.slice(0, 5);

  return (
    <div className="space-y-6">
      {!hasWorkspace && (
        <EmptyWorkspace message="You're viewing demo defaults. Complete onboarding to lock brand, industry, and prompts." />
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-[12px] border border-border bg-surface p-5 card-shadow lg:col-span-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm text-ink-muted">Visibility Score</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold tabular-nums text-ink">
                  {data.overallScore}%
                </span>
                <DeltaPill value={data.overallDelta} />
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-ink-body">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={showPrevious || filters.vsPrevious}
                  onChange={(e) => setShowPrevious(e.target.checked)}
                />
                Current / Previous
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={compareCompetitors}
                  onChange={(e) => setCompareCompetitors(e.target.checked)}
                />
                Compare competitors
              </label>
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--chart-axis)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--chart-axis)" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Current Period"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
                {(showPrevious || filters.vsPrevious) && (
                  <Line
                    type="monotone"
                    dataKey="previous"
                    name="Previous Period"
                    stroke="var(--ink-muted)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                )}
                {compareCompetitors &&
                  data.visibilityRank
                    .filter((r) => !r.owned)
                    .slice(0, 2)
                    .map((r, idx) => (
                      <Line
                        key={r.brand}
                        type="monotone"
                        dataKey={`comp${idx}`}
                        name={r.brand}
                        stroke={
                          idx === 0
                            ? "var(--chart-anthropic)"
                            : "var(--chart-gemini)"
                        }
                        strokeWidth={1.5}
                        dot={false}
                      />
                    ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[12px] border border-border bg-surface p-5 card-shadow lg:col-span-2">
          <p className="text-sm text-ink-muted">Visibility Rank</p>
          <p className="mt-1 font-display text-3xl font-semibold text-ink">
            #{data.rank}
          </p>
          <ul className="mt-4 space-y-2">
            {ranks.map((r, i) => (
              <li
                key={r.brand}
                className="flex items-center justify-between gap-2 border-b border-border pb-2 text-sm last:border-0"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="w-5 text-ink-muted">{i + 1}</span>
                  <span className="truncate font-medium text-ink">
                    {r.brand}
                  </span>
                  {r.owned && <OwnedBadge />}
                </span>
                <span className="flex items-center gap-2 tabular-nums">
                  <span className="font-medium text-ink">{r.score}%</span>
                  <DeltaPill value={r.delta} />
                </span>
              </li>
            ))}
          </ul>
          {data.visibilityRank.length > 5 && (
            <button
              type="button"
              className="mt-3 text-sm font-medium text-primary hover:underline"
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          )}
        </section>
      </div>

      <section className="rounded-[12px] border border-border bg-surface p-5 card-shadow">
        <h2 className="text-lg font-medium text-ink">Share of Voice</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Mentions of {data.trackedBrand} in AI-generated answers relative to
          competitors.
        </p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sovData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="brand" tick={{ fontSize: 11 }} stroke="var(--chart-axis)" />
              <YAxis unit="%" tick={{ fontSize: 11 }} stroke="var(--chart-axis)" />
              <Tooltip formatter={(v) => [`${v}%`, "SOV"]} />
              <Bar dataKey="sov" fill="var(--chart-you)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
