import { wilsonInterval, isSignificantChange } from "@/lib/metrics/wilson";
import type { ModelProvider } from "@/lib/models/types";
import type { IntentType, WorkspaceState } from "@/lib/workspace/types";
import { getDemoDataset, type DemoDataset } from "./data";

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
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getPersonalizedDemo(
  workspace?: WorkspaceState | null,
): PersonalizedDemo {
  const tracked =
    workspace?.completedOnboarding && workspace.brand.name
      ? workspace.brand.name
      : "Affirm";
  const base = getDemoDataset(tracked === "Affirm" ? "Affirm" : "Affirm");

  // Relabel tracked brand in competitor table
  const competitors = base.competitors.map((c) =>
    c.brand === "Affirm" ? { ...c, brand: tracked } : c,
  );
  if (!competitors.some((c) => c.brand === tracked)) {
    competitors.unshift({
      brand: tracked,
      overallScore: 52,
      mentionRate: 0.58,
      ciLow: 0.52,
      ciHigh: 0.64,
    });
  }

  // Prefer onboarded competitors
  if (workspace?.competitors?.length) {
    for (const c of workspace.competitors.filter((x) => x.selected)) {
      if (!competitors.some((x) => x.brand === c.name)) {
        const h = hash(c.name);
        const rate = 0.25 + (h % 40) / 100;
        const ci = wilsonInterval(Math.round(rate * 200), 200);
        competitors.push({
          brand: c.name,
          overallScore: Math.round(rate * 100 * 0.85),
          mentionRate: ci.rate,
          ciLow: ci.low,
          ciHigh: ci.high,
        });
      }
    }
  }

  const prompts =
    workspace?.prompts?.filter((p) => p.selected).length
      ? workspace.prompts.filter((p) => p.selected)
      : base.prompts;

  const models: ModelProvider[] =
    workspace?.models?.length
      ? workspace.models
      : ["openai", "anthropic", "gemini", "perplexity"];

  const promptResults: PromptResultRow[] = prompts.slice(0, 40).map((p) => {
    const h = hash(p.text + tracked);
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
        mentioned: win ? mi !== models.length - 1 || h % 2 === 0 : mi === 0 && h % 5 === 0,
        snippet: win
          ? `…${tracked} is often recommended for this use case alongside other ${base.category.name} options…`
          : `…answers focus on other brands; ${tracked} is absent from this sample…`,
      })),
    };
  });

  const alerts: AlertRow[] = models.map((model, i) => {
    const newSuccesses = 40 + i * 5;
    const n = 80;
    const ci = wilsonInterval(newSuccesses, n);
    const oldRate = i % 2 === 0 ? 0.35 : ci.rate - 0.02;
    const significant = isSignificantChange(oldRate, ci);
    return {
      id: `alert-${model}`,
      title: significant
        ? `${tracked} mention rate changed on ${model}`
        : `${model} week-over-week move (not significant)`,
      detail: significant
        ? `New rate ${(ci.rate * 100).toFixed(1)}% — previous ${(oldRate * 100).toFixed(1)}% sits outside the 95% CI (${(ci.low * 100).toFixed(1)}–${(ci.high * 100).toFixed(1)}%).`
        : `Change is inside the Wilson 95% CI — suppressed to avoid false alarms.`,
      significant,
      model,
      oldRate,
      newRate: ci.rate,
      ciLow: ci.low,
      ciHigh: ci.high,
    };
  });

  const citationIntel: CitationIntelRow[] = base.citations.map((c) => ({
    ...c,
    recommendation:
      c.share > 0.12
        ? `High leverage: earn a citation on ${c.domain}`
        : `Monitor ${c.domain} — rising in category answers`,
  }));

  return {
    ...base,
    trackedBrand: tracked,
    category: {
      ...base.category,
      name: workspace?.brand.category || base.category.name,
      market: workspace?.brand.market || base.category.market,
    },
    competitors: competitors.sort((a, b) => b.overallScore - a.overallScore),
    prompts: prompts.map((p) => ({
      id: p.id,
      text: p.text,
      intentType: p.intentType as DemoDataset["prompts"][number]["intentType"],
    })),
    verbatims: base.verbatims.map((v) => v.replaceAll("Affirm", tracked)),
    biggestGap: base.biggestGap.replaceAll("Affirm", tracked),
    promptResults,
    alerts,
    citationIntel,
    benchmarkMedian: 34,
  };
}
