"use client";

import { useEffect, useState } from "react";
import {
  generatePromptCorpus,
  suggestedCompetitors,
} from "@/lib/demo/generator";
import { loadWorkspace, saveWorkspace } from "@/lib/workspace/storage";
import {
  resolveCategoryLabel,
  type WorkspacePrompt,
  type WorkspaceState,
} from "@/lib/workspace/types";

export default function AdminPromptsPage() {
  const [ws, setWs] = useState<WorkspaceState | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setWs(loadWorkspace());
  }, []);

  if (!ws) return null;

  function regenerate() {
    if (!ws) return;
    const comps = ws.competitors.filter((c) => c.selected);
    const competitors =
      comps.length > 0
        ? comps
        : suggestedCompetitors(
            resolveCategoryLabel(ws.brand),
            ws.brand.name,
          );
    const prompts = generatePromptCorpus({
      brandName: ws.brand.name || "Brand",
      category: resolveCategoryLabel(ws.brand) || "Financial Services",
      services: ws.services.length ? ws.services : ["Core product"],
      competitors,
      count: 30,
    });
    const next = { ...ws, prompts, competitors };
    setWs(next);
    saveWorkspace(next);
    setMsg(`Generated ${prompts.length} prompts`);
  }

  function toggle(id: string) {
    if (!ws) return;
    const prompts = ws.prompts.map((p) =>
      p.id === id ? { ...p, selected: !p.selected } : p,
    );
    const next = { ...ws, prompts };
    setWs(next);
    saveWorkspace(next);
  }

  function download() {
    if (!ws) return;
    const blob = new Blob([JSON.stringify(ws.prompts, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avt-prompts-${ws.brand.name || "demo"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const byIntent = ws.prompts.reduce<Record<string, WorkspacePrompt[]>>(
    (acc, p) => {
      (acc[p.intentType] ??= []).push(p);
      return acc;
    },
    {},
  );

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Prompt corpus
          </h1>
          <p className="text-sm text-zinc-500">
            Fixture generator — no LLM. Intent mix matches the methodology.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={regenerate}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
          >
            Regenerate
          </button>
          <button
            type="button"
            onClick={download}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Download JSON
          </button>
        </div>
      </div>
      {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      {ws.prompts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
          No prompts yet. Run onboarding or click Regenerate.
        </p>
      ) : (
        Object.entries(byIntent).map(([intent, list]) => (
          <section
            key={intent}
            className="rounded-lg border border-zinc-200 bg-white p-4"
          >
            <h2 className="mb-3 text-sm font-semibold capitalize text-zinc-800">
              {intent.replaceAll("_", " ")} ({list.filter((p) => p.selected).length}/
              {list.length} active)
            </h2>
            <ul className="space-y-2">
              {list.map((p) => (
                <li
                  key={p.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <span className={p.selected ? "text-zinc-800" : "text-zinc-400 line-through"}>
                    {p.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    className="shrink-0 text-xs text-sky-600 hover:underline"
                  >
                    {p.selected ? "Deactivate" : "Activate"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
