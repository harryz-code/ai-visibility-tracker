"use client";

import {
  emptyWorkspace,
  WORKSPACE_KEY,
  type WorkspaceState,
} from "./types";

export function loadWorkspace(): WorkspaceState {
  if (typeof window === "undefined") return emptyWorkspace();
  try {
    const raw = window.localStorage.getItem(WORKSPACE_KEY);
    if (!raw) return emptyWorkspace();
    const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
    if (parsed?.version !== 1) return emptyWorkspace();
    const base = emptyWorkspace();
    return {
      ...base,
      ...parsed,
      brand: {
        ...base.brand,
        ...parsed.brand,
        categoryOther: parsed.brand?.categoryOther ?? "",
      },
      company: { ...base.company, ...parsed.company },
    };
  } catch {
    return emptyWorkspace();
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(next));
}

export function clearWorkspace(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(WORKSPACE_KEY);
}
