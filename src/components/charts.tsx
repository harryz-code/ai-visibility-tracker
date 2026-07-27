"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ErrorBar,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ModelMetricPoint, TimeseriesPoint } from "@/lib/demo/data";

export function ScoreTimeseriesChart({ data }: { data: TimeseriesPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--chart-axis)" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--chart-axis)" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="openai" name="OpenAI" stroke="var(--chart-openai)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="anthropic" name="Anthropic" stroke="var(--chart-anthropic)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="gemini" name="Gemini" stroke="var(--chart-gemini)" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="perplexity" name="Perplexity" stroke="var(--chart-perplexity)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MentionRateBarChart({ data }: { data: ModelMetricPoint[] }) {
  const chartData = data.map((d) => ({
    model: d.model,
    rate: Number((d.mentionRate * 100).toFixed(1)),
    // Asymmetric Wilson CI distances from the point estimate
    error: [
      Number(((d.mentionRate - d.ciLow) * 100).toFixed(1)),
      Number(((d.ciHigh - d.mentionRate) * 100).toFixed(1)),
    ] as [number, number],
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="model" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            stroke="#a1a1aa"
            unit="%"
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Mention rate"]}
            labelFormatter={(l) => String(l)}
          />
          <Bar dataKey="rate" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Mention rate">
            <ErrorBar
              dataKey="error"
              direction="y"
              width={4}
              strokeWidth={1.5}
              stroke="#71717a"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-zinc-500">
        Whiskers approximate Wilson 95% CI (upper error shown). Rates from multi-sample waves.
      </p>
    </div>
  );
}

export function CompetitorOverlayChart({
  data,
}: {
  data: { brand: string; score: number; rate: number; ciLow: number; ciHigh: number }[];
}) {
  const chartData = data.map((d) => ({
    brand: d.brand,
    score: d.score,
    error: [
      Number(((d.rate - d.ciLow) * 100).toFixed(1)),
      Number(((d.ciHigh - d.rate) * 100).toFixed(1)),
    ] as [number, number],
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="brand" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#a1a1aa" />
          <Tooltip />
          <Bar dataKey="score" fill="#3f3f46" radius={[4, 4, 0, 0]} name="Visibility score">
            <ErrorBar dataKey="error" direction="y" width={4} strokeWidth={1.5} stroke="#a1a1aa" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
