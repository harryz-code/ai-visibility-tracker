import { wilsonInterval } from "./wilson";

export type BrandMention = {
  brand: string;
  position: number;
  rec_strength: number;
};

export type SampleExtraction = {
  mentions: BrandMention[];
  citedUrls: string[];
};

export type BrandModelMetrics = {
  brand: string;
  model: string;
  mentionRate: number;
  mentionRateCiLow: number;
  mentionRateCiHigh: number;
  avgPosition: number | null;
  shareOfVoice: number;
  citationShare: Record<string, number>;
  sampleCount: number;
  visibilityScore: number;
};

function domainFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Roll up sample-level extractions into per-brand metrics for one model.
 */
export function rollupMetrics(
  brandNames: string[],
  model: string,
  samples: SampleExtraction[],
): BrandModelMetrics[] {
  const n = samples.length;
  const mentionCounts = new Map<string, number>();
  const positionSums = new Map<string, number>();
  const positionCounts = new Map<string, number>();
  const recSums = new Map<string, number>();
  const domainCounts = new Map<string, number>();

  for (const b of brandNames) {
    mentionCounts.set(b, 0);
    positionSums.set(b, 0);
    positionCounts.set(b, 0);
    recSums.set(b, 0);
  }

  for (const sample of samples) {
    const seen = new Set<string>();
    for (const m of sample.mentions) {
      const key = brandNames.find(
        (b) => b.toLowerCase() === m.brand.toLowerCase(),
      );
      if (!key || seen.has(key)) continue;
      seen.add(key);
      mentionCounts.set(key, (mentionCounts.get(key) ?? 0) + 1);
      positionSums.set(key, (positionSums.get(key) ?? 0) + m.position);
      positionCounts.set(key, (positionCounts.get(key) ?? 0) + 1);
      recSums.set(key, (recSums.get(key) ?? 0) + m.rec_strength);
    }
    for (const url of sample.citedUrls) {
      const d = domainFromUrl(url);
      if (d) domainCounts.set(d, (domainCounts.get(d) ?? 0) + 1);
    }
  }

  const totalMentions = [...mentionCounts.values()].reduce((a, b) => a + b, 0);
  const totalDomainHits = [...domainCounts.values()].reduce((a, b) => a + b, 0);

  const citationShare: Record<string, number> = {};
  for (const [d, c] of domainCounts) {
    citationShare[d] = totalDomainHits ? c / totalDomainHits : 0;
  }

  return brandNames.map((brand) => {
    const successes = mentionCounts.get(brand) ?? 0;
    const ci = wilsonInterval(successes, n);
    const posN = positionCounts.get(brand) ?? 0;
    const avgPosition = posN ? (positionSums.get(brand) ?? 0) / posN : null;
    const avgRec = n ? (recSums.get(brand) ?? 0) / n : 0;
    // Visibility score 0–100: mention rate weighted by rec strength (max 3)
    const visibilityScore = Math.round(
      Math.min(100, ci.rate * 100 * (0.5 + (avgRec / 3) * 0.5)),
    );

    return {
      brand,
      model,
      mentionRate: ci.rate,
      mentionRateCiLow: ci.low,
      mentionRateCiHigh: ci.high,
      avgPosition,
      shareOfVoice: totalMentions ? successes / totalMentions : 0,
      citationShare,
      sampleCount: n,
      visibilityScore,
    };
  });
}
