import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 45% at 70% -10%, rgba(74,44,224,0.18), transparent)",
          }}
        />
        <div className="page-enter relative mx-auto flex min-h-[calc(100vh-65px)] max-w-6xl flex-col justify-center gap-8 px-6 py-16">
          <div className="max-w-3xl space-y-5">
            <p className="font-mono text-[11.5px] font-medium uppercase tracking-[0.14em] text-primary">
              AVT · AI Visibility Tracker
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-6xl">
              Measure where your brand{" "}
              <span className="text-primary">shows up</span> in AI answers.
            </h1>
            <p className="max-w-[56ch] text-lg text-ink-body">
              Multi-sample measurement across ChatGPT, Claude, Gemini, and
              Perplexity — with confidence intervals and versioned extraction.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="inline-flex h-btn-lg items-center rounded-[8px] bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
            >
              Start setup
            </Link>
            <Link
              href="/report"
              className="inline-flex h-btn-lg items-center rounded-[8px] border border-border-strong bg-surface px-5 text-sm font-semibold text-ink hover:bg-[var(--primary-muted-2)]"
            >
              Get a free report
            </Link>
            <Link
              href="/methodology"
              className="inline-flex h-btn-lg items-center rounded-[8px] px-5 text-sm font-semibold text-ink-muted hover:text-ink"
            >
              How it works
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
