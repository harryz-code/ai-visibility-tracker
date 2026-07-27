import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { brands, categories, completions, extractions, metricsDaily, prompts } from "@/db/schema";
import { generatePromptCorpus, suggestedCompetitors } from "@/lib/demo/generator";
import { scoreFromMentionRate } from "@/lib/metrics/rollup";
import { isFixtureMode } from "@/lib/models/types";
import type { ReportPayload } from "@/lib/report/build";
import { judgeRun, rollupRunToMetrics } from "./judge-rollup";
import { runSyncWave } from "./wave-sync";

async function findOrCreateCategory(name: string, market: string) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(categories)
    .where(eq(categories.name, name));
  if (existing) return existing;
  const [created] = await db.insert(categories).values({ name, market }).returning();
  return created;
}

async function findOrCreateBrand(name: string, categoryId: string) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(brands)
    .where(and(eq(brands.categoryId, categoryId), eq(brands.name, name)));
  if (existing) return existing;
  const [created] = await db
    .insert(brands)
    .values({ name, categoryId })
    .returning();
  return created;
}

async function ensurePrompts(
  categoryId: string,
  brandName: string,
  categoryName: string,
  competitorNames: string[],
) {
  const db = getDb();
  const existing = await db
    .select({ id: prompts.id })
    .from(prompts)
    .where(and(eq(prompts.categoryId, categoryId), eq(prompts.active, true)));
  if (existing.length > 0) return;

  const generated = generatePromptCorpus({
    brandName,
    category: categoryName,
    services: [],
    competitors: competitorNames.map((name) => ({ name })),
    count: 30,
  });
  for (const p of generated) {
    await db.insert(prompts).values({
      categoryId,
      text: p.text,
      intentType: p.intentType,
      active: true,
    });
  }
}

/**
 * Runs a small live wave for a free-report request: creates/reuses the
 * category + brand rows, generates a prompt corpus if needed, samples a
 * handful of prompts, judges + rolls up, then reads metrics_daily back into
 * the same ReportPayload shape the fixture builder produces. Throws on any
 * failure — callers should catch and fall back to the fixture payload.
 */
export async function runMiniWaveReport(
  brandName: string,
  categoryName: string,
): Promise<{ runId: string; payload: ReportPayload }> {
  const db = getDb();
  const category = await findOrCreateCategory(categoryName, "United States");
  const trackedBrand = await findOrCreateBrand(brandName, category.id);

  const competitors = suggestedCompetitors(categoryName, brandName).slice(0, 4);
  for (const c of competitors) {
    await findOrCreateBrand(c.name, category.id);
  }

  await ensurePrompts(
    category.id,
    brandName,
    categoryName,
    competitors.map((c) => c.name),
  );

  const fixture = isFixtureMode();
  const sampleN = fixture ? 2 : 4;
  const maxPrompts = fixture ? 8 : 30;

  const wave = await runSyncWave({ categoryId: category.id, sampleN, maxPrompts });
  await judgeRun(wave.runId);
  await rollupRunToMetrics(wave.runId);

  const today = new Date().toISOString().slice(0, 10);
  const metricRows = await db
    .select({
      brandId: metricsDaily.brandId,
      model: metricsDaily.model,
      mentionRate: metricsDaily.mentionRate,
      mentionRateCiLow: metricsDaily.mentionRateCiLow,
      mentionRateCiHigh: metricsDaily.mentionRateCiHigh,
      avgPosition: metricsDaily.avgPosition,
      citationShare: metricsDaily.citationShare,
      sampleCount: metricsDaily.sampleCount,
    })
    .from(metricsDaily)
    .where(and(eq(metricsDaily.categoryId, category.id), eq(metricsDaily.date, today)));

  const trackedRows = metricRows.filter((r) => r.brandId === trackedBrand.id);
  if (trackedRows.length === 0) {
    throw new Error("mini-wave produced no metrics for tracked brand");
  }

  const perModel = trackedRows.map((r) => ({
    model: r.model,
    mentionRate: r.mentionRate,
    ciLow: r.mentionRateCiLow,
    ciHigh: r.mentionRateCiHigh,
    avgPosition: r.avgPosition,
    visibilityScore: scoreFromMentionRate(r.mentionRate),
    sampleCount: r.sampleCount,
  }));
  const overallScore = Math.round(
    perModel.reduce((s, m) => s + m.visibilityScore, 0) / perModel.length,
  );

  const allBrands = await db
    .select({ id: brands.id, name: brands.name })
    .from(brands)
    .where(eq(brands.categoryId, category.id));
  const nameByBrandId = new Map(allBrands.map((b) => [b.id, b.name]));

  const byBrand = new Map<string, typeof metricRows>();
  for (const row of metricRows) {
    const list = byBrand.get(row.brandId) ?? [];
    list.push(row);
    byBrand.set(row.brandId, list);
  }
  const competitorRows = [...byBrand.entries()]
    .map(([brandId, rows]) => {
      const avgRate = rows.reduce((s, r) => s + r.mentionRate, 0) / rows.length;
      return {
        brand: nameByBrandId.get(brandId) ?? "Unknown",
        overallScore: scoreFromMentionRate(avgRate),
        mentionRate: avgRate,
        ciLow: Math.min(...rows.map((r) => r.mentionRateCiLow)),
        ciHigh: Math.max(...rows.map((r) => r.mentionRateCiHigh)),
      };
    })
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, 5);

  const domainCounts = new Map<string, number>();
  for (const row of trackedRows) {
    for (const [domain, share] of Object.entries(row.citationShare)) {
      domainCounts.set(
        domain,
        (domainCounts.get(domain) ?? 0) + share * row.sampleCount,
      );
    }
  }
  const citations = [...domainCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([domain, count]) => ({
      domain,
      count: Math.round(count),
      share: count / (trackedRows.reduce((s, r) => s + r.sampleCount, 0) || 1),
    }));

  const verbatims = await sampleVerbatims(wave.runId, brandName);

  const weakest = [...perModel].sort(
    (a, b) => a.visibilityScore - b.visibilityScore,
  )[0];
  const topCompetitor = competitorRows.find(
    (c) => c.brand.toLowerCase() !== brandName.toLowerCase(),
  );

  const payload: ReportPayload = {
    brandName,
    categoryName,
    overallScore,
    perModel,
    competitors: competitorRows,
    verbatims,
    citations,
    biggestGap: `${brandName}'s weakest surface is ${weakest.model} (score ${weakest.visibilityScore})${
      topCompetitor
        ? ` — ${topCompetitor.brand} leads the category at ${topCompetitor.overallScore}`
        : ""
    }. Prioritize citation and unaided prompts on ${weakest.model}.`,
    generatedAt: new Date().toISOString(),
    methodology: `Live mini-wave: ${wave.promptCount} prompts × ${sampleN} samples × ${wave.modelCount} models. Mention rates use Wilson 95% CIs.`,
  };

  return { runId: wave.runId, payload };
}

async function sampleVerbatims(runId: string, brandName: string): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ rawText: completions.rawText, mentions: extractions.mentions })
    .from(completions)
    .innerJoin(extractions, eq(extractions.completionId, completions.id))
    .where(eq(completions.runId, runId));

  const lower = brandName.toLowerCase();
  const matches = rows.filter((r) =>
    r.mentions.some((m) => m.brand.toLowerCase() === lower),
  );
  if (matches.length === 0) return [];

  return matches.slice(0, 3).map((r) => {
    const text = r.rawText.trim();
    return text.length > 180 ? `"${text.slice(0, 177)}…"` : `"${text}"`;
  });
}