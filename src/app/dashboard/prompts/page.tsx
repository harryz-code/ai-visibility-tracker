"use client";

import { useEffect, useState } from "react";
import { loadWorkspace } from "@/lib/workspace/storage";
import {
  getPersonalizedDemo,
  type PersonalizedDemo,
  type PromptResultRow,
} from "@/lib/demo/personalized";

export default function PromptsPage() {
  const [data, setData] = useState<PersonalizedDemo | null>(null);
  const [open, setOpen] = useState<PromptResultRow | null>(null);

  useEffect(() => {
    setData(getPersonalizedDemo(loadWorkspace()));
  }, []);
  if (!data) return null;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Prompts</h1>
        <p className="text-sm text-zinc-500">
          Win/lose by prompt for {data.trackedBrand}. Click a row for fixture
          samples.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Prompt</th>
              <th>Intent</th>
              <th>Result</th>
              <th>Mention rate</th>
              <th>Best model</th>
            </tr>
          </thead>
          <tbody>
            {data.promptResults.map((p) => (
              <tr
                key={p.id}
                className="cursor-pointer border-t border-zinc-100 hover:bg-sky-50/50"
                onClick={() => setOpen(p)}
              >
                <td className="max-w-md truncate px-4 py-3 font-medium">
                  {p.text}
                </td>
                <td className="capitalize text-zinc-500">
                  {String(p.intentType).replaceAll("_", " ")}
                </td>
                <td>
                  <span
                    className={
                      p.win
                        ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                        : "rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700"
                    }
                  >
                    {p.win ? "Win" : "Lose"}
                  </span>
                </td>
                <td>{(p.mentionRate * 100).toFixed(0)}%</td>
                <td className="capitalize">{p.bestModel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-zinc-900">
                Sample drilldown
              </h2>
              <button
                type="button"
                className="text-zinc-400 hover:text-zinc-700"
                onClick={() => setOpen(null)}
              >
                ✕
              </button>
            </div>
            <p className="mt-2 text-sm text-zinc-600">{open.text}</p>
            <ul className="mt-6 space-y-4">
              {open.samples.map((s) => (
                <li
                  key={s.model}
                  className="rounded-lg border border-zinc-200 p-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize">{s.model}</span>
                    <span
                      className={
                        s.mentioned ? "text-emerald-600" : "text-zinc-400"
                      }
                    >
                      {s.mentioned ? "Mentioned" : "Absent"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs italic text-zinc-500">
                    {s.snippet}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}
