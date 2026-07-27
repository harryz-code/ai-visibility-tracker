import Link from "next/link";
import { DemoBadge } from "@/components/brand";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <DemoBadge />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyWorkspace({
  message = "Finish onboarding to personalize this view.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center">
      <p className="text-sm text-ink-muted">{message}</p>
      <Link
        href="/onboarding"
        className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
      >
        Start setup
      </Link>
    </div>
  );
}

export function KpiStrip({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-surface px-4 py-3"
        >
          <p className="text-[11px] uppercase tracking-wide text-ink-muted">
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
