import { z } from "zod";
import { inngest } from "@/inngest/client";

const bodySchema = z.object({
  categoryId: z.string().uuid(),
  runId: z.string().uuid().optional(),
  sampleN: z.number().int().min(1).max(16).optional(),
});

function hasInngestKeys(): boolean {
  return Boolean(process.env.INNGEST_EVENT_KEY && process.env.INNGEST_SIGNING_KEY);
}

/**
 * Starts a wave. With Inngest keys configured, sends `wave/start` and lets
 * the fan-out + judge + rollup functions run async. Without Inngest, runs
 * the wave synchronously in-process (creating the run itself) so this still
 * works locally / without extra infra.
 */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { categoryId, runId, sampleN } = parsed.data;

  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "DATABASE_URL is not configured" },
      { status: 501 },
    );
  }

  if (hasInngestKeys()) {
    let resolvedRunId = runId;
    if (!resolvedRunId) {
      const { getDb } = await import("@/db");
      const { runs } = await import("@/db/schema");
      const db = getDb();
      const [run] = await db
        .insert(runs)
        .values({ categoryId, sampleN: sampleN ?? 8 })
        .returning({ id: runs.id });
      resolvedRunId = run.id;
    }

    await inngest.send({
      name: "wave/start",
      data: { runId: resolvedRunId, categoryId, sampleN },
    });

    return Response.json({ ok: true, runId: resolvedRunId, queued: true });
  }

  const { runSyncWave } = await import("@/lib/pipeline/wave-sync");
  const { judgeRun, rollupRunToMetrics } = await import(
    "@/lib/pipeline/judge-rollup"
  );

  const result = await runSyncWave({ categoryId, sampleN, runId });
  await judgeRun(result.runId);
  await rollupRunToMetrics(result.runId);

  return Response.json({ ok: true, queued: false, ...result });
}
