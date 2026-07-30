"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { useInsights } from "@/components/insights/context";

const COLORS: Record<string, string> = {
  Positive: "var(--success)",
  Neutral: "var(--ink-muted)",
  Negative: "var(--danger)",
};

export default function InsightsSentimentPage() {
  const { data } = useInsights();
  const chartData = data.sentiment.map((s) => ({
    label: s.label,
    share: Number((s.share * 100).toFixed(0)),
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-medium text-ink">Sentiment</h2>
        <p className="text-sm text-ink-muted">
          Heuristic tone of AI answers that mention {data.trackedBrand}.
        </p>
      </div>

      <section className="rounded-[12px] border border-border bg-surface p-5 card-shadow">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis unit="%" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip formatter={(v) => [`${v}%`, "Share"]} />
              <Bar dataKey="share" radius={[4, 4, 0, 0]}>
                {chartData.map((d) => (
                  <Cell key={d.label} fill={COLORS[d.label] ?? "var(--primary)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ul className="mt-4 flex flex-wrap gap-4 text-sm">
          {data.sentiment.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: COLORS[s.label] }}
              />
              <span className="text-ink-muted">{s.label}</span>
              <span className="font-semibold tabular-nums text-ink">
                {(s.share * 100).toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
