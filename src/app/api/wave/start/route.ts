import { inngest } from "@/inngest/client";
import { z } from "zod";

const bodySchema = z.object({
  runId: z.string().uuid(),
  categoryId: z.string().uuid(),
  sampleN: z.number().int().min(1).max(16).optional(),
});

/** Trigger a wave via Inngest (requires DATABASE_URL + Inngest keys in prod). */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { runId, categoryId, sampleN } = parsed.data;
  await inngest.send({
    name: "wave/start",
    data: { runId, categoryId, sampleN },
  });

  return Response.json({ ok: true, runId, queued: true });
}
