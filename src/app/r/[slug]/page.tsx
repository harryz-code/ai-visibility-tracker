import { MentionRateBarChart } from "@/components/charts";
import { IconSignificant } from "@/components/icons";
import { ModelBadge } from "@/components/model-badge";
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
              <p className="text-sm font-medium uppercase tracking-widest text-ink-muted">
                {report.categoryName} · Free report
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
                {report.brandName} in AI answers
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                {report.methodology}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface px-5 py-4 text-right">
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                AI Visibility Score
              </p>
              <p className="text-4xl font-semibold tabular-nums text-ink">
                {report.overallScore}
              </p>
            </div>
          </div>

          <section className="flex gap-3 rounded-[12px] border border-warn/30 bg-warn-muted px-5 py-4">
            <IconSignificant size={20} className="mt-0.5 shrink-0 text-warn" />
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">
                Biggest gap
              </h2>
              <p className="mt-1 text-ink-body">{report.biggestGap}</p>
            </div>
          </section>

          <div className="h-32" aria-hidden />

          <section className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-medium text-ink">
              Per-model breakdown
            </h2>
            <p className="mb-4 text-sm text-ink-muted">
              Mention rate with Wilson 95% CI whiskers.
            </p>
            <MentionRateBarChart data={report.perModel} />
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-xs uppercase text-ink-muted">
                <tr>
                  <th className="py-2">Model</th>
                  <th>Score</th>
                  <th>Mention rate</th>
                  <th>95% CI</th>
                </tr>
              </thead>
              <tbody>
                {report.perModel.map((m) => (
                  <tr key={m.model} className="border-t border-border">
                    <td className="py-2">
                      <ModelBadge model={m.model} showLabel />
                    </td>
                    <td className="tabular-nums">{m.visibilityScore}</td>
                    <td className="tabular-nums">
                      {(m.mentionRate * 100).toFixed(1)}%
                    </td>
                    <td className="tabular-nums text-ink-muted">
                      {(m.ciLow * 100).toFixed(1)}–{(m.ciHigh * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="text-lg font-medium text-ink">
                Top competitors
              </h2>
              <ul className="mt-4 space-y-3">
                {topCompetitors.slice(0, 3).map((c, i) => (
                  <li
                    key={c.brand}
                    className="flex items-center justify-between border-b border-border pb-3"
                  >
                    <span className="font-medium">
                      <span className="mr-2 text-ink-muted">{i + 1}.</span>
                      {c.brand}
                    </span>
                    <span className="tabular-nums text-ink-body">
                      {c.overallScore} · {(c.mentionRate * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-surface p-6">
              <h2 className="text-lg font-medium text-ink">
                How AI describes you
              </h2>
              <ul className="mt-4 space-y-3">
                {report.verbatims.map((v) => (
                  <li
                    key={v}
                    className="border-l-2 border-border-strong pl-3 text-sm italic text-ink-body"
                  >
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-6">
            <h2 className="text-lg font-medium text-ink">Cited domains</h2>
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-xs uppercase text-ink-muted">
                <tr>
                  <th className="py-2">Domain</th>
                  <th>Share</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {report.citations.map((c) => (
                  <tr key={c.domain} className="border-t border-border">
                    <td className="py-2 font-medium">{c.domain}</td>
                    <td>{(c.share * 100).toFixed(0)}%</td>
                    <td className="text-ink-muted">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/report"
              className="rounded-md border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
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
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              View dashboard
            </Link>
          </div>
        </main>
      </ReportGate>
    </>
  );
}
