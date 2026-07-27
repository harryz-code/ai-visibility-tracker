import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href?: string | null;
  className?: string;
  showWord?: boolean;
  size?: number;
  onDark?: boolean;
};

export function BrandMark({
  href = "/",
  className,
  showWord = true,
  size = 28,
  onDark = false,
}: Props) {
  const inner = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={onDark ? "/brand/mark-on-dark.svg" : "/brand/mark.svg"}
        alt=""
        width={size}
        height={size}
        className="rounded-lg"
        unoptimized
      />
      {showWord && (
        <span
          className={cn(
            "font-display text-[19px] font-semibold tracking-[-0.03em]",
            onDark ? "text-white" : "text-ink",
          )}
        >
          AVT
        </span>
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
        "inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted",
        className,
      )}
    >
      Demo data
    </span>
  );
}
