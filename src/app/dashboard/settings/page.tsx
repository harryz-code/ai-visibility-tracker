"use client";

import { useEffect, useState } from "react";
import { loadWorkspace, saveWorkspace } from "@/lib/workspace/storage";
import type { WorkspaceState } from "@/lib/workspace/types";

export default function SettingsPage() {
  const [ws, setWs] = useState<WorkspaceState | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setWs(loadWorkspace());
  }, []);

  if (!ws) return null;

  function save() {
    if (!ws) return;
    saveWorkspace(ws);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 md:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500">
          Demo workspace settings (localStorage only).
        </p>
      </div>
      <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Tracked brand</span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
            value={ws.brand.name}
            onChange={(e) =>
              setWs({ ...ws, brand: { ...ws.brand, name: e.target.value } })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Category</span>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
            value={ws.brand.category}
            onChange={(e) =>
              setWs({ ...ws, brand: { ...ws.brand, category: e.target.value } })
            }
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-zinc-700">Cadence</span>
          <select
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
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
          <span className="font-medium text-zinc-700">Plan badge</span>
          <select
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2"
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
          <p className="text-sm font-medium text-zinc-700">Competitors</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600">
            {ws.competitors
              .filter((c) => c.selected)
              .map((c) => (
                <li key={c.id}>
                  {c.name} · {c.domain}
                </li>
              ))}
            {ws.competitors.filter((c) => c.selected).length === 0 && (
              <li className="text-zinc-400">None selected — run onboarding</li>
            )}
          </ul>
        </div>
        <button
          type="button"
          onClick={save}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </main>
  );
}
