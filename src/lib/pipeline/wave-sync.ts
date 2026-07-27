import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { completions, prompts, runs } from "@/db/schema";
import { ALL_MODELS, complete, type ModelProvider } from "@/lib/models";

export type RunSyncWaveInput = {
  categoryId: string;
  sampleN?: number;
  models?: ModelProvider[];
  /** Cap total prompt count sampled (used for lighter free-report waves). */
  maxPrompts?: number;
  /** Reuse an existing (pending) run instead of creating a new one. */
  runId?: string;
};

export type RunSyncWaveResult = {
  runId: string;
  promptCount: number;
  modelCount: number;
  sampleN: number;
  completionsWritten: number;
  totalCostUsd: number;
  budgetExceeded: boolean;
};

function maxWaveCostUsd(): number {
  const raw = process.env.MAX_WAVE_COST_USD;
  const n = raw ? Number(raw) : 25;
  return Number.isFinite(n) ? n : 25;
}

/**
 * Runs a wave synchronously (no Inngest) — creates a run, loads active
 * prompts for the category, samples each prompt × model × sampleN, and
 * writes completions idempotently. Used when Inngest keys are absent
 * (e.g. free-report mini-waves, local dev).
 */
export async function runSyncWave(
  input: RunSyncWaveInput,
): Promise<RunSyncWaveResult> {
  const { categoryId, sampleN = 8, models = ALL_MODELS, maxPrompts } = input;
  const db = getDb();
  const budget = maxWaveCostUsd();

  let runId = input.runId;
  if (runId) {
    await db
      .update(runs)
      .set({ status: "running", sampleN })
      .where(eq(runs.id, runId));
  } else {
    const [run] = await db
      .insert(runs)
      .values({ categoryId, status: "running", sampleN })
      .returning({ id: runs.id });
    runId = run.id;
  }

  const activePrompts = await db
    .select({ id: prompts.id, text: prompts.text })
    .from(prompts)
    .where(sql`${prompts.categoryId} = ${categoryId} AND ${prompts.active} = true`);

  const selectedPrompts = maxPrompts
    ? activePrompts.slice(0, maxPrompts)
    : activePrompts;

  let totalCostUsd = 0;
  let completionsWritten = 0;
  let budgetExceeded = false;

  outer: for (const prompt of selectedPrompts) {
    for (const model of models) {
      for (let s = 1; s <= sampleN; s++) {
        if (totalCostUsd >= budget) {
          budgetExceeded = true;
          break outer;
        }
        const result = await complete(model, { prompt: prompt.text }, s);
        totalCostUsd += result.costUsd;

        const [row] = await db
          .insert(completions)
          .values({
            runId,
            promptId: prompt.id,
            model,
            sampleN: s,
            rawText: result.text,
            citedUrls: result.citedUrls,
            latencyMs: result.latencyMs,
            costUsd: result.costUsd,
          })
          .onConflictDoNothing()
          .returning({ id: completions.id });

        if (row) completionsWritten += 1;
      }
    }
  }

  await db
    .update(runs)
    .set({
      status: budgetExceeded ? "failed" : "completed",
      totalCostUsd: sql`${runs.totalCostUsd} + ${totalCostUsd}`,
    })
    .where(eq(runs.id, runId));

  return {
    runId,
    promptCount: selectedPrompts.length,
    modelCount: models.length,
    sampleN,
    completionsWritten,
    totalCostUsd,
    budgetExceeded,
  };
}
