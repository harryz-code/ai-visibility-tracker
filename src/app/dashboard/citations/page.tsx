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
        <h1 className="text-2xl font-semibold text-zinc-900">Citations</h1>
        <p className="text-sm text-zinc-500">
          Domains cited across category answers — plus “get cited here”
          recommendations.
        </p>
      </div>
      <section className="rounded-lg border border-zinc-200 bg-white p-6">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr>
              <th className="py-2">Domain</th>
              <th>Share</th>
              <th>Count</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {data.citationIntel.map((c) => (
              <tr key={c.domain} className="border-t border-zinc-100">
                <td className="py-3 font-medium">{c.domain}</td>
                <td>{(c.share * 100).toFixed(0)}%</td>
                <td className="text-zinc-500">{c.count}</td>
                <td className="text-zinc-600">{c.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
