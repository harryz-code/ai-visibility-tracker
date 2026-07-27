import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export const metadata = {
  title: "Pricing — AVT",
};

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Pricing
          </h1>
          <p className="mt-2 text-zinc-600">
            Self-serve plans for ongoing AI visibility tracking. Checkout is
            stubbed in this demo.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            <h2 className="text-xl font-semibold">Solo</h2>
            <p className="mt-2 text-3xl font-semibold">
              $99<span className="text-base font-normal text-zinc-500">/mo</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-600">
              <li>1 tracked brand</li>
              <li>3 competitors</li>
              <li>Weekly multi-sample waves</li>
              <li>Wilson CI charts + alerts</li>
            </ul>
            <Link
              href="/onboarding"
              className="mt-8 inline-block w-full rounded-xl bg-zinc-900 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800"
            >
              Start setup
            </Link>
          </div>
          <div className="rounded-2xl border border-primary/40 bg-primary-muted p-8">
            <h2 className="text-xl font-semibold">Team</h2>
            <p className="mt-2 text-3xl font-semibold">
              $299
              <span className="text-base font-normal text-zinc-500">/mo</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-zinc-600">
              <li>3 tracked brands</li>
              <li>10 competitors</li>
              <li>Daily waves</li>
              <li>AI Overviews (later)</li>
            </ul>
            <button
              type="button"
              className="mt-8 w-full rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Coming soon — Stripe stub
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
