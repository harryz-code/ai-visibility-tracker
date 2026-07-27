import { ReportForm } from "@/components/report-form";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Free AI Visibility Report — AVT",
};

export default function ReportPage() {
  return (
    <>
      <SiteHeader />
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 max-w-2xl space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
          Free instant report
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          See how AI assistants mention your brand.
        </h1>
        <p className="text-zinc-600">
          Mini-wave across ChatGPT, Claude, Gemini, and Perplexity — mention
          rates with Wilson 95% confidence intervals, auto-detected competitors,
          and verbatims.
        </p>
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 sm:p-8">
        <ReportForm />
      </div>
    </main>
    </>
  );
}
