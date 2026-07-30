import { cn } from "@/lib/utils";

export function DeltaPill({
  value,
  suffix = "%",
  invert = false,
  className,
}: {
  value: number;
  suffix?: string;
  invert?: boolean;
  className?: string;
}) {
  const positive = invert ? value < 0 : value > 0;
  const negative = invert ? value > 0 : value < 0;
  const sign = value > 0 ? "+" : "";
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        positive && "text-success",
        negative && "text-danger",
        !positive && !negative && "text-ink-muted",
        className,
      )}
    >
      {sign}
      {value}
      {suffix}
    </span>
  );
}

export function OwnedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-primary-muted px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-primary",
        className,
      )}
    >
      Owned
    </span>
  );
}

export function BetaBadge({ label = "Beta" }: { label?: string }) {
  return (
    <span className="ml-1.5 inline-flex items-center rounded-md bg-primary-muted px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide text-primary">
      {label}
    </span>
  );
}
