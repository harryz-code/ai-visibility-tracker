"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadWorkspace } from "@/lib/workspace/storage";
import type { WorkspaceState } from "@/lib/workspace/types";
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

  useEffect(() => {
    setWs(loadWorkspace());
  }, []);

  const brand = ws?.brand.name || "Affirm";
  const plan = ws?.plan || "solo";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-zinc-200 bg-white md:flex md:flex-col">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-[10px] text-white">
              A
            </span>
            AVT
          </Link>
        </div>
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
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  active
                    ? "bg-sky-50 font-medium text-sky-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-100 p-4 text-xs text-zinc-500">
          <p className="font-medium text-zinc-800">{brand}</p>
          <p className="capitalize">
            {plan} plan · Demo
          </p>
          {!ws?.completedOnboarding && (
            <Link
              href="/onboarding"
              className="mt-2 inline-block text-sky-600 hover:underline"
            >
              Complete onboarding →
            </Link>
          )}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <p className="text-sm text-zinc-500">
            <span className="font-medium text-zinc-800">{brand}</span>
            {" · "}
            {ws?.brand.category || "BNPL"} / {ws?.brand.market || "US"}
          </p>
          <div className="flex gap-3 text-sm">
            <Link href="/report" className="text-zinc-600 hover:text-zinc-900">
              Free report
            </Link>
            <Link
              href="/onboarding"
              className="text-sky-600 hover:text-sky-800"
            >
              Re-run setup
            </Link>
          </div>
        </header>
        <div className="flex-1 bg-zinc-50">{children}</div>
      </div>
    </div>
  );
}
