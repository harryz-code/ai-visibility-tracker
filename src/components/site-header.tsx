import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold tracking-tight text-zinc-900">
          AVT
        </Link>
        <nav className="flex flex-wrap gap-5 text-sm text-zinc-600">
          <Link href="/methodology" className="hover:text-zinc-900">
            Methodology
          </Link>
          <Link href="/pricing" className="hover:text-zinc-900">
            Pricing
          </Link>
          <Link href="/report" className="hover:text-zinc-900">
            Free report
          </Link>
          <Link href="/leaderboard" className="hover:text-zinc-900">
            Index
          </Link>
          <Link href="/onboarding" className="hover:text-zinc-900">
            Start
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-3 py-1 text-white hover:bg-zinc-800"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
