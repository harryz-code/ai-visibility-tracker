"use client";

import { useEffect, useState } from "react";
import { loadWorkspace } from "@/lib/workspace/storage";
import {
  getPersonalizedDemo,
  type PersonalizedDemo,
} from "@/lib/demo/personalized";

export default function AlertsPage() {
  const [data, setData] = useState<PersonalizedDemo | null>(null);
  useEffect(() => {
    setData(getPersonalizedDemo(loadWorkspace()));
  }, []);
  if (!data) return null;

  const significant = data.alerts.filter((a) => a.significant);
  const suppressed = data.alerts.filter((a) => !a.significant);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Alerts</h1>
        <p className="text-sm text-zinc-500">
          Alerts fire only when a week-over-week change falls outside the Wilson
          95% CI.
        </p>
      </div>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Significant ({significant.length})
        </h2>
        {significant.map((a) => (
          <div
            key={a.id}
            className="rounded-lg border border-amber-200 bg-amber-50 p-4"
          >
            <p className="font-medium text-amber-950">{a.title}</p>
            <p className="mt-1 text-sm text-amber-900/80">{a.detail}</p>
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Suppressed — not significant ({suppressed.length})
        </h2>
        {suppressed.map((a) => (
          <div
            key={a.id}
            className="rounded-lg border border-zinc-200 bg-white p-4"
          >
            <p className="font-medium text-zinc-800">{a.title}</p>
            <p className="mt-1 text-sm text-zinc-500">{a.detail}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
