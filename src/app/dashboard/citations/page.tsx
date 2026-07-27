"use client";

import { useEffect, useState } from "react";
import { loadWorkspace } from "@/lib/workspace/storage";
import {
  getPersonalizedDemo,
  type PersonalizedDemo,
} from "@/lib/demo/personalized";

export default function CitationsPage() {
  const [data, setData] = useState<PersonalizedDemo | null>(null);
  useEffect(() => {
    setData(getPersonalizedDemo(loadWorkspace()));
  }, []);
  if (!data) return null;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Citations</h1>
        <p className="text-sm text-ink-muted">
          Domains cited across category answers — plus “get cited here”
          recommendations.
        </p>
      </div>
      <section className="rounded-lg border border-border bg-surface p-6">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-ink-muted">
            <tr>
              <th className="py-2">Domain</th>
              <th>Share</th>
              <th>Count</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {data.citationIntel.map((c) => (
              <tr key={c.domain} className="border-t border-border">
                <td className="py-3 font-medium">{c.domain}</td>
                <td>{(c.share * 100).toFixed(0)}%</td>
                <td className="text-ink-muted">{c.count}</td>
                <td className="text-ink-body">{c.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
