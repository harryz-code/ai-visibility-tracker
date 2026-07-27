import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex min-h-[calc(100vh-65px)] max-w-6xl flex-col justify-center gap-8 px-6 py-16">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            AI Visibility Tracker
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Know how AI assistants talk about your brand.
          </h1>
          <p className="text-lg text-zinc-600">
            Multi-sample measurement across ChatGPT, Claude, Gemini, and
            Perplexity — with confidence intervals and versioned extraction.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/onboarding"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Start setup
          </Link>
          <Link
            href="/report"
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Get a free report
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
          >
            View demo dashboard
          </Link>
        </div>
      </main>
    </>
  );
}
