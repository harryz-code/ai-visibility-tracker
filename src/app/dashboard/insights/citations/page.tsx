"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import { useInsights } from "@/components/insights/context";
import { DeltaPill, OwnedBadge } from "@/components/insights/badges";
import { ExportButton } from "@/components/insights/export-button";
import { IconClose } from "@/components/icons";
import type { CitationDomain } from "@/lib/demo/insights";

export default function InsightsCitationsPage() {
  const { data, filters } = useInsights();
  const [domain, setDomain] = useState<CitationDomain | null>(null);
  const [mode, setMode] = useState<"share" | "count">("share");

  const chartData = useMemo(
    () =>
      data.citationTimeseries.map((p) => ({
        date: p.date,
        current: p.share,
        previous: filters.vsPrevious ? p.previous : undefined,
      })),
    [data.citationTimeseries, filters.vsPrevious],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-muted">
          See the sources that answer engines are citing to generate responses.
        </p>
        <ExportButton
          label={`Export ${data.citationDomains.length} citations`}
          filename="avt-citations"
          data={data.citationDomains.map((d) => ({
            domain: d.domain,
            share: d.share,
            count: d.count,
            owned: d.owned,
          }))}
          format="csv"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-[12px] border border-border bg-surface p-5 card-shadow lg:col-span-3">
          <h2 className="text-lg font-medium text-ink">Citation Share</h2>
          <p className="text-sm text-ink-muted">
            How often {data.trackedBrand.toLowerCase().replace(/\s+/g, "")}.com
            is cited by AI-generated answers.
          </p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold tabular-nums">
              {(data.citationShare * 100).toFixed(1)}%
            </span>
            <DeltaPill value={data.citationShareDelta} />
          </p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--chart-axis)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--chart-axis)" unit="%" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Current Period"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
                {filters.vsPrevious && (
                  <Line
                    type="monotone"
                    dataKey="previous"
                    name="Previous Period"
                    stroke="var(--ink-muted)"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[12px] border border-border bg-surface p-5 card-shadow lg:col-span-2">
          <p className="text-sm text-ink-muted">Citation Rank</p>
          <p className="mt-1 font-display text-3xl font-semibold">
            #{data.citationRank}
          </p>
          <ul className="mt-4 space-y-2">
            {data.citationDomains.slice(0, 6).map((d, i) => (
              <li key={d.domain}>
                <button
                  type="button"
                  onClick={() => setDomain(d)}
                  className="flex w-full items-center justify-between gap-2 border-b border-border pb-2 text-left text-sm hover:text-primary"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="w-4 text-ink-muted">{i + 1}</span>
                    <span className="truncate font-medium">{d.domain}</span>
                    {d.owned && <OwnedBadge />}
                  </span>
                  <span className="flex items-center gap-2 tabular-nums">
                    {(d.share * 100).toFixed(1)}%
                    <DeltaPill value={d.delta} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-[12px] border border-border bg-surface p-5 card-shadow">
        <h2 className="text-lg font-medium text-ink">Citation Types</h2>
        <p className="text-sm text-ink-muted">
          Citation breakdown over total citations in the selected period by type.
        </p>
        <div className="mt-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.citationTypes.map((t) => ({
                ...t,
                pct: Number((t.share * 100).toFixed(0)),
              }))}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis type="number" unit="%" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="type"
                width={80}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(v, _n, item) => [
                  `${v}% (${(item?.payload as { count?: number })?.count ?? 0})`,
                  "Share",
                ]}
              />
              <Bar
                dataKey="pct"
                name="share"
                fill="var(--chart-you)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {domain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[16px] bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  {domain.domain}
                </h2>
                <p className="mt-1 flex items-baseline gap-2 text-sm">
                  <span className="text-2xl font-semibold tabular-nums">
                    {mode === "share"
                      ? `${(domain.share * 100).toFixed(1)}%`
                      : domain.count}
                  </span>
                  <DeltaPill value={domain.delta} />
                  citation {mode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDomain(null)}
                className="rounded-md p-1 text-ink-muted hover:text-ink"
                aria-label="Close"
              >
                <IconClose size={18} />
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              {(["share", "count"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={
                    mode === m
                      ? "rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                      : "rounded-lg border border-border px-3 py-1.5 text-xs"
                  }
                >
                  {m === "share" ? "Share" : "Count"}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-muted">
              Pages driving citations
            </p>
            <table className="mt-2 w-full text-left text-sm">
              <thead className="text-xs uppercase text-ink-muted">
                <tr>
                  <th className="py-2">Page</th>
                  <th>Share</th>
                  <th>Global</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {domain.pages.map((p, i) => (
                  <tr key={p.url} className="border-t border-border">
                    <td className="max-w-[240px] truncate py-2 font-medium">
                      {i + 1}. {p.url.replace(/^https?:\/\//, "")}
                    </td>
                    <td className="tabular-nums">
                      {p.share}% <DeltaPill value={p.delta} />
                    </td>
                    <td className="tabular-nums text-ink-muted">
                      {p.globalShare}%
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() =>
                          navigator.clipboard?.writeText(p.url)
                        }
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
