"use client";

import { useEffect, useMemo, useState } from "react";
import { loadWorkspace } from "@/lib/workspace/storage";
import {
  getPersonalizedDemo,
  type PersonalizedDemo,
  type PromptResultRow,
} from "@/lib/demo/personalized";
import { PageHeader } from "@/components/page-header";
import { IconAbsent, IconClose, IconLose, IconPresent, IconWin } from "@/components/icons";
import { ModelBadge } from "@/components/model-badge";

export default function PromptsPage() {
  const [data, setData] = useState<PersonalizedDemo | null>(null);
  const [open, setOpen] = useState<PromptResultRow | null>(null);
  const [intent, setIntent] = useState<string>("all");
  const [result, setResult] = useState<"all" | "win" | "lose">("all");

  useEffect(() => {
    setData(getPersonalizedDemo(loadWorkspace()));
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const intents = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.promptResults.map((p) => String(p.intentType)))];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.promptResults.filter((p) => {
      if (intent !== "all" && String(p.intentType) !== intent) return false;
      if (result === "win" && !p.win) return false;
      if (result === "lose" && p.win) return false;
      return true;
    });
  }, [data, intent, result]);

  if (!data) return null;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <PageHeader
        title="Prompts"
        subtitle={`Win/lose for ${data.trackedBrand}. Click a row for fixture samples.`}
      />
      <div className="flex flex-wrap gap-3">
        <select
          className="focus-ring rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
        >
          <option value="all">All intents</option>
          {intents.map((i) => (
            <option key={i} value={i}>
              {i.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select
          className="focus-ring rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          value={result}
          onChange={(e) => setResult(e.target.value as typeof result)}
        >
          <option value="all">All results</option>
          <option value="win">Wins only</option>
          <option value="lose">Losses only</option>
        </select>
      </div>
      <div className="overflow-hidden rounded-[12px] border border-border bg-surface card-shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-3">Prompt</th>
              <th>Intent</th>
              <th>Result</th>
              <th>Mention rate</th>
              <th>Best model</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="cursor-pointer border-t border-border hover:bg-primary-muted/50"
                onClick={() => setOpen(p)}
              >
                <td className="max-w-md truncate px-4 py-3 font-medium">
                  {p.text}
                </td>
                <td className="capitalize text-ink-muted">
                  {String(p.intentType).replaceAll("_", " ")}
                </td>
                <td>
                  <span
                    className={
                      p.win
                        ? "inline-flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 text-xs text-success"
                        : "inline-flex items-center gap-1 rounded-full bg-danger-muted px-2 py-0.5 text-xs text-danger"
                    }
                  >
                    {p.win ? <IconWin size={14} /> : <IconLose size={14} />}
                    {p.win ? "Win" : "Lose"}
                  </span>
                </td>
                <td className="tabular-nums">{(p.mentionRate * 100).toFixed(0)}%</td>
                <td>
                  <ModelBadge model={p.bestModel} showLabel />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">
                  No prompts match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-md overflow-y-auto bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-ink">Sample drilldown</h2>
              <button
                type="button"
                className="rounded-md p-1 text-ink-muted hover:text-ink"
                onClick={() => setOpen(null)}
                aria-label="Close"
              >
                <IconClose size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-body">{open.text}</p>
            <p className="mt-1 text-xs text-ink-muted">Esc to close</p>
            <ul className="mt-6 space-y-4">
              {open.samples.map((s) => (
                <li
                  key={s.model}
                  className="rounded-[12px] border border-border p-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <ModelBadge model={s.model} showLabel />
                    <span
                      className={
                        s.mentioned
                          ? "inline-flex items-center gap-1 text-success"
                          : "inline-flex items-center gap-1 text-ink-muted"
                      }
                    >
                      {s.mentioned ? (
                        <IconPresent size={14} />
                      ) : (
                        <IconAbsent size={14} />
                      )}
                      {s.mentioned ? "Present" : "Absent"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs italic text-ink-muted">
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
