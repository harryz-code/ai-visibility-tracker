import { demoDataset } from "@/lib/demo/data";
import {
  CompetitorOverlayChart,
  MentionRateBarChart,
  ScoreTimeseriesChart,
} from "@/components/charts";

export const metadata = {
  title: "Dashboard — AVT",
};

export default function DashboardPage() {
  const data = demoDataset;
  const overall = Math.round(
    data.perModel.reduce((s, m) => s + m.visibilityScore, 0) /
      data.perModel.length,
  );

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            {data.category.name} · {data.category.market}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
            {data.trackedBrand} visibility
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600">
            Demo dashboard from seeded fixture waves. Mention rates include
            Wilson 95% confidence intervals.
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4 text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            AI Visibility Score
          </p>
          <p className="text-4xl font-semibold tabular-nums text-zinc-900">
            {overall}
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-medium text-zinc-900">Score over time</h2>
        <p className="mb-4 text-sm text-zinc-500">
          Weekly visibility score by model (0–100).
        </p>
        <ScoreTimeseriesChart data={data.timeseries} />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-medium text-zinc-900">
          Mention rate by model
        </h2>
        <p className="mb-4 text-sm text-zinc-500">
          Share of samples mentioning {data.trackedBrand}, with CI whiskers.
        </p>
        <MentionRateBarChart data={data.perModel} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-medium text-zinc-900">Competitors</h2>
          <p className="mb-4 text-sm text-zinc-500">
            Category overlay — higher score means more often recommended.
          </p>
          <CompetitorOverlayChart
            data={data.competitors.map((c) => ({
              brand: c.brand,
              score: c.overallScore,
              rate: c.mentionRate,
              ciLow: c.ciLow,
              ciHigh: c.ciHigh,
            }))}
          />
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2">Brand</th>
                <th>Score</th>
                <th>Mention rate</th>
                <th>95% CI</th>
              </tr>
            </thead>
            <tbody>
              {data.competitors.map((c) => (
                <tr key={c.brand} className="border-t border-zinc-100">
                  <td className="py-2 font-medium">{c.brand}</td>
                  <td>{c.overallScore}</td>
                  <td>{(c.mentionRate * 100).toFixed(1)}%</td>
                  <td className="text-zinc-500">
                    {(c.ciLow * 100).toFixed(1)}–{(c.ciHigh * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-lg font-medium text-zinc-900">Citation share</h2>
          <p className="mb-4 text-sm text-zinc-500">
            Domains cited across category answers.
          </p>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-zinc-500">
              <tr>
                <th className="py-2">Domain</th>
                <th>Share</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {data.citations.map((c) => (
                <tr key={c.domain} className="border-t border-zinc-100">
                  <td className="py-2 font-medium">{c.domain}</td>
                  <td>{(c.share * 100).toFixed(0)}%</td>
                  <td className="text-zinc-500">{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-medium text-zinc-900">Prompt corpus</h2>
        <p className="mb-4 text-sm text-zinc-500">
          {data.prompts.length} active prompts across 6 intent types.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {data.prompts.slice(0, 10).map((p) => (
            <li
              key={p.id}
              className="rounded border border-zinc-100 px-3 py-2 text-sm text-zinc-700"
            >
              <span className="mr-2 text-xs uppercase text-zinc-400">
                {p.intentType}
              </span>
              {p.text}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
