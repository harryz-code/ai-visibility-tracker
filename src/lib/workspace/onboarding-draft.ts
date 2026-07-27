"use client";

import {
  emptyWorkspace,
  type WorkspaceState,
} from "@/lib/workspace/types";

export const ONBOARDING_DRAFT_KEY = "avt.onboarding.draft";

export type OnboardingDraft = {
  step: number;
  state: WorkspaceState;
};

export function loadOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingDraft;
    if (typeof parsed.step !== "number" || !parsed.state) return null;
    const base = emptyWorkspace();
    return {
      step: Math.min(Math.max(parsed.step, 0), 6),
      state: {
        ...base,
        ...parsed.state,
        brand: { ...base.brand, ...parsed.state.brand },
        company: { ...base.company, ...parsed.state.company },
      },
    };
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(step: number, state: WorkspaceState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    ONBOARDING_DRAFT_KEY,
    JSON.stringify({ step, state } satisfies OnboardingDraft),
  );
}

export function clearOnboardingDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_DRAFT_KEY);
}
