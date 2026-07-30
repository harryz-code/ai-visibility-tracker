"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BetaBadge } from "./badges";
import { cn } from "@/lib/utils";

const TABS: {
  href: string;
  label: string;
  exact?: boolean;
  beta?: boolean;
}[] = [
  { href: "/dashboard/insights", label: "Visibility", exact: true },
  { href: "/dashboard/insights/prompts", label: "Prompts" },
  { href: "/dashboard/insights/platforms", label: "Platforms" },
  { href: "/dashboard/insights/regions", label: "Regions" },
  { href: "/dashboard/insights/personas", label: "Personas", beta: true },
  { href: "/dashboard/insights/sentiment", label: "Sentiment" },
  { href: "/dashboard/insights/citations", label: "Citations" },
];

export function InsightsTabs() {
  const pathname = usePathname();
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-sm whitespace-nowrap transition",
              active
                ? "border-ink font-semibold text-ink"
                : "border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {tab.label}
            {tab.beta ? <BetaBadge /> : null}
          </Link>
        );
      })}
    </div>
  );
}
