import { wilsonInterval } from "@/lib/metrics/wilson";
import type { ModelProvider } from "@/lib/models/types";

export type DemoBrand = {
  id: string;
  name: string;
  aliases: string[];
  domain: string;
};

export type DemoPrompt = {
  id: string;
  text: string;
  intentType:
    | "category_query"
    | "comparison"
    | "best_for"
    | "alternative"
    | "trust"
    | "howto";
};

export type ModelMetricPoint = {
  model: ModelProvider;
  mentionRate: number;
  ciLow: number;
  ciHigh: number;
  avgPosition: number | null;
  visibilityScore: number;
  sampleCount: number;
};

export type TimeseriesPoint = {
  date: string;
  openai: number;
  anthropic: number;
  gemini: number;
  perplexity: number;
};

export type CompetitorRow = {
  brand: string;
  overallScore: number;
  mentionRate: number;
  ciLow: number;
  ciHigh: number;
};

export type CitationRow = {
  domain: string;
  share: number;
  count: number;
};

export type DemoDataset = {
  category: { id: string; name: string; market: string };
  trackedBrand: string;
  brands: DemoBrand[];
  prompts: DemoPrompt[];
  perModel: ModelMetricPoint[];
  timeseries: TimeseriesPoint[];
  competitors: CompetitorRow[];
  citations: CitationRow[];
  verbatims: string[];
  biggestGap: string;
};

const BRANDS: DemoBrand[] = [
  {
    id: "b-affirm",
    name: "Affirm",
    aliases: ["Affirm", "Affrm"],
    domain: "affirm.com",
  },
  {
    id: "b-klarna",
    name: "Klarna",
    aliases: ["Klarna"],
    domain: "klarna.com",
  },
  {
    id: "b-afterpay",
    name: "Afterpay",
    aliases: ["Afterpay", "After Pay"],
    domain: "afterpay.com",
  },
  {
    id: "b-sezzle",
    name: "Sezzle",
    aliases: ["Sezzle"],
    domain: "sezzle.com",
  },
];

const INTENT_MIX: DemoPrompt["intentType"][] = [
  ...Array(9).fill("category_query"),
  ...Array(6).fill("comparison"),
  ...Array(6).fill("best_for"),
  ...Array(3).fill("alternative"),
  ...Array(3).fill("trust"),
  ...Array(3).fill("howto"),
] as DemoPrompt["intentType"][];

const PROMPT_TEMPLATES: Record<DemoPrompt["intentType"], string[]> = {
  category_query: [
    "best bnpl apps 2026?",
    "what buy now pay later should i use",
    "top installment payment apps in the us",
  ],
  comparison: [
    "affirm vs klarna which is better",
    "afterpay or affirm for online shopping",
    "klarna vs sezzle for small purchases",
  ],
  best_for: [
    "best bnpl for furniture",
    "best pay in 4 for fashion sites",
    "best installment loan for electronics",
  ],
  alternative: [
    "alternatives to klarna",
    "what's like affirm but cheaper",
    "afterpay alternatives us",
  ],
  trust: [
    "is affirm legit",
    "klarna credit score impact?",
    "does afterpay report to credit bureaus",
  ],
  howto: [
    "how does bnpl work",
    "how to pay off affirm early",
    "how to get approved for klarna",
  ],
};

function buildPrompts(): DemoPrompt[] {
  return INTENT_MIX.map((intent, i) => {
    const pool = PROMPT_TEMPLATES[intent];
    const text = pool[i % pool.length];
    return {
      id: `p-${String(i + 1).padStart(3, "0")}`,
      text: i >= pool.length ? `${text} (${Math.floor(i / pool.length) + 1})` : text,
      intentType: intent,
    };
  });
}

/** Deterministic pseudo rates for demo charts */
function rateFor(brand: string, model: ModelProvider): { successes: number; n: number } {
  const n = 240; // 30 prompts × 8 samples stylized aggregate
  const base: Record<string, number> = {
    Affirm: 0.62,
    Klarna: 0.71,
    Afterpay: 0.48,
    Sezzle: 0.29,
  };
  const modelBoost: Record<ModelProvider, number> = {
    openai: 0.04,
    anthropic: -0.02,
    gemini: 0.01,
    perplexity: 0.06,
  };
  const p = Math.min(0.95, Math.max(0.05, (base[brand] ?? 0.4) + modelBoost[model]));
  return { successes: Math.round(p * n), n };
}

function scoreFromRate(rate: number, rec = 1.6): number {
  return Math.round(Math.min(100, rate * 100 * (0.5 + (rec / 3) * 0.5)));
}

export function getDemoDataset(trackedBrand = "Affirm"): DemoDataset {
  const models: ModelProvider[] = ["openai", "anthropic", "gemini", "perplexity"];
  const perModel: ModelMetricPoint[] = models.map((model) => {
    const { successes, n } = rateFor(trackedBrand, model);
    const ci = wilsonInterval(successes, n);
    return {
      model,
      mentionRate: ci.rate,
      ciLow: ci.low,
      ciHigh: ci.high,
      avgPosition: model === "perplexity" ? 1.8 : model === "openai" ? 2.1 : 2.4,
      visibilityScore: scoreFromRate(ci.rate),
      sampleCount: n,
    };
  });

  const timeseries: TimeseriesPoint[] = Array.from({ length: 8 }, (_, i) => {
    const d = new Date("2026-06-02");
    d.setDate(d.getDate() + i * 7);
    const drift = (i - 4) * 0.015;
    const point = (brand: string, model: ModelProvider) => {
      const { successes, n } = rateFor(brand, model);
      return scoreFromRate(Math.min(0.95, Math.max(0.05, successes / n + drift)));
    };
    return {
      date: d.toISOString().slice(0, 10),
      openai: point(trackedBrand, "openai"),
      anthropic: point(trackedBrand, "anthropic"),
      gemini: point(trackedBrand, "gemini"),
      perplexity: point(trackedBrand, "perplexity"),
    };
  });

  const competitors: CompetitorRow[] = BRANDS.map((b) => {
    const agg = models.map((m) => rateFor(b.name, m));
    const successes = agg.reduce((s, x) => s + x.successes, 0);
    const n = agg.reduce((s, x) => s + x.n, 0);
    const ci = wilsonInterval(successes, n);
    return {
      brand: b.name,
      overallScore: scoreFromRate(ci.rate),
      mentionRate: ci.rate,
      ciLow: ci.low,
      ciHigh: ci.high,
    };
  }).sort((a, b) => b.overallScore - a.overallScore);

  const citations: CitationRow[] = [
    { domain: "nerdwallet.com", share: 0.22, count: 54 },
    { domain: "bankrate.com", share: 0.18, count: 44 },
    { domain: "affirm.com", share: 0.14, count: 34 },
    { domain: "klarna.com", share: 0.12, count: 29 },
    { domain: "investopedia.com", share: 0.1, count: 24 },
    { domain: "cnet.com", share: 0.09, count: 22 },
    { domain: "afterpay.com", share: 0.08, count: 19 },
    { domain: "wikipedia.org", share: 0.07, count: 17 },
  ];

  const klarna = competitors.find((c) => c.brand === "Klarna")!;
  const weakest = [...perModel].sort((a, b) => a.visibilityScore - b.visibilityScore)[0];

  return {
    category: {
      id: "cat-bnpl-us",
      name: "BNPL",
      market: "US",
    },
    trackedBrand,
    brands: BRANDS,
    prompts: buildPrompts(),
    perModel,
    timeseries,
    competitors,
    citations,
    verbatims: [
      `"Affirm is a close second if you want transparent APR."`,
      `"For bigger ticket items, Affirm tends to show up ahead of Afterpay."`,
      `"Popular BNPL apps: 1) Affirm 2) Klarna 3) Afterpay."`,
    ],
    biggestGap: `${trackedBrand}'s weakest model is ${weakest.model} (score ${weakest.visibilityScore}) vs Klarna's overall ${klarna.overallScore}. Closing the ${weakest.model} gap is the highest-leverage fix.`,
  };
}

export const demoDataset = getDemoDataset("Affirm");
