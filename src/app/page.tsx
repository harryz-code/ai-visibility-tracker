import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, color-mix(in srgb, var(--primary) 22%, transparent), transparent)",
          }}
        />
        <div className="relative mx-auto flex min-h-[calc(100vh-65px)] max-w-6xl flex-col justify-center gap-8 px-6 py-16">
          <div className="max-w-2xl space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              AVT
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Know how AI assistants talk about your brand.
            </h1>
            <p className="text-lg text-ink-body">
              Multi-sample measurement across ChatGPT, Claude, Gemini, and
              Perplexity — with confidence intervals and versioned extraction.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/onboarding"
              className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Start setup
            </Link>
            <Link
              href="/report"
              className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Get a free report
            </Link>
            <Link
              href="/methodology"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface"
            >
              How it works
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
