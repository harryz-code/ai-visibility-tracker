import Link from "next/link";
import { BrandMark } from "@/components/brand";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <BrandMark />
        <nav className="flex flex-wrap items-center gap-5 text-sm text-ink-muted">
          <Link href="/methodology" className="hover:text-ink">
            Methodology
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            Pricing
          </Link>
          <Link href="/report" className="hover:text-ink">
            Free report
          </Link>
          <Link href="/leaderboard" className="hover:text-ink">
            Index
          </Link>
          <Link href="/onboarding" className="hover:text-ink">
            Start
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md bg-ink px-3 py-1 text-primary-foreground hover:opacity-90"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
