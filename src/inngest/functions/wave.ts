import { eq, sql } from "drizzle-orm";
import { inngest } from "../client";
import { getDb } from "@/db";
import { completions, prompts, runs } from "@/db/schema";
import { ALL_MODELS, complete, type ModelProvider } from "@/lib/models";

export type WaveStartData = {
  runId: string;
  categoryId: string;
  sampleN?: number;
  models?: ModelProvider[];
};

export type WaveSampleData = {
  runId: string;
  promptId: string;
  model: ModelProvider;
  sampleN: number;
  promptText: string;
};

function maxWaveCostUsd(): number {
  const raw = process.env.MAX_WAVE_COST_USD;
  const n = raw ? Number(raw) : 25;
  return Number.isFinite(n) ? n : 25;
}

/**
 * wave/start — mark run running, fan out sample jobs for each
 * active prompt × model × sample index.
 */
export const waveStart = inngest.createFunction(
  {
    id: "wave-start",
    retries: 2,
    triggers: [{ event: "wave/start" }],
  },
  async ({ event, step }) => {
    const {
      runId,
      categoryId,
      sampleN = 8,
      models = ALL_MODELS,
    } = event.data as WaveStartData;

    await step.run("mark-running", async () => {
      const db = getDb();
      await db
        .update(runs)
        .set({ status: "running", sampleN })
        .where(eq(runs.id, runId));
    });

    const activePrompts = await step.run("load-prompts", async () => {
      const db = getDb();
      return db
        .select({ id: prompts.id, text: prompts.text })
        .from(prompts)
        .where(
          sql`${prompts.categoryId} = ${categoryId} AND ${prompts.active} = true`,
        );
    });

    const events = activePrompts.flatMap((p: { id: string; text: string }) =>
      models.flatMap((model) =>
        Array.from({ length: sampleN }, (_, i) => ({
          name: "wave/sample" as const,
          data: {
            runId,
            promptId: p.id,
            model,
            sampleN: i + 1,
            promptText: p.text,
          } satisfies WaveSampleData,
        })),
      ),
    );

    const chunkSize = 50;
    for (let i = 0; i < events.length; i += chunkSize) {
      const chunk = events.slice(i, i + chunkSize);
      await step.sendEvent(
        `fanout-${i}`,
        chunk.map((e: (typeof events)[number]) => ({
          name: e.name,
          data: e.data,
        })),
      );
    }

    // Best-effort fan-in: samples are fire-and-forget events, so we give
    // them a window to land before kicking off the judge pass.
    if (events.length > 0) {
      await step.sleep("wait-for-samples", "2m");
      await step.sendEvent("trigger-judge", {
        name: "wave/judge",
        data: { runId },
      });
    }

    return {
      runId,
      queued: events.length,
      prompts: activePrompts.length,
      models: models.length,
      sampleN,
    };
  },
);

/**
 * wave/sample — one completion write. Idempotent via unique
 * (run_id, prompt_id, model, sample_n). Budget kill-switch aborts spend.
 */
export const waveSample = inngest.createFunction(
  {
    id: "wave-sample",
    retries: 3,
    triggers: [{ event: "wave/sample" }],
  },
  async ({ event, step }) => {
    const { runId, promptId, model, sampleN, promptText } =
      event.data as WaveSampleData;

    const budgetOk = await step.run("check-budget", async () => {
      const db = getDb();
      const [row] = await db
        .select({ totalCostUsd: runs.totalCostUsd, status: runs.status })
        .from(runs)
        .where(eq(runs.id, runId));
      if (!row) return false;
      if (row.status === "cancelled" || row.status === "failed") return false;
      return row.totalCostUsd < maxWaveCostUsd();
    });

    if (!budgetOk) {
      return { skipped: true, reason: "budget_or_status" };
    }

    const result = await step.run("complete", async () => {
      return complete(model, { prompt: promptText }, sampleN);
    });

    const inserted = await step.run("write-completion", async () => {
      const db = getDb();
      try {
        const [row] = await db
          .insert(completions)
          .values({
            runId,
            promptId,
            model,
            sampleN,
            rawText: result.text,
            citedUrls: result.citedUrls,
            latencyMs: result.latencyMs,
            costUsd: result.costUsd,
          })
          .onConflictDoNothing()
          .returning({ id: completions.id });

        if (row) {
          await db
            .update(runs)
            .set({
              totalCostUsd: sql`${runs.totalCostUsd} + ${result.costUsd}`,
            })
            .where(eq(runs.id, runId));
        }

        return { id: row?.id ?? null, duplicate: !row };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("unique") || msg.includes("duplicate")) {
          return { id: null, duplicate: true };
        }
        throw err;
      }
    });

    return { runId, model, sampleN, ...inserted, costUsd: result.costUsd };
  },
);

