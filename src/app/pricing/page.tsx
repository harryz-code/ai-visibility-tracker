import { SiteHeader } from "@/components/site-header";
import { PricingCheckoutButton } from "@/components/pricing-checkout-button";
import Link from "next/link";

export const metadata = {
  title: "Pricing — AVT",
};

const ROWS = [
  ["Tracked brands", "1", "3"],
  ["Competitors", "3", "10"],
  ["Wave cadence", "Weekly", "Daily"],
  ["Wilson CI charts", "Yes", "Yes"],
  ["Significance-gated alerts", "Yes", "Yes"],
  ["AI Overviews", "—", "Later"],
  ["Seats", "1", "Team"],
];

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-enter mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Pricing
          </h1>
          <p className="mt-2 text-ink-body">
            Self-serve plans for ongoing AI visibility tracking. Checkout
            redirects to Stripe when configured, otherwise explore the
            product via the local fixture demo.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-[16px] border border-border bg-surface p-8 card-shadow">
            <h2 className="text-xl font-semibold text-ink">Solo</h2>
            <p className="mt-2 text-3xl font-semibold text-ink">
              $99
              <span className="text-base font-normal text-ink-muted">/mo</span>
            </p>
            <PricingCheckoutButton
              plan="solo"
              className="mt-8 inline-flex h-btn-lg w-full items-center justify-center rounded-[8px] bg-ink text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              Start Solo
            </PricingCheckoutButton>
            <Link
              href="/onboarding"
              className="mt-2 block text-center text-xs text-ink-muted hover:text-ink"
            >
              Explore the demo instead
            </Link>
          </div>
          <div className="rounded-[16px] border border-primary/40 bg-primary-muted p-8 card-shadow">
            <h2 className="text-xl font-semibold text-ink">Team</h2>
            <p className="mt-2 text-3xl font-semibold text-ink">
              $299
              <span className="text-base font-normal text-ink-muted">/mo</span>
            </p>
            <PricingCheckoutButton
              plan="team"
              className="mt-8 inline-flex h-btn-lg w-full items-center justify-center rounded-[8px] bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
            >
              Start Team
            </PricingCheckoutButton>
            <Link
              href="/onboarding"
              className="mt-2 block text-center text-xs text-ink-muted hover:text-ink"
            >
              Explore the demo instead
            </Link>
          </div>
        </div>
        <table className="mt-12 w-full text-left text-sm">
          <thead className="text-xs uppercase text-ink-muted">
            <tr>
              <th className="py-2">Feature</th>
              <th>Solo</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([f, s, t]) => (
              <tr key={f} className="border-t border-border">
                <td className="py-3 text-ink">{f}</td>
                <td>{s}</td>
                <td>{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
