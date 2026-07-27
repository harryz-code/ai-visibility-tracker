import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export const metadata = {
  title: "Methodology — AVT",
};

export default function MethodologyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-10 px-6 py-16">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Methodology
          </h1>
          <p className="mt-3 text-lg text-ink-body">
            AVT measures AI visibility with multi-sample measurement, Wilson
            confidence intervals, and versioned extraction — not single-shot
            screenshots.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Pipeline
          </h2>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {[
              "N samples / prompt",
              "Wilson 95% CI",
              "Significance gate",
            ].map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-3">
                <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-primary-muted text-center text-sm font-medium text-primary">
                  {label}
                </div>
                {i < 2 && (
                  <span className="hidden text-ink-muted sm:inline">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            Alerts fire only when a week-over-week change falls outside the CI.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Sampling</h2>
          <p className="text-ink-body">
            For each active prompt and model we draw N samples (default 8 for
            tracked waves; 4 for free reports) at provider default temperature.
            Mention rate is the fraction of samples where the brand appears.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Judge versioning</h2>
          <p className="text-ink-body">
            Extractions carry a <code className="text-sm">judge_version</code>.
            Improving the judge means a new version and a backfill — never a
            silent overwrite of historical metrics.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-ink">Prompt design</h2>
          <p className="text-ink-body">
            Unaided intents (category, best-for, howto) never name the tracked
            brand. Comparison and alternative intents may (aided).
          </p>
        </section>
        <Link
          href="/onboarding"
          className="inline-flex h-btn-md items-center rounded-[8px] bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          Start setup →
        </Link>
      </main>
    </>
  );
}
