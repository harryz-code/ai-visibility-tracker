import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  className?: string;
  showWord?: boolean;
  size?: number;
};

export function BrandMark({
  href = "/",
  className,
  showWord = true,
  size = 28,
}: Props) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/brand/mark.svg"
        alt=""
        width={size}
        height={size}
        className="rounded-lg"
        unoptimized
      />
      {showWord && (
        <span className="font-semibold tracking-tight text-ink">AVT</span>
      )}
    </span>
  );
  if (!href) return inner;
  return (
    <Link href={href} className="inline-flex">
      {inner}
    </Link>
  );
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted",
        className,
      )}
    >
      Demo data
    </span>
  );
}
