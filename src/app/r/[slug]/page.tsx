import { MentionRateBarChart } from "@/components/charts";
import { ReportGate } from "@/components/report-gate";
import { SiteHeader } from "@/components/site-header";
import {
  buildReportPayload,
  getReportMemory,
  seedDemoReport,
  type ReportPayload,
} from "@/lib/report/build";
import Link from "next/link";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

function resolveReport(slug: string): ReportPayload {
  seedDemoReport();
  const cached = getReportMemory(slug);
  if (cached) return cached;

  const parts = slug.split("-");
  if (parts.length >= 2) {
    const brand = parts[0] ? capitalize(parts[0]) : "Affirm";
    const category = parts[1]
      ? parts[1].toUpperCase() === "bnpl"
        ? "BNPL"
        : capitalize(parts[1])
      : "BNPL";
    return buildReportPayload(brand, category === "Bnpl" ? "BNPL" : category);
  }
  return buildReportPayload("Affirm", "BNPL");
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const report = resolveReport(slug);
  return {
    title: `${report.brandName} AI Visibility Report — AVT`,
    description: `AI Visibility Score ${report.overallScore} for ${report.brandName} in ${report.categoryName}.`,
    openGraph: {
      title: `${report.brandName} — AI Visibility ${report.overallScore}`,
      description: report.biggestGap,
      images: [`/r/${slug}/opengraph-image`],
    },
  };
}

export default async function ReportViewPage({ params }: Props) {
  const { slug } = await params;
  const report = resolveReport(slug);
  const topCompetitors = report.competitors.filter(
    (c) => c.brand.toLowerCase() !== report.brandName.toLowerCase(),
  );

  return (
    <>
      <SiteHeader />
      <ReportGate brandName={report.brandName} payload={report}>
        <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
                {report.categoryName} · Free report
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
                {report.brandName} in AI answers
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                {report.methodology}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white px-5 py-4 text-right">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                AI Visibility Score
              </p>
              <p className="text-4xl font-semibold tabular-nums text-zinc-900">
                {report.overallScore}
              </p>
            </div>
          </div>

          <section className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-900">
              Biggest gap
            </h2>
            <p className="mt-1 text-amber-950">{report.biggestGap}</p>
          </section>

          <div className="h-32" aria-hidden />

          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-medium text-zinc-900">
              Per-model breakdown
            </h2>
            <p className="mb-4 text-sm text-zinc-500">
              Mention rate with Wilson 95% CI whiskers.
            </p>
            <MentionRateBarChart data={report.perModel} />
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2">Model</th>
                  <th>Score</th>
                  <th>Mention rate</th>
                  <th>95% CI</th>
                </tr>
              </thead>
              <tbody>
                {report.perModel.map((m) => (
                  <tr key={m.model} className="border-t border-zinc-100">
                    <td className="py-2 font-medium capitalize">{m.model}</td>
                    <td>{m.visibilityScore}</td>
                    <td>{(m.mentionRate * 100).toFixed(1)}%</td>
                    <td className="text-zinc-500">
                      {(m.ciLow * 100).toFixed(1)}–{(m.ciHigh * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-medium text-zinc-900">
                Top competitors
              </h2>
              <ul className="mt-4 space-y-3">
                {topCompetitors.slice(0, 3).map((c, i) => (
                  <li
                    key={c.brand}
                    className="flex items-center justify-between border-b border-zinc-100 pb-3"
                  >
                    <span className="font-medium">
                      <span className="mr-2 text-zinc-400">{i + 1}.</span>
                      {c.brand}
                    </span>
                    <span className="tabular-nums text-zinc-600">
                      {c.overallScore} · {(c.mentionRate * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6">
              <h2 className="text-lg font-medium text-zinc-900">
                How AI describes you
              </h2>
              <ul className="mt-4 space-y-3">
                {report.verbatims.map((v) => (
                  <li
                    key={v}
                    className="border-l-2 border-zinc-300 pl-3 text-sm italic text-zinc-700"
                  >
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-lg font-medium text-zinc-900">Cited domains</h2>
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="py-2">Domain</th>
                  <th>Share</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {report.citations.map((c) => (
                  <tr key={c.domain} className="border-t border-zinc-100">
                    <td className="py-2 font-medium">{c.domain}</td>
                    <td>{(c.share * 100).toFixed(0)}%</td>
                    <td className="text-zinc-500">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/report"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              Run another report
            </Link>
            <Link
              href="/onboarding"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Start tracking setup
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              View dashboard
            </Link>
          </div>
        </main>
      </ReportGate>
    </>
  );
}
