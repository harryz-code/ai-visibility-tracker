"use client";

import { useEffect, useMemo, useState } from "react";
import { DemoBadge } from "@/components/brand";
import { BetaBadge } from "@/components/insights/badges";
import { IconClose } from "@/components/icons";
import { ModelBadge } from "@/components/model-badge";
import { getInsightsBundle } from "@/lib/demo/insights";
import { loadWorkspace } from "@/lib/workspace/storage";
import {
  buildBriefText,
  CONTENT_TEMPLATES,
  loadContentProjects,
  loadFavorites,
  saveContentProjects,
  saveFavorites,
  seedFixtureProjects,
  WORKFLOW_STEPS,
  type ContentConfig,
  type ContentProject,
  type ContentTemplateId,
} from "@/lib/content/storage";
import { cn } from "@/lib/utils";
import type { ModelProvider } from "@/lib/models/types";

type View = "library" | "config" | "brief";

const INTENTS = [
  "All",
  "Informational",
  "Comparative",
  "Social",
  "Transactional",
] as const;

export default function ContentPage() {
  const [view, setView] = useState<View>("library");
  const [projects, setProjects] = useState<ContentProject[]>([]);
  const [favorites, setFavorites] = useState<ContentTemplateId[]>([]);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [intentFilter, setIntentFilter] = useState<(typeof INTENTS)[number]>(
    "All",
  );
  const [active, setActive] = useState<ContentProject | null>(null);
  const [editorTab, setEditorTab] = useState<"brief" | "draft">("brief");
  const [config, setConfig] = useState<ContentConfig | null>(null);
  const [brand, setBrand] = useState("Demo brand");
  const [fixtureTopics, setFixtureTopics] = useState<string[]>([]);
  const [fixturePrompts, setFixturePrompts] = useState<string[]>([]);
  const [fixturePlatforms, setFixturePlatforms] = useState<ModelProvider[]>(
    [],
  );
  const [fixtureUrls, setFixtureUrls] = useState<string[]>([]);

  useEffect(() => {
    const ws = loadWorkspace();
    const demo = getInsightsBundle(ws, "7d");
    setBrand(demo.trackedBrand);
    setFixtureTopics(demo.topicGroups.map((t) => t.topic));
    setFixturePrompts(demo.promptResults.slice(0, 6).map((p) => p.text));
    setFixturePlatforms(demo.selectedModels);
    setFixtureUrls(
      demo.citationDomains.flatMap((d) => d.pages.map((p) => p.url)).slice(0, 5),
    );

    let loaded = loadContentProjects();
    if (loaded.length === 0) {
      loaded = seedFixtureProjects(
        demo.trackedBrand,
        demo.topicGroups[0]?.topic ?? demo.category.name,
      );
      saveContentProjects(loaded);
    }
    setProjects(loaded);
    setFavorites(loadFavorites());
  }, []);

  function persist(next: ContentProject[]) {
    setProjects(next);
    saveContentProjects(next);
  }

  function startFromTemplate(templateId: ContentTemplateId) {
    setTemplatesOpen(false);
    setConfig({
      topic: fixtureTopics[0] ?? "Category discovery",
      prompts: fixturePrompts.slice(0, 3),
      platforms: fixturePlatforms,
      topCitedPages: fixtureUrls.slice(0, 2),
      brandKit: `${brand} voice — clear, credible, category-native.`,
      audience: "Category buyers researching options in AI answers",
      instructions: "",
      templateId,
    });
    setView("config");
  }

  function generateBrief() {
    if (!config) return;
    const brief = buildBriefText(config, brand);
    const project: ContentProject = {
      ...config,
      id: `p-${Date.now()}`,
      title: `${config.topic} — ${CONTENT_TEMPLATES.find((t) => t.id === config.templateId)?.name}`,
      status: "Generating",
      updatedAt: new Date().toISOString(),
      brief,
      draft: "",
      workflowStep: 0,
    };
    persist([project, ...projects]);
    setActive(project);
    setEditorTab("brief");
    setView("brief");
    simulateWorkflow(project.id);
  }

  function simulateWorkflow(id: string) {
    let step = 0;
    const tick = () => {
      step += 1;
      setProjects((prev) => {
        const next = prev.map((p) => {
          if (p.id !== id) return p;
          const done = step >= WORKFLOW_STEPS.length - 1;
          const updated: ContentProject = {
            ...p,
            workflowStep: Math.min(step, WORKFLOW_STEPS.length - 1),
            status: done ? "Completed" : "Generating",
            draft: done
              ? `## Final draft\n\n${p.brief}\n\n### Opening\n${brand} helps buyers evaluate options when AI assistants recommend ${p.topic.toLowerCase()} solutions.\n\n### Body\nCover the tracked prompts, cite owned pages, and close with a clear next step.`
              : p.draft,
            updatedAt: new Date().toISOString(),
          };
          if (active?.id === id) setActive(updated);
          return updated;
        });
        saveContentProjects(next);
        return next;
      });
      if (step < WORKFLOW_STEPS.length - 1) {
        window.setTimeout(tick, 700);
      }
    };
    window.setTimeout(tick, 600);
  }

  function toggleFavorite(id: ContentTemplateId) {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }

  const filteredTemplates = useMemo(() => {
    return CONTENT_TEMPLATES.filter(
      (t) =>
        intentFilter === "All" ||
        t.intents.includes(
          intentFilter as Exclude<(typeof INTENTS)[number], "All">,
        ),
    ).sort((a, b) => {
      const af = favorites.includes(a.id) ? 0 : 1;
      const bf = favorites.includes(b.id) ? 0 : 1;
      return af - bf;
    });
  }, [intentFilter, favorites]);

  if (view === "config" && config) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-6">
        <button
          type="button"
          className="text-sm text-primary hover:underline"
          onClick={() => setView("library")}
        >
          ← Back to library
        </button>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            Configuration
          </p>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Generate Content Brief
          </h1>
        </div>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-ink">Topic</span>
          <select
            className="focus-ring h-10 w-full rounded-lg border border-border bg-surface px-3"
            value={config.topic}
            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
          >
            {fixtureTopics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink">Prompts</legend>
          {fixturePrompts.map((p) => {
            const checked = config.prompts.includes(p);
            return (
              <label
                key={p}
                className="flex items-start gap-2 text-sm text-ink-body"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={checked}
                  onChange={() =>
                    setConfig({
                      ...config,
                      prompts: checked
                        ? config.prompts.filter((x) => x !== p)
                        : [...config.prompts, p],
                    })
                  }
                />
                <span>{p}</span>
              </label>
            );
          })}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink">Platforms</legend>
          <div className="flex flex-wrap gap-3">
            {fixturePlatforms.map((m) => {
              const checked = config.platforms.includes(m);
              return (
                <label
                  key={m}
                  className="inline-flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setConfig({
                        ...config,
                        platforms: checked
                          ? config.platforms.filter((x) => x !== m)
                          : [...config.platforms, m],
                      })
                    }
                  />
                  <ModelBadge model={m} showLabel />
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-ink">
            Top-cited pages (optional)
          </legend>
          {fixtureUrls.map((u) => {
            const checked = config.topCitedPages.includes(u);
            return (
              <label
                key={u}
                className="flex items-start gap-2 text-sm text-ink-muted"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={checked}
                  onChange={() =>
                    setConfig({
                      ...config,
                      topCitedPages: checked
                        ? config.topCitedPages.filter((x) => x !== u)
                        : [...config.topCitedPages, u],
                    })
                  }
                />
                <span className="break-all">{u.replace(/^https?:\/\//, "")}</span>
              </label>
            );
          })}
        </fieldset>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-ink">Brand kit</span>
          <textarea
            className="focus-ring min-h-20 w-full rounded-lg border border-border bg-surface p-3"
            value={config.brandKit}
            onChange={(e) => setConfig({ ...config, brandKit: e.target.value })}
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-ink">Audience segment</span>
          <input
            className="focus-ring h-10 w-full rounded-lg border border-border bg-surface px-3"
            value={config.audience}
            onChange={(e) => setConfig({ ...config, audience: e.target.value })}
          />
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-ink">Additional instructions</span>
          <textarea
            className="focus-ring min-h-20 w-full rounded-lg border border-border bg-surface p-3"
            value={config.instructions}
            onChange={(e) =>
              setConfig({ ...config, instructions: e.target.value })
            }
            placeholder="Tone, must-include facts, CTA…"
          />
        </label>

        <button
          type="button"
          onClick={generateBrief}
          className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:opacity-95"
        >
          Generate Content Brief
        </button>
      </div>
    );
  }

  if (view === "brief" && active) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[1fr_280px] md:px-6">
        <div className="min-w-0 space-y-4">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => setView("library")}
          >
            ← Back to library
          </button>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {active.title}
          </h1>
          <div className="flex gap-2 border-b border-border">
            {(
              [
                ["brief", "Content Brief"],
                ["draft", "Final Draft"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setEditorTab(id)}
                className={cn(
                  "border-b-2 px-3 py-2 text-sm",
                  editorTab === id
                    ? "border-ink font-semibold text-ink"
                    : "border-transparent text-ink-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <pre className="whitespace-pre-wrap rounded-[12px] border border-border bg-surface p-5 text-sm text-ink-body card-shadow">
            {editorTab === "brief"
              ? active.brief || "Brief generating…"
              : active.draft || "Draft appears when workflow completes."}
          </pre>
        </div>

        <aside className="rounded-[12px] border border-border bg-surface p-4 card-shadow">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Workflow
          </p>
          <ol className="mt-3 space-y-2">
            {WORKFLOW_STEPS.map((step, i) => {
              const done = i < active.workflowStep;
              const current = i === active.workflowStep;
              return (
                <li
                  key={step}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    done && "text-success",
                    current && "font-semibold text-ink",
                    !done && !current && "text-ink-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full font-mono text-[10px]",
                      done && "bg-success-muted text-success",
                      current && "bg-primary text-white",
                      !done && !current && "bg-surface-muted",
                    )}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  {step}
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-xs text-ink-muted">
            Simulated progress — no live model calls.
          </p>
        </aside>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <DemoBadge />
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
              Content
            </p>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Generate Content
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Turn visibility gaps into briefs and drafts — fixture workflow.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setTemplatesOpen(true)}
          className="rounded-[12px] border border-border bg-surface p-5 text-left card-shadow hover:border-primary"
        >
          <p className="font-semibold text-ink">Create New Content</p>
          <p className="mt-1 text-sm text-ink-muted">
            Pick a template, configure topics and prompts, generate a brief.
          </p>
        </button>
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-[12px] border border-border bg-surface-muted p-5 text-left opacity-80"
        >
          <p className="flex items-center gap-2 font-semibold text-ink">
            Optimize Existing <BetaBadge />
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Coming soon — improve pages already ranking in citations.
          </p>
        </button>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-border bg-surface card-shadow">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th>Template</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr
                key={p.id}
                className="cursor-pointer border-t border-border hover:bg-primary-muted/40"
                onClick={() => {
                  setActive(p);
                  setView("brief");
                }}
              >
                <td className="px-4 py-3 font-medium text-ink">{p.title}</td>
                <td className="text-ink-muted">
                  {CONTENT_TEMPLATES.find((t) => t.id === p.templateId)?.name}
                </td>
                <td>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      p.status === "Completed" &&
                        "bg-success-muted text-success",
                      p.status === "Draft" && "bg-surface-muted text-ink-muted",
                      p.status === "Generating" &&
                        "bg-primary-muted text-primary",
                    )}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="text-ink-muted">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {templatesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[16px] bg-surface p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  Templates
                </h2>
                <p className="text-sm text-ink-muted">
                  Choose a format, then configure inputs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTemplatesOpen(false)}
                className="rounded-md p-1 text-ink-muted hover:text-ink"
                aria-label="Close"
              >
                <IconClose size={18} />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {INTENTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIntentFilter(i)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium",
                    intentFilter === i
                      ? "bg-primary text-white"
                      : "border border-border text-ink-muted",
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {filteredTemplates.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-[12px] border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{t.name}</p>
                    <p className="text-sm text-ink-muted">{t.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      className="text-xs text-ink-muted hover:text-primary"
                      onClick={() => toggleFavorite(t.id)}
                    >
                      {favorites.includes(t.id) ? "★ Fav" : "☆ Fav"}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                      onClick={() => startFromTemplate(t.id)}
                    >
                      Use
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
