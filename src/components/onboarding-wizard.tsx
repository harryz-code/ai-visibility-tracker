"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  generatePromptCorpus,
  suggestedCompetitors,
  suggestedServices,
} from "@/lib/demo/generator";
import { loadWorkspace, saveWorkspace } from "@/lib/workspace/storage";
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "@/lib/workspace/onboarding-draft";
import { BrandMark, DemoBadge } from "@/components/brand";
import { IndustryGrid } from "@/components/industry-grid";
import {
  IconAbsent,
  IconAdd,
  IconCheck,
  IconPresent,
} from "@/components/icons";
import { ModelBadge } from "@/components/model-badge";
import {
  emptyWorkspace,
  OTHER_CATEGORY,
  resolveCategoryLabel,
  type CompanyRole,
  type CompanySize,
  type ModelProvider,
  type WorkspaceState,
} from "@/lib/workspace/types";
import Link from "next/link";

const STEP_CAPTIONS = [
  "SETTING UP YOUR BRAND",
  "BUILDING YOUR PROFILE",
  "DISCOVERING YOUR SERVICES",
  "BENCHMARKING COMPETITORS",
  "DISCOVERING YOUR PROMPTS",
  "CONFIGURING MODELS",
  "READY TO TRACK",
];

const ROLES: { id: CompanyRole; label: string }[] = [
  { id: "agency", label: "Agency" },
  { id: "consultant", label: "Consultant / Freelancer" },
  { id: "in_house", label: "In-house marketing team" },
  { id: "other", label: "Other" },
];

const SIZES: { id: CompanySize; label: string }[] = [
  { id: "1-10", label: "1–10 employees" },
  { id: "11-50", label: "11–50 employees" },
  { id: "50-200", label: "50–200 employees" },
  { id: "200+", label: "200+ employees" },
];

const ALL_MODELS: { id: ModelProvider; label: string }[] = [
  { id: "openai", label: "ChatGPT" },
  { id: "anthropic", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "perplexity", label: "Perplexity" },
];

function ChoiceCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
        selected
          ? "border-primary bg-primary-muted text-primary"
          : "border-border bg-surface text-ink hover:border-border-strong"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
          selected
            ? "border-primary bg-primary text-white"
            : "border-border-strong bg-surface text-transparent"
        }`}
      >
        <IconCheck size={12} />
      </span>
      {children}
    </button>
  );
}

function PreviewPane({
  step,
  brand,
  industry,
  competitorCount,
  promptCount,
  models,
}: {
  step: number;
  brand: string;
  industry: string;
  competitorCount: number;
  promptCount: number;
  models: string[];
}) {
  const ranking = [
    { name: brand || "You", present: true },
    { name: "Competitor A", present: true },
    { name: "Competitor B", present: false },
  ];
  const modelList = (
    models.length ? models : ["openai", "anthropic", "gemini", "perplexity"]
  ).slice(0, 4);

  return (
    <div
      className="relative hidden h-full flex-col justify-center p-8 lg:flex"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(74,44,224,0.18), transparent), var(--primary-muted)",
      }}
    >
      <div className="absolute right-6 top-6">
        <DemoBadge />
      </div>
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface card-shadow">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <BrandMark href={null} size={22} />
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            {industry || "Industry"}
          </span>
        </div>
        <div className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2 text-[11px] text-ink-muted">
            <span className="rounded-full bg-surface-muted px-2 py-0.5 font-medium text-ink">
              {brand || "Brand"}
            </span>
            <span className="rounded-full bg-surface-muted px-2 py-0.5">
              {competitorCount} competitors
            </span>
            <span className="rounded-full bg-surface-muted px-2 py-0.5">
              {promptCount || "—"} prompts
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Score", value: step >= 6 ? "68" : "—" },
              { label: "Mention", value: step >= 5 ? "54%" : "—" },
              { label: "Rank", value: step >= 4 ? "#2" : "—" },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded-[12px] border border-border bg-surface-muted/50 px-3 py-2"
              >
                <p className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
                  {k.label}
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-ink">
                  {k.value}
                </p>
              </div>
            ))}
          </div>
          <div className="h-28 rounded-[12px] bg-gradient-to-br from-primary-muted to-surface-muted p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
              Visibility over time
            </p>
            <div className="mt-3 flex h-16 items-end gap-1">
              {[40, 55, 48, 62, 58, 70, 66, 72].map((h, i) => (
                <div
                  key={i}
                  className="chart-bar flex-1 rounded-t bg-primary/70"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 40}ms`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {modelList.map((m) => (
              <div
                key={m}
                className="rounded-[12px] border border-border p-2 text-center"
              >
                <div className="flex justify-center">
                  <ModelBadge model={m} />
                </div>
                <p className="mt-1.5 text-sm font-semibold tabular-nums text-ink">
                  {40 + m.length * 3}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-[12px] border border-border p-3">
            <p className="font-mono text-[10px] uppercase tracking-wide text-ink-muted">
              Industry ranking
            </p>
            <div className="mt-2 space-y-2">
              {ranking.map((b, i) => (
                <div
                  key={b.name + i}
                  className="flex items-center justify-between text-xs text-ink-body"
                >
                  <span className="inline-flex items-center gap-1.5">
                    {b.present ? (
                      <IconPresent size={12} className="text-success" />
                    ) : (
                      <IconAbsent size={12} className="text-ink-muted" />
                    )}
                    {i + 1}. {b.name}
                  </span>
                  <span className="tabular-nums">{72 - i * 11}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs font-medium tracking-[0.2em] text-primary/80">
        — {STEP_CAPTIONS[step]} —
      </p>
    </div>
  );
}

export function OnboardingWizard() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WorkspaceState>(() => {
    const base = emptyWorkspace();
    base.services = suggestedServices(base.brand.category);
    base.competitors = suggestedCompetitors(base.brand.category);
    return base;
  });
  const [customCompName, setCustomCompName] = useState("");
  const [customCompUrl, setCustomCompUrl] = useState("");
  const [newService, setNewService] = useState("");

  useEffect(() => {
    const existing = loadWorkspace();
    setHasExisting(Boolean(existing.completedOnboarding));
    const draft = loadOnboardingDraft();
    if (draft) {
      setStep(draft.step);
      setState(draft.state);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveOnboardingDraft(step, state);
  }, [hydrated, step, state]);

  const selectedCompetitorCount = state.competitors.filter((c) => c.selected)
    .length;
  const selectedPromptCount = state.prompts.filter((p) => p.selected).length;

  const promptsByIntent = useMemo(() => {
    const map = new Map<string, WorkspaceState["prompts"]>();
    for (const p of state.prompts) {
      const list = map.get(p.intentType) ?? [];
      list.push(p);
      map.set(p.intentType, list);
    }
    return [...map.entries()];
  }, [state]);

  function next() {
    if (step < 6) setStep(step + 1);
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  function onCategoryChange(category: string, other = "") {
    setState((s) => ({
      ...s,
      brand: { ...s.brand, category, categoryOther: other },
      services: suggestedServices(
        category === OTHER_CATEGORY ? other || category : category,
      ),
      competitors: suggestedCompetitors(
        category === OTHER_CATEGORY ? other || category : category,
        s.brand.name,
      ),
      prompts: [],
    }));
  }

  function generatePrompts() {
    const selected = state.competitors.filter((c) => c.selected);
    const categoryLabel = resolveCategoryLabel(state.brand);
    const prompts = generatePromptCorpus({
      brandName: state.brand.name || "Your brand",
      category: categoryLabel,
      services: state.services,
      competitors: selected,
      count: 30,
    });
    setState((s) => ({ ...s, prompts }));
    setStep(4);
  }

  function finish() {
    const final: WorkspaceState = {
      ...state,
      completedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };
    saveWorkspace(final);
    clearOnboardingDraft();
    router.push("/dashboard");
  }

  const canNext = (() => {
    if (step === 0) {
      const hasBrand = Boolean(state.brand.name.trim() && state.brand.url.trim());
      const otherOk =
        state.brand.category !== OTHER_CATEGORY ||
        Boolean(state.brand.categoryOther.trim());
      return hasBrand && otherOk;
    }
    if (step === 1) return Boolean(state.company.role && state.company.size);
    if (step === 2) return state.services.length > 0;
    if (step === 3) return selectedCompetitorCount > 0;
    if (step === 4) return selectedPromptCount > 0;
    if (step === 5) return state.models.length > 0;
    return true;
  })();

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(320px,420px)_1fr]">
      <div className="flex flex-col border-r border-border bg-surface">
        <div className="flex items-center justify-between px-6 py-5">
          <BrandMark size={28} href="/" />
          <div className="flex items-center gap-3">
            <DemoBadge />
            {hasExisting && (
              <Link
                href="/dashboard"
                className="text-xs font-medium text-primary hover:underline"
              >
                Skip to dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-6 pb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-ink-muted">
            Step {step + 1}/7
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="step-progress h-full rounded-full bg-primary"
              style={{ width: `${((step + 1) / 7) * 100}%` }}
            />
          </div>

          {step === 0 && (
            <div className="mt-3 space-y-5">
              <div>
                <h1 className="text-2xl font-semibold text-ink">
                  Add your brand details
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                  Track your brand visibility in AI responses.
                </p>
              </div>
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted">
                Brand URL
                <div className="mt-1 flex overflow-hidden rounded-xl border border-border">
                  <span className="bg-surface-muted px-3 py-2.5 text-sm text-ink-muted">
                    https://
                  </span>
                  <input
                    className="w-full px-3 py-2.5 text-sm outline-none"
                    placeholder="yoursite.com"
                    value={state.brand.url.replace(/^https?:\/\//, "")}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        brand: {
                          ...s.brand,
                          url: e.target.value.replace(/^https?:\/\//, ""),
                        },
                      }))
                    }
                  />
                </div>
              </label>
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted">
                Brand name
                <input
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="Your brand name"
                  value={state.brand.name}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      brand: { ...s.brand, name: e.target.value },
                      competitors: suggestedCompetitors(
                        s.brand.category,
                        e.target.value,
                      ),
                    }))
                  }
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Market
                  <select
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                    value={state.brand.market}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        brand: { ...s.brand, market: e.target.value },
                      }))
                    }
                  >
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>EU</option>
                  </select>
                </label>
                <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Language
                  <select
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm"
                    value={state.brand.language}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        brand: { ...s.brand, language: e.target.value },
                      }))
                    }
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </label>
              </div>
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted">
                Industry
                <div className="mt-2">
                  <IndustryGrid
                    value={state.brand.category}
                    otherValue={state.brand.categoryOther}
                    onChange={onCategoryChange}
                  />
                </div>
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="mt-3 space-y-5">
              <div>
                <h1 className="text-2xl font-semibold text-ink">
                  Tell us about your company
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                  This helps us tailor your experience.
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                  What best describes you?
                </p>
                <div className="space-y-2">
                  {ROLES.map((r) => (
                    <ChoiceCard
                      key={r.id}
                      selected={state.company.role === r.id}
                      onClick={() =>
                        setState((s) => ({
                          ...s,
                          company: { ...s.company, role: r.id },
                        }))
                      }
                    >
                      {r.label}
                    </ChoiceCard>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Company size
                </p>
                <div className="space-y-2">
                  {SIZES.map((r) => (
                    <ChoiceCard
                      key={r.id}
                      selected={state.company.size === r.id}
                      onClick={() =>
                        setState((s) => ({
                          ...s,
                          company: { ...s.company, size: r.id },
                        }))
                      }
                    >
                      {r.label}
                    </ChoiceCard>
                  ))}
                </div>
              </div>
              <label className="block text-xs font-medium uppercase tracking-wide text-ink-muted">
                How did you find us?
                <input
                  className="mt-1 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="e.g. Google, LinkedIn, a friend, X, a podcast..."
                  value={state.company.foundUs}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      company: { ...s.company, foundUs: e.target.value },
                    }))
                  }
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="mt-3 space-y-5">
              <div>
                <h1 className="text-2xl font-semibold text-ink">
                  We detected these services
                  {state.brand.name ? ` for ${state.brand.name}` : ""}
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                  We&apos;ll use them to generate prompts. Confirm or edit before
                  continuing.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {state.services.map((svc) => (
                  <button
                    key={svc}
                    type="button"
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        services: s.services.filter((x) => x !== svc),
                      }))
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary-muted px-3 py-1.5 text-sm text-primary"
                  >
                    {svc}
                    <span className="text-primary">×</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="Add a service..."
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newService.trim()) {
                      e.preventDefault();
                      setState((s) => ({
                        ...s,
                        services: [...s.services, newService.trim()],
                      }));
                      setNewService("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-border px-3 text-ink-body hover:bg-surface-muted"
                  onClick={() => {
                    if (!newService.trim()) return;
                    setState((s) => ({
                      ...s,
                      services: [...s.services, newService.trim()],
                    }));
                    setNewService("");
                  }}
                  aria-label="Add service"
                >
                  <IconAdd size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-3 space-y-5">
              <div>
                <h1 className="text-2xl font-semibold text-ink">
                  Select your competitors
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                  Choose which competitors to benchmark. You can change these
                  later.
                </p>
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {state.competitors.map((c) => (
                  <ChoiceCard
                    key={c.id}
                    selected={c.selected}
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        competitors: s.competitors.map((x) =>
                          x.id === c.id ? { ...x, selected: !x.selected } : x,
                        ),
                      }))
                    }
                  >
                    <span>
                      <span className="block font-medium">{c.name}</span>
                      <span className="text-xs text-ink-muted">{c.domain}</span>
                    </span>
                  </ChoiceCard>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="w-1/2 rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="Brand name"
                  value={customCompName}
                  onChange={(e) => setCustomCompName(e.target.value)}
                />
                <input
                  className="w-1/2 rounded-xl border border-border px-3 py-2 text-sm"
                  placeholder="domain.com"
                  value={customCompUrl}
                  onChange={(e) => setCustomCompUrl(e.target.value)}
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-border px-3"
                  onClick={() => {
                    if (!customCompName.trim()) return;
                    setState((s) => ({
                      ...s,
                      competitors: [
                        ...s.competitors,
                        {
                          id: `custom-${Date.now()}`,
                          name: customCompName.trim(),
                          domain: customCompUrl.trim() || "example.com",
                          selected: true,
                        },
                      ],
                    }));
                    setCustomCompName("");
                    setCustomCompUrl("");
                  }}
                  aria-label="Add competitor"
                >
                  <IconAdd size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mt-3 space-y-5">
              <div>
                <h1 className="text-2xl font-semibold text-ink">
                  Select your prompts
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                  Choose which prompts to track. You can add more later.
                </p>
              </div>
              {state.prompts.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  No prompts yet — go back and generate from services.
                </p>
              ) : (
                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {promptsByIntent.map(([intent, list]) => {
                    const selected = list.filter((p) => p.selected).length;
                    return (
                      <div
                        key={intent}
                        className="rounded-xl border border-border"
                      >
                        <div className="flex items-center justify-between border-b border-border px-3 py-2">
                          <span className="text-sm font-medium capitalize text-ink">
                            {intent.replaceAll("_", " ")}
                          </span>
                          <span className="text-xs text-ink-muted">
                            {selected}/{list.length}
                          </span>
                        </div>
                        <div className="space-y-1 p-2">
                          {list.map((p) => (
                            <ChoiceCard
                              key={p.id}
                              selected={p.selected}
                              onClick={() =>
                                setState((s) => ({
                                  ...s,
                                  prompts: s.prompts.map((x) =>
                                    x.id === p.id
                                      ? { ...x, selected: !x.selected }
                                      : x,
                                  ),
                                }))
                              }
                            >
                              {p.text}
                            </ChoiceCard>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="mt-3 space-y-5">
              <div>
                <h1 className="text-2xl font-semibold text-ink">
                  Models & cadence
                </h1>
                <p className="mt-1 text-sm text-ink-muted">
                  Which AI assistants should we sample? (Demo — no live calls
                  yet.)
                </p>
              </div>
              <div className="space-y-2">
                {ALL_MODELS.map((m) => (
                  <ChoiceCard
                    key={m.id}
                    selected={state.models.includes(m.id)}
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        models: s.models.includes(m.id)
                          ? s.models.filter((x) => x !== m.id)
                          : [...s.models, m.id],
                      }))
                    }
                  >
                    {m.label}
                  </ChoiceCard>
                ))}
              </div>
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Wave cadence
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(["weekly", "daily"] as const).map((c) => (
                    <ChoiceCard
                      key={c}
                      selected={state.cadence === c}
                      onClick={() => setState((s) => ({ ...s, cadence: c }))}
                    >
                      <span className="capitalize">{c}</span>
                    </ChoiceCard>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="mt-3 space-y-5">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-white">
                  {(state.brand.name || "A").slice(0, 1).toUpperCase()}
                </div>
                <h1 className="text-2xl font-semibold text-ink">
                  Your AI visibility for {state.brand.name || "your brand"}
                </h1>
                <p className="mt-2 text-sm text-ink-muted">
                  Based on multi-sample AI visibility methodology.
                </p>
                <p className="text-sm text-ink-muted">
                  Data from ChatGPT, Claude, Gemini, and Perplexity.
                </p>
              </div>
              <div className="flex justify-center gap-4 text-xs font-medium text-ink-body">
                {state.models.map((m) => (
                  <span
                    key={m}
                    className="rounded-full border border-border px-3 py-1 capitalize"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="rounded-xl border border-border p-4">
                <h2 className="text-sm font-semibold text-ink">
                  Industry ranking
                </h2>
                <p className="mb-3 text-xs text-ink-muted">
                  See how your brand ranks against competitors in AI answers.
                </p>
                <div className="space-y-2 blur-sm select-none">
                  <div className="grid grid-cols-5 gap-2 text-[10px] uppercase text-ink-muted">
                    <span>#</span>
                    <span className="col-span-2">Brand</span>
                    <span>Visibility</span>
                    <span>SOV</span>
                  </div>
                  {[state.brand.name, ...state.competitors.filter((c) => c.selected).slice(0, 3).map((c) => c.name)].map(
                    (b, i) => (
                      <div
                        key={b}
                        className="grid grid-cols-5 gap-2 text-sm text-ink-body"
                      >
                        <span>{i + 1}</span>
                        <span className="col-span-2">{b}</span>
                        <span>{68 - i * 9}%</span>
                        <span>{28 - i * 5}%</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <ul className="space-y-1 text-sm text-ink-body">
                <li>
                  {selectedPromptCount} prompts · {selectedCompetitorCount}{" "}
                  competitors · {state.cadence} waves
                </li>
                <li className="text-xs text-ink-muted">
                  Demo mode — metrics are fixture-generated until live APIs are
                  connected.
                </li>
              </ul>
            </div>
          )}

          <div className="mt-auto space-y-3 pt-8">
            {step === 2 ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={generatePrompts}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                Generate prompts
              </button>
            ) : step === 3 ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={() => {
                  generatePrompts();
                }}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                Next ({selectedCompetitorCount} selected)
              </button>
            ) : step === 4 ? (
              <button
                type="button"
                disabled={!canNext}
                onClick={next}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                Next ({selectedPromptCount} selected)
              </button>
            ) : step === 6 ? (
              <button
                type="button"
                onClick={finish}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover"
              >
                Continue to App →
              </button>
            ) : (
              <button
                type="button"
                disabled={!canNext}
                onClick={next}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50"
              >
                Next
              </button>
            )}
            {step > 0 && step < 6 && (
              <button
                type="button"
                onClick={back}
                className="w-full text-sm text-ink-muted hover:text-ink"
              >
                Back
              </button>
            )}
            <p className="text-center text-[11px] text-ink-muted">
              ©2026 AVT · Demo onboarding · No backend required
            </p>
          </div>
        </div>
      </div>

      <PreviewPane
        step={step}
        brand={state.brand.name}
        industry={resolveCategoryLabel(state.brand)}
        competitorCount={selectedCompetitorCount}
        promptCount={selectedPromptCount}
        models={state.models}
      />
    </div>
  );
}
