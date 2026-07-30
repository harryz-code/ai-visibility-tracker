import {
  getPersonalizedDemo,
  type PersonalizedDemo,
  type PromptResultRow,
} from "./personalized";
import type { WorkspaceState } from "@/lib/workspace/types";
import type { ModelProvider } from "@/lib/models/types";

export type DateRange = "7d" | "30d";

const INTENT_TOPIC: Record<string, string> = {
  category_query: "Category discovery",
  comparison: "Comparisons",
  best_for: "Best-for use cases",
  alternative: "Alternatives",
  trust: "Trust & legitimacy",
  howto: "How-to & education",
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function deltaFrom(seed: string, scale = 2.5): number {
  const h = hash(seed);
  return Number((((h % 100) / 100) * scale * 2 - scale).toFixed(1));
}

export type InsightPromptRow = PromptResultRow & {
  topic: string;
  visibilityScore: number;
  visibilityRank: number;
  avgPosition: number;
  citationShare: number;
  deltas: {
    visibilityScore: number;
    avgPosition: number;
    citationShare: number;
  };
};

export type TopicGroup = {
  topic: string;
  prompts: InsightPromptRow[];
  visibilityRank: number;
  visibilityScore: number;
  avgPosition: number;
  citationShare: number;
  deltas: InsightPromptRow["deltas"];
};

export type RankRow = {
  brand: string;
  score: number;
  mentionRate: number;
  delta: number;
  owned: boolean;
  shareOfVoice: number;
};

export type CitationDomain = {
  domain: string;
  share: number;
  count: number;
  delta: number;
  owned: boolean;
  recommendation: string;
  pages: {
    url: string;
    share: number;
    globalShare: number;
    delta: number;
  }[];
};

export type CitationTypeBucket = {
  type: string;
  share: number;
  count: number;
};

export type RegionRow = {
  market: string;
  score: number;
  delta: number;
};

export type PersonaRow = {
  id: string;
  name: string;
  description: string;
  score: number;
  delta: number;
};

export type SentimentSlice = {
  label: "Positive" | "Neutral" | "Negative";
  share: number;
};

export type InsightsBundle = PersonalizedDemo & {
  overallScore: number;
  overallDelta: number;
  rank: number;
  visibilityRank: RankRow[];
  shareOfVoice: RankRow[];
  topicGroups: TopicGroup[];
  citationDomains: CitationDomain[];
  citationShare: number;
  citationShareDelta: number;
  citationRank: number;
  citationTypes: CitationTypeBucket[];
  citationTimeseries: { date: string; share: number; previous: number }[];
  regions: RegionRow[];
  personas: PersonaRow[];
  sentiment: SentimentSlice[];
  previousTimeseries: PersonalizedDemo["timeseries"];
};

export function getInsightsBundle(
  workspace?: WorkspaceState | null,
  range: DateRange = "7d",
): InsightsBundle {
  const demo = getPersonalizedDemo(workspace);
  const len = range === "7d" ? 7 : 8;
  const timeseries = demo.timeseries.slice(-len);
  const previousTimeseries = demo.timeseries.slice(0, len).map((p, i) => ({
    ...p,
    date: timeseries[i]?.date ?? p.date,
    openai: Math.max(0, p.openai - 3 - (i % 3)),
    anthropic: Math.max(0, p.anthropic - 2),
    gemini: Math.max(0, p.gemini - 4),
    perplexity: Math.max(0, p.perplexity - 1),
  }));

  const overallScore = Math.round(
    demo.perModel.reduce((s, m) => s + m.visibilityScore, 0) /
      Math.max(1, demo.perModel.length),
  );
  const overallDelta = deltaFrom(`${demo.trackedBrand}:overall`, 1.8);

  const totalMentions = demo.competitors.reduce(
    (s, c) => s + c.mentionRate,
    0.0001,
  );

  const visibilityRank: RankRow[] = demo.competitors.map((c) => ({
    brand: c.brand,
    score: c.overallScore,
    mentionRate: c.mentionRate,
    delta: deltaFrom(`${c.brand}:rank`, 2.2),
    owned: c.brand === demo.trackedBrand,
    shareOfVoice: c.mentionRate / totalMentions,
  }));

  const rank =
    visibilityRank.findIndex((r) => r.owned) >= 0
      ? visibilityRank.findIndex((r) => r.owned) + 1
      : 1;

  const ownedDomain = `${demo.trackedBrand.toLowerCase().replace(/\s+/g, "")}.com`;

  const enrichedPrompts: InsightPromptRow[] = demo.promptResults.map((p, i) => {
    const topic =
      INTENT_TOPIC[String(p.intentType)] ?? "General";
    const visibilityScore = Math.round(p.mentionRate * 100);
    return {
      ...p,
      topic,
      visibilityScore,
      visibilityRank: p.win ? 1 + (i % 3) : 2 + (i % 4),
      avgPosition: Number((1.2 + (hash(p.id) % 25) / 10).toFixed(1)),
      citationShare: Number(((hash(p.id) % 40) / 10).toFixed(1)),
      deltas: {
        visibilityScore: deltaFrom(`${p.id}:vs`, 8),
        avgPosition: deltaFrom(`${p.id}:pos`, 0.4),
        citationShare: deltaFrom(`${p.id}:cs`, 0.6),
      },
    };
  });

  const topicMap = new Map<string, InsightPromptRow[]>();
  for (const p of enrichedPrompts) {
    const list = topicMap.get(p.topic) ?? [];
    list.push(p);
    topicMap.set(p.topic, list);
  }

  const topicGroups: TopicGroup[] = [...topicMap.entries()].map(
    ([topic, prompts]) => {
      const visibilityScore = Math.round(
        prompts.reduce((s, p) => s + p.visibilityScore, 0) / prompts.length,
      );
      return {
        topic,
        prompts,
        visibilityRank: Math.min(...prompts.map((p) => p.visibilityRank)),
        visibilityScore,
        avgPosition: Number(
          (
            prompts.reduce((s, p) => s + p.avgPosition, 0) / prompts.length
          ).toFixed(1),
        ),
        citationShare: Number(
          (
            prompts.reduce((s, p) => s + p.citationShare, 0) / prompts.length
          ).toFixed(1),
        ),
        deltas: {
          visibilityScore: deltaFrom(`${topic}:tvs`, 4),
          avgPosition: deltaFrom(`${topic}:tpos`, 0.3),
          citationShare: deltaFrom(`${topic}:tcs`, 0.5),
        },
      };
    },
  );

  const citationDomains: CitationDomain[] = demo.citationIntel.map((c) => {
    const owned = c.domain === ownedDomain || c.domain.includes(
      demo.trackedBrand.toLowerCase().replace(/\s+/g, ""),
    );
    return {
      domain: c.domain,
      share: c.share,
      count: c.count,
      delta: deltaFrom(`${c.domain}:cd`, 0.4),
      owned,
      recommendation: c.recommendation,
      pages: Array.from({ length: 3 }, (_, pi) => ({
        url: `https://${c.domain}/guides/${demo.category.name.toLowerCase().replace(/\s+/g, "-")}-${pi + 1}`,
        share: Number(((c.share * 100) / (pi + 1.2)).toFixed(1)),
        globalShare: Number((c.share * 0.2 / (pi + 1)).toFixed(2)),
        delta: deltaFrom(`${c.domain}:p${pi}`, 1.2),
      })),
    };
  }).sort((a, b) => b.share - a.share);

  const ownedCite = citationDomains.find((d) => d.owned);
  const citationShare = ownedCite?.share ?? citationDomains[0]?.share ?? 0.02;
  const citationRank =
    (citationDomains.findIndex((d) => d.owned) >= 0
      ? citationDomains.findIndex((d) => d.owned)
      : 5) + 1;

  const citationTypes: CitationTypeBucket[] = [
    { type: "Editorial", share: 0.38, count: 84 },
    { type: "UGC", share: 0.27, count: 60 },
    { type: "Brand", share: 0.19, count: 42 },
    { type: "Other", share: 0.16, count: 35 },
  ];

  const citationTimeseries = timeseries.map((t, i) => ({
    date: t.date,
    share: Number(
      (citationShare * 100 * (0.85 + (i / timeseries.length) * 0.25)).toFixed(2),
    ),
    previous: Number(
      (citationShare * 100 * (0.75 + (i / timeseries.length) * 0.15)).toFixed(2),
    ),
  }));

  const regions: RegionRow[] = [
    { market: demo.category.market || "United States", score: overallScore, delta: overallDelta },
    { market: "United Kingdom", score: overallScore - 6, delta: deltaFrom("uk", 2) },
    { market: "Canada", score: overallScore - 9, delta: deltaFrom("ca", 1.5) },
    { market: "Australia", score: overallScore - 11, delta: deltaFrom("au", 2) },
  ];

  const personas: PersonaRow[] = [
    {
      id: "buyer",
      name: "Category buyer",
      description: "Unaided purchase research prompts",
      score: overallScore + 4,
      delta: deltaFrom("persona-buyer", 2),
    },
    {
      id: "comparer",
      name: "Comparer",
      description: "Brand vs brand and alternatives",
      score: overallScore - 3,
      delta: deltaFrom("persona-comp", 2),
    },
    {
      id: "skeptic",
      name: "Trust skeptic",
      description: "Legitimacy and credit-impact questions",
      score: overallScore - 8,
      delta: deltaFrom("persona-trust", 2),
    },
    {
      id: "operator",
      name: "How-to operator",
      description: "Setup and payoff workflows",
      score: overallScore + 1,
      delta: deltaFrom("persona-howto", 2),
    },
  ];

  const sentiment: SentimentSlice[] = [
    { label: "Positive", share: 0.48 },
    { label: "Neutral", share: 0.39 },
    { label: "Negative", share: 0.13 },
  ];

  return {
    ...demo,
    timeseries,
    previousTimeseries,
    overallScore,
    overallDelta,
    rank,
    visibilityRank,
    shareOfVoice: visibilityRank,
    topicGroups,
    citationDomains,
    citationShare,
    citationShareDelta: deltaFrom("cite-share", 0.3),
    citationRank,
    citationTypes,
    citationTimeseries,
    regions,
    personas,
    sentiment,
  };
}

export function modelLabel(m: ModelProvider): string {
  return (
    {
      openai: "ChatGPT",
      anthropic: "Claude",
      gemini: "Gemini",
      perplexity: "Perplexity",
    } as const
  )[m];
}
