"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { DemoBadge } from "@/components/brand";
import { getIndustryLeaderboard } from "@/lib/demo/personalized";
import { INDUSTRIES } from "@/lib/workspace/types";
import Link from "next/link";

export default function LeaderboardPage() {
  const [industry, setIndustry] = useState<string>(INDUSTRIES[1]); // Financial Services
  const rows = useMemo(() => getIndustryLeaderboard(industry), [industry]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium uppercase tracking-widest text-ink-muted">
            AI Visibility Index
          </p>
          <DemoBadge />
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {industry} · July 2026
        </h1>
        <p className="mt-2 text-ink-body">
          Public category leaderboard (fixture data). Switch industries — still
          demo metrics until live waves ship.
        </p>
        <label className="mt-6 block text-sm font-medium text-ink">
          Industry
          <select
            className="mt-1 w-full max-w-md rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          >
            {INDUSTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <table className="mt-10 w-full text-left text-sm">
          <thead className="text-xs uppercase text-ink-muted">
            <tr>
              <th className="py-2">#</th>
              <th>Brand</th>
              <th>Visibility</th>
              <th>Mention rate</th>
              <th>95% CI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c, i) => (
              <tr key={c.brand} className="border-t border-border">
                <td className="py-3 text-ink-muted">{i + 1}</td>
                <td className="font-medium">{c.brand}</td>
                <td>{c.overallScore}</td>
                <td>{(c.mentionRate * 100).toFixed(1)}%</td>
                <td className="text-ink-muted">
                  {(c.ciLow * 100).toFixed(1)}–{(c.ciHigh * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link
          href="/onboarding"
          className="mt-10 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Track your brand
        </Link>
      </main>
    </>
  );
}
