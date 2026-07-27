"use client";

import { useEffect, useState } from "react";
import { loadWorkspace } from "@/lib/workspace/storage";
import {
  getPersonalizedDemo,
  type PersonalizedDemo,
} from "@/lib/demo/personalized";
import { IconSignificant, IconSuppressed } from "@/components/icons";
import { PageHeader } from "@/components/page-header";

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
      <PageHeader
        title="Alerts"
        subtitle="Alerts fire only when a week-over-week change falls outside the Wilson 95% CI."
      />
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          <IconSignificant size={16} className="text-warn" />
          Significant ({significant.length})
        </h2>
        {significant.map((a) => (
          <div
            key={a.id}
            className="flex gap-3 rounded-[12px] border border-warn/30 bg-warn-muted p-4"
          >
            <IconSignificant size={18} className="mt-0.5 shrink-0 text-warn" />
            <div>
              <p className="font-medium text-ink">{a.title}</p>
              <p className="mt-1 text-sm text-ink-body">{a.detail}</p>
            </div>
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-muted">
          <IconSuppressed size={16} />
          Suppressed — not significant ({suppressed.length})
        </h2>
        {suppressed.map((a) => (
          <div
            key={a.id}
            className="flex gap-3 rounded-[12px] border border-border bg-surface p-4"
          >
            <IconSuppressed size={18} className="mt-0.5 shrink-0 text-ink-muted" />
            <div>
              <p className="font-medium text-ink">{a.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{a.detail}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
