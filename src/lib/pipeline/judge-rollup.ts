import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  brands,
  completions,
  extractions,
  metricsDaily,
  runs,
} from "@/db/schema";
import { judgeCompletion } from "@/lib/judge";
import { rollupMetrics, type SampleExtraction } from "@/lib/metrics/rollup";
import type { ModelProvider } from "@/lib/models/types";

export type JudgeRunResult = {
  runId: string;
  completionsJudged: number;
  alreadyJudged: number;
};

/**
 * Loads completions for a run, extracts structured mentions for every
 * brand in the run's category, and writes versioned extractions.
 * Skips completions that already have an extraction (idempotent).
 */
export async function judgeRun(runId: string): Promise<JudgeRunResult> {
  const db = getDb();

  const [run] = await db
    .select({ categoryId: runs.categoryId })
    .from(runs)
    .where(eq(runs.id, runId));
  if (!run) throw new Error(`run ${runId} not found`);

  const categoryBrands = await db
    .select({ name: brands.name, aliases: brands.aliases })
    .from(brands)
    .where(eq(brands.categoryId, run.categoryId));

  const runCompletions = await db
    .select({
      id: completions.id,
      rawText: completions.rawText,
      citedUrls: completions.citedUrls,
    })
    .from(completions)
    .where(eq(completions.runId, runId));

  if (runCompletions.length === 0) {
    return { runId, completionsJudged: 0, alreadyJudged: 0 };
  }

  const existing = await db
    .select({ completionId: extractions.completionId })
    .from(extractions)
    .where(
      inArray(
        extractions.completionId,
        runCompletions.map((c) => c.id),
      ),
    );
  const judgedIds = new Set(existing.map((e) => e.completionId));

  let completionsJudged = 0;
  for (const completion of runCompletions) {
    if (judgedIds.has(completion.id)) continue;
    const { output, judgeVersion } = await judgeCompletion(
      completion.rawText,
      categoryBrands,
      completion.citedUrls,
    );
    await db.insert(extractions).values({
      completionId: completion.id,
      judgeVersion,
      mentions: output.mentions,
      citedUrls: output.cited_urls,
      refused: output.refused,
    });
    completionsJudged += 1;
  }

  return {
    runId,
    completionsJudged,
    alreadyJudged: judgedIds.size,
  };
}

export type RollupRunResult = {
  runId: string;
  date: string;
  brandsRolledUp: number;
  modelsRolledUp: number;
};

/**
 * Rolls up judged extractions for a run into metrics_daily, one row per
 * (brand, category, model, date). Upserts so re-running is safe.
 */
export async function rollupRunToMetrics(
  runId: string,
  date?: string,
): Promise<RollupRunResult> {
  const db = getDb();
  const day = date ?? new Date().toISOString().slice(0, 10);

  const [run] = await db
    .select({ categoryId: runs.categoryId })
    .from(runs)
    .where(eq(runs.id, runId));
  if (!run) throw new Error(`run ${runId} not found`);

  const categoryBrands = await db
    .select({ id: brands.id, name: brands.name })
    .from(brands)
    .where(eq(brands.categoryId, run.categoryId));
  const brandIdByName = new Map(categoryBrands.map((b) => [b.name, b.id]));
  const brandNames = categoryBrands.map((b) => b.name);

  const rows = await db
    .select({
      model: completions.model,
      mentions: extractions.mentions,
      citedUrls: extractions.citedUrls,
    })
    .from(completions)
    .innerJoin(extractions, eq(extractions.completionId, completions.id))
    .where(eq(completions.runId, runId));

  const byModel = new Map<ModelProvider, SampleExtraction[]>();
  for (const row of rows) {
    const model = row.model as ModelProvider;
    const list = byModel.get(model) ?? [];
    list.push({ mentions: row.mentions, citedUrls: row.citedUrls });
    byModel.set(model, list);
  }

  let modelsRolledUp = 0;
  for (const [model, samples] of byModel) {
    const metrics = rollupMetrics(brandNames, model, samples);
    for (const m of metrics) {
      const brandId = brandIdByName.get(m.brand);
      if (!brandId) continue;
      await db
        .insert(metricsDaily)
        .values({
          brandId,
          categoryId: run.categoryId,
          model,
          date: day,
          mentionRate: m.mentionRate,
          mentionRateCiLow: m.mentionRateCiLow,
          mentionRateCiHigh: m.mentionRateCiHigh,
          avgPosition: m.avgPosition,
          shareOfVoice: m.shareOfVoice,
          citationShare: m.citationShare,
          sampleCount: m.sampleCount,
        })
        .onConflictDoUpdate({
          target: [
            metricsDaily.brandId,
            metricsDaily.categoryId,
            metricsDaily.model,
            metricsDaily.date,
          ],
          set: {
            mentionRate: m.mentionRate,
            mentionRateCiLow: m.mentionRateCiLow,
            mentionRateCiHigh: m.mentionRateCiHigh,
            avgPosition: m.avgPosition,
            shareOfVoice: m.shareOfVoice,
            citationShare: m.citationShare,
            sampleCount: m.sampleCount,
          },
        });
    }
    modelsRolledUp += 1;
  }

  return {
    runId,
    date: day,
    brandsRolledUp: brandNames.length,
    modelsRolledUp,
  };
}