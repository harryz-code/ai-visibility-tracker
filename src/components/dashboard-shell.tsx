"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark, DemoBadge } from "@/components/brand";
import { loadWorkspace } from "@/lib/workspace/storage";
import {
  resolveCategoryLabel,
  type WorkspaceState,
} from "@/lib/workspace/types";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/competitors", label: "Competitors" },
  { href: "/dashboard/prompts", label: "Prompts" },
  { href: "/dashboard/citations", label: "Citations" },
  { href: "/dashboard/alerts", label: "Alerts" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/admin/prompts", label: "Admin" },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ws, setWs] = useState<WorkspaceState | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setWs(loadWorkspace());
  }, []);

  const brand =
    ws?.completedOnboarding && ws.brand.name ? ws.brand.name : "Demo brand";
  const plan = ws?.plan || "solo";

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 p-3">
      {NAV.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              active
                ? "bg-primary-muted font-medium text-primary"
                : "text-ink-muted hover:bg-surface-muted hover:text-ink",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:flex md:flex-col">
        <div className="border-b border-border px-4 py-4">
          <BrandMark size={24} />
        </div>
        {nav}
        <div className="border-t border-border p-4 text-xs text-ink-muted">
          <p className="font-medium text-ink">{brand}</p>
          <p className="mt-0.5 flex items-center gap-2 capitalize">
            {plan} plan <DemoBadge />
          </p>
          {!ws?.completedOnboarding && (
            <Link
              href="/onboarding"
              className="mt-2 inline-block text-primary hover:underline"
            >
              Complete onboarding →
            </Link>
          )}
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-64 flex-col bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <BrandMark size={24} />
              <button
                type="button"
                className="text-ink-muted"
                onClick={() => setMobileOpen(false)}
              >
                ✕
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md border border-border px-2 py-1 text-sm md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              Menu
            </button>
            <p className="text-sm text-ink-muted">
              <span className="font-medium text-ink">{brand}</span>
              {" · "}
              {ws ? resolveCategoryLabel(ws.brand) : "Financial Services"} /{" "}
              {ws?.brand.market || "US"}
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/report" className="text-ink-muted hover:text-ink">
              Free report
            </Link>
            <Link href="/onboarding" className="text-primary hover:underline">
              Re-run setup
            </Link>
          </div>
        </header>
        <div className="flex-1 bg-background pb-14 md:pb-0">{children}</div>
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-surface md:hidden">
          {NAV.slice(0, 5).map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 py-2.5 text-center text-[10px]",
                  active ? "font-medium text-primary" : "text-ink-muted",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
