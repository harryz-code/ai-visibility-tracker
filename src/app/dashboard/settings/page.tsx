"use client";

import { useEffect, useState } from "react";
import { IndustryGrid } from "@/components/industry-grid";
import { IconAdd } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { loadWorkspace, saveWorkspace } from "@/lib/workspace/storage";
import {
  OTHER_CATEGORY,
  resolveCategoryLabel,
  type WorkspaceCompetitor,
  type WorkspaceState,
} from "@/lib/workspace/types";

export default function SettingsPage() {
  const [ws, setWs] = useState<WorkspaceState | null>(null);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  useEffect(() => {
    setWs(loadWorkspace());
  }, []);

  if (!ws) return null;

  function save() {
    if (!ws) return;
    if (
      ws.brand.category === OTHER_CATEGORY &&
      !ws.brand.categoryOther.trim()
    ) {
      return;
    }
    saveWorkspace(ws);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function toggleCompetitor(id: string) {
    setWs({
      ...ws!,
      competitors: ws!.competitors.map((c) =>
        c.id === id ? { ...c, selected: !c.selected } : c,
      ),
    });
  }

  function addCompetitor() {
    if (!name.trim() || !ws) return;
    const next: WorkspaceCompetitor = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      domain: domain.trim() || "example.com",
      selected: true,
    };
    setWs({ ...ws, competitors: [...ws.competitors, next] });
    setName("");
    setDomain("");
  }

  function removeCompetitor(id: string) {
    setWs({
      ...ws!,
      competitors: ws!.competitors.filter((c) => c.id !== id),
    });
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-6">
      <PageHeader
        title="Settings"
        subtitle="Demo workspace (localStorage only)."
      />
      <div className="space-y-4 rounded-[12px] border border-border bg-surface p-6 card-shadow">
        <label className="block text-sm">
          <span className="font-medium text-ink">Tracked brand</span>
          <input
            className="focus-ring mt-1 w-full rounded-[12px] border border-border px-3 py-2 outline-none focus:border-primary"
            value={ws.brand.name}
            onChange={(e) =>
              setWs({ ...ws, brand: { ...ws.brand, name: e.target.value } })
            }
          />
        </label>
        <div className="text-sm">
          <span className="font-medium text-ink">Industry</span>
          <div className="mt-2">
            <IndustryGrid
              value={ws.brand.category}
              otherValue={ws.brand.categoryOther}
              onChange={(category, categoryOther = "") =>
                setWs({
                  ...ws,
                  brand: { ...ws.brand, category, categoryOther },
                })
              }
            />
          </div>
          <p className="mt-2 text-xs text-ink-muted">
            Active label: {resolveCategoryLabel(ws.brand)}
          </p>
        </div>
        <label className="block text-sm">
          <span className="font-medium text-ink">Cadence</span>
          <select
            className="focus-ring mt-1 w-full rounded-[12px] border border-border px-3 py-2"
            value={ws.cadence}
            onChange={(e) =>
              setWs({
                ...ws,
                cadence: e.target.value as "weekly" | "daily",
              })
            }
          >
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Plan badge</span>
          <select
            className="focus-ring mt-1 w-full rounded-[12px] border border-border px-3 py-2"
            value={ws.plan}
            onChange={(e) =>
              setWs({
                ...ws,
                plan: e.target.value as WorkspaceState["plan"],
              })
            }
          >
            <option value="free">Free</option>
            <option value="solo">Solo ($99)</option>
            <option value="team">Team ($299)</option>
          </select>
        </label>

        <div>
          <p className="text-sm font-medium text-ink">Competitors</p>
          <ul className="mt-2 space-y-2">
            {ws.competitors.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 rounded-[12px] border border-border px-3 py-2 text-sm"
              >
                <label className="flex flex-1 cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={c.selected}
                    onChange={() => toggleCompetitor(c.id)}
                  />
                  <span>
                    <span className="font-medium">{c.name}</span>
                    <span className="ml-2 text-ink-muted">{c.domain}</span>
                  </span>
                </label>
                <button
                  type="button"
                  className="text-xs text-danger hover:underline"
                  onClick={() => removeCompetitor(c.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <input
              className="focus-ring w-1/2 rounded-[12px] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="focus-ring w-1/2 rounded-[12px] border border-border px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder="domain.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <button
              type="button"
              onClick={addCompetitor}
              className="inline-flex h-btn-md items-center gap-1 rounded-[12px] border border-border px-3 text-sm hover:bg-surface-muted"
              aria-label="Add competitor"
            >
              <IconAdd size={16} />
              Add
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={save}
          className="h-btn-md rounded-[8px] bg-ink px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </main>
  );
}
