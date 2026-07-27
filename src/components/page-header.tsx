import { BrandMark, DemoBadge } from "@/components/brand";
import { IconAbsent } from "@/components/icons";
import Link from "next/link";

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
  title = "No workspace yet",
}: {
  message?: string;
  title?: string;
}) {
  return (
    <div className="rounded-[16px] border border-dashed border-border-strong bg-surface p-10 text-center card-shadow">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[12px] bg-surface-muted text-ink-muted">
        <IconAbsent size={22} />
      </div>
      <div className="mb-3 flex justify-center">
        <BrandMark href={null} size={28} />
      </div>
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-ink-muted">{message}</p>
      <Link
        href="/onboarding"
        className="mt-5 inline-flex h-btn-md items-center rounded-[8px] bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
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
          className="rounded-[12px] border border-border bg-surface px-4 py-3 card-shadow"
        >
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
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
