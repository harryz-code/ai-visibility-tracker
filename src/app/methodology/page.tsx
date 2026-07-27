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
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Methodology
          </h1>
          <p className="mt-3 text-lg text-zinc-600">
            AVT measures AI visibility with multi-sample measurement, Wilson
            confidence intervals, and versioned extraction — not single-shot
            screenshots.
          </p>
        </div>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Sampling</h2>
          <p className="text-zinc-600">
            For each active prompt and model we draw N samples (default 8 for
            tracked waves; 4 for free reports) at provider default temperature.
            Mention rate is the fraction of samples where the brand appears.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Confidence intervals</h2>
          <p className="text-zinc-600">
            Every rate ships with a Wilson 95% CI. Alerts fire only when a
            week-over-week change falls outside that interval — killing
            false-alarm churn.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Judge versioning</h2>
          <p className="text-zinc-600">
            Extractions carry a <code className="text-sm">judge_version</code>.
            Improving the judge means a new version and a backfill — never a
            silent overwrite of historical metrics.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Prompt design</h2>
          <p className="text-zinc-600">
            Unaided intents (category, best-for, howto) never name the tracked
            brand. Comparison and alternative intents may (aided).
          </p>
        </section>
        <Link href="/onboarding" className="inline-block text-sky-600 hover:underline">
          Start setup →
        </Link>
      </main>
    </>
  );
}
