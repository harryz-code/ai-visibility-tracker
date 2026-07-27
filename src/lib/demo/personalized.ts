import { wilsonInterval, isSignificantChange } from "@/lib/metrics/wilson";
import type { ModelProvider } from "@/lib/models/types";
import type { IntentType, WorkspaceState } from "@/lib/workspace/types";
import { resolveCategoryLabel } from "@/lib/workspace/types";
import { suggestedCompetitors } from "./generator";
import {
  getDemoDataset,
  type DemoDataset,
  type ModelMetricPoint,
  type TimeseriesPoint,
} from "./data";

export type PromptResultRow = {
  id: string;
  text: string;
  intentType: IntentType | string;
  win: boolean;
  mentionRate: number;
  bestModel: ModelProvider;
  samples: {
    model: ModelProvider;
    mentioned: boolean;
    snippet: string;
  }[];
};

export type AlertRow = {
  id: string;
  title: string;
  detail: string;
  significant: boolean;
  model: ModelProvider;
  oldRate: number;
  newRate: number;
  ciLow: number;
  ciHigh: number;
};

export type CitationIntelRow = {
  domain: string;
  share: number;
  count: number;
  recommendation: string;
};

export type PersonalizedDemo = DemoDataset & {
  promptResults: PromptResultRow[];
  alerts: AlertRow[];
  citationIntel: CitationIntelRow[];
  benchmarkMedian: number;
  selectedModels: ModelProvider[];
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function scoreFromRate(rate: number, rec = 1.6): number {
  return Math.round(Math.min(100, rate * 100 * (0.5 + (rec / 3) * 0.5)));
}

function brandModelRate(
  brand: string,
  model: ModelProvider,
  industry: string,
): { successes: number; n: number } {
  const n = 240;
  const h = hash(`${brand}:${model}:${industry}`);
  const base = 0.28 + (h % 50) / 100;
  const modelBoost: Record<ModelProvider, number> = {
    openai: 0.04,
    anthropic: -0.02,
    gemini: 0.01,
    perplexity: 0.05,
  };
  const p = Math.min(0.92, Math.max(0.08, base + modelBoost[model]));
  return { successes: Math.round(p * n), n };
}

export function getPersonalizedDemo(
  workspace?: WorkspaceState | null,
): PersonalizedDemo {
  const industry = workspace
    ? resolveCategoryLabel(workspace.brand)
    : "Financial Services";
  const tracked =
    workspace?.completedOnboarding && workspace.brand.name.trim()
      ? workspace.brand.name.trim()
      : workspace?.brand.name.trim() || "Your brand";
  const market = workspace?.brand.market || "United States";

  const models: ModelProvider[] =
    workspace?.models?.length
      ? workspace.models
      : ["openai", "anthropic", "gemini", "perplexity"];

  const base = getDemoDataset("Affirm");

  const perModel: ModelMetricPoint[] = models.map((model) => {
    const { successes, n } = brandModelRate(tracked, model, industry);
    const ci = wilsonInterval(successes, n);
    return {
      model,
      mentionRate: ci.rate,
      ciLow: ci.low,
      ciHigh: ci.high,
      avgPosition: 1.8 + (hash(model + tracked) % 20) / 10,
      visibilityScore: scoreFromRate(ci.rate),
      sampleCount: n,
    };
  });

  const timeseries: TimeseriesPoint[] = Array.from({ length: 8 }, (_, i) => {
    const d = new Date("2026-06-02");
    d.setDate(d.getDate() + i * 7);
    const drift = (i - 4) * 0.012;
    const point = (model: ModelProvider) => {
      const { successes, n } = brandModelRate(tracked, model, industry);
      return scoreFromRate(
        Math.min(0.95, Math.max(0.05, successes / n + drift)),
      );
    };
    return {
      date: d.toISOString().slice(0, 10),
      openai: models.includes("openai") ? point("openai") : 0,
      anthropic: models.includes("anthropic") ? point("anthropic") : 0,
      gemini: models.includes("gemini") ? point("gemini") : 0,
      perplexity: models.includes("perplexity") ? point("perplexity") : 0,
    };
  });

  const competitorSource =
    workspace?.competitors?.filter((c) => c.selected).length
      ? workspace.competitors.filter((c) => c.selected)
      : suggestedCompetitors(industry, tracked);

  const competitors = [
    (() => {
      const agg = models.map((m) => brandModelRate(tracked, m, industry));
      const successes = agg.reduce((s, x) => s + x.successes, 0);
      const n = agg.reduce((s, x) => s + x.n, 0);
      const ci = wilsonInterval(successes, n);
      return {
        brand: tracked,
        overallScore: scoreFromRate(ci.rate),
        mentionRate: ci.rate,
        ciLow: ci.low,
        ciHigh: ci.high,
      };
    })(),
    ...competitorSource.map((c) => {
      const agg = models.map((m) => brandModelRate(c.name, m, industry));
      const successes = agg.reduce((s, x) => s + x.successes, 0);
      const n = agg.reduce((s, x) => s + x.n, 0);
      const ci = wilsonInterval(successes, n);
      return {
        brand: c.name,
        overallScore: scoreFromRate(ci.rate),
        mentionRate: ci.rate,
        ciLow: ci.low,
        ciHigh: ci.high,
      };
    }),
  ].sort((a, b) => b.overallScore - a.overallScore);

  const prompts =
    workspace?.prompts?.filter((p) => p.selected).length
      ? workspace.prompts.filter((p) => p.selected)
      : base.prompts;

  const promptResults: PromptResultRow[] = prompts.slice(0, 40).map((p) => {
    const h = hash(p.text + tracked + industry);
    const win = h % 3 !== 0;
    const mentionRate = win ? 0.55 + (h % 30) / 100 : 0.1 + (h % 20) / 100;
    const bestModel = models[h % models.length];
    return {
      id: p.id,
      text: p.text,
      intentType: p.intentType,
      win,
      mentionRate,
      bestModel,
      samples: models.map((model, mi) => ({
        model,
        mentioned: win
          ? mi !== models.length - 1 || h % 2 === 0
          : mi === 0 && h % 5 === 0,
        snippet: win
          ? `…${tracked} shows up for ${industry.toLowerCase()} questions like “${p.text.slice(0, 42)}…”`
          : `…${industry} answers lean elsewhere; ${tracked} is missing from this ${model} sample…`,
      })),
    };
  });

  const alerts: AlertRow[] = models.map((model, i) => {
    const { successes, n } = brandModelRate(tracked, model, industry);
    const ci = wilsonInterval(Math.max(1, successes - 10 + i * 3), n);
    const oldRate = i % 2 === 0 ? ci.rate - 0.18 : ci.rate - 0.02;
    const significant = isSignificantChange(Math.max(0, oldRate), ci);
    return {
      id: `alert-${model}`,
      title: significant
        ? `${tracked} mention rate changed on ${model}`
        : `${model} week-over-week move (not significant)`,
      detail: significant
        ? `New rate ${(ci.rate * 100).toFixed(1)}% — previous ${(Math.max(0, oldRate) * 100).toFixed(1)}% sits outside the 95% CI (${(ci.low * 100).toFixed(1)}–${(ci.high * 100).toFixed(1)}%).`
        : `Change is inside the Wilson 95% CI — suppressed to avoid false alarms.`,
      significant,
      model,
      oldRate: Math.max(0, oldRate),
      newRate: ci.rate,
      ciLow: ci.low,
      ciHigh: ci.high,
    };
  });

  const domainSeed = hash(industry + tracked);
  const citationIntel: CitationIntelRow[] = [
    "nerdwallet.com",
    "bankrate.com",
    "techcrunch.com",
    "wirecutter.com",
    "reddit.com",
    "wikipedia.org",
    `${tracked.toLowerCase().replace(/\s+/g, "")}.com`,
    "forbes.com",
  ].map((domain, i) => {
    const count = 50 - i * 5 + (domainSeed % 7);
    const share = count / 220;
    return {
      domain,
      share,
      count,
      recommendation:
        share > 0.12
          ? `High leverage: earn a citation on ${domain}`
          : `Monitor ${domain} — rising in ${industry} answers`,
    };
  });

  const weakest = [...perModel].sort(
    (a, b) => a.visibilityScore - b.visibilityScore,
  )[0];
  const topComp = competitors.find((c) => c.brand !== tracked);

  return {
    ...base,
    trackedBrand: tracked,
    category: {
      id: `cat-${industry.toLowerCase().replace(/\s+/g, "-")}`,
      name: industry,
      market,
    },
    perModel,
    timeseries,
    competitors,
    prompts: prompts.map((p) => ({
      id: p.id,
      text: p.text,
      intentType: p.intentType as DemoDataset["prompts"][number]["intentType"],
    })),
    citations: citationIntel.map(({ domain, share, count }) => ({
      domain,
      share,
      count,
    })),
    verbatims: [
      `"${tracked} is frequently listed for ${industry.toLowerCase()} buyers."`,
      `"Compared with peers, ${tracked} shows up more on practical how-to prompts."`,
      `"In ${market}, assistants often pair ${tracked} with category alternatives."`,
    ],
    biggestGap: `${tracked}'s weakest surface is ${weakest?.model ?? "openai"} (score ${weakest?.visibilityScore ?? 0})${
      topComp
        ? ` — ${topComp.brand} leads at ${topComp.overallScore}`
        : ""
    }. Prioritize unaided prompts on that model.`,
    promptResults,
    alerts,
    citationIntel,
    benchmarkMedian: 34 + (hash(industry) % 12),
    selectedModels: models,
  };
}

/** Fixture leaderboard rows for any industry */
export function getIndustryLeaderboard(industry: string) {
  const comps = suggestedCompetitors(industry);
  const models: ModelProvider[] = [
    "openai",
    "anthropic",
    "gemini",
    "perplexity",
  ];
  return comps
    .map((c) => {
      const agg = models.map((m) => brandModelRate(c.name, m, industry));
      const successes = agg.reduce((s, x) => s + x.successes, 0);
      const n = agg.reduce((s, x) => s + x.n, 0);
      const ci = wilsonInterval(successes, n);
      return {
        brand: c.name,
        overallScore: scoreFromRate(ci.rate),
        mentionRate: ci.rate,
        ciLow: ci.low,
        ciHigh: ci.high,
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore);
}
