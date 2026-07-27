"use client";

import { SiteHeader } from "@/components/site-header";
import { getDemoDataset } from "@/lib/demo/data";
import Link from "next/link";

export default function LeaderboardPage() {
  const data = getDemoDataset("Affirm");
  const rows = data.competitors;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
          AI Visibility Index
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
          BNPL · July 2026
        </h1>
        <p className="mt-2 text-zinc-600">
          Public category leaderboard stub (fixture data). Use for SEO/PR
          distribution once live waves exist.
        </p>
        <table className="mt-10 w-full text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
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
              <tr key={c.brand} className="border-t border-zinc-200">
                <td className="py-3 text-zinc-400">{i + 1}</td>
                <td className="font-medium">{c.brand}</td>
                <td>{c.overallScore}</td>
                <td>{(c.mentionRate * 100).toFixed(1)}%</td>
                <td className="text-zinc-500">
                  {(c.ciLow * 100).toFixed(1)}–{(c.ciHigh * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link
          href="/onboarding"
          className="mt-10 inline-block rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-600"
        >
          Track your brand
        </Link>
      </main>
    </>
  );
}
