import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import {
  buildReportPayload,
  saveReportMemory,
  slugifyReport,
} from "@/lib/report/build";

const schema = z.object({
  brand: z.string().min(1).max(80),
  category: z.string().min(1).max(80),
  email: z.string().email(),
});

const DISPOSABLE = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
]);

/** Returns true if the email is still under today's report cap. Increments the counter. */
async function checkAndIncrementRateLimit(email: string): Promise<boolean> {
  const { getDb } = await import("@/db");
  const { reportRateLimits } = await import("@/db/schema");
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);

  const [existing] = await db
    .select({ count: reportRateLimits.count })
    .from(reportRateLimits)
    .where(
      sql`${reportRateLimits.email} = ${email} AND ${reportRateLimits.day} = ${today}`,
    );

  if (existing && existing.count >= 1) return false;

  await db
    .insert(reportRateLimits)
    .values({ email, day: today, count: 1 })
    .onConflictDoUpdate({
      target: [reportRateLimits.email, reportRateLimits.day],
      set: { count: sql`${reportRateLimits.count} + 1` },
    });

  return true;
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { brand, category, email } = parsed.data;
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && DISPOSABLE.has(domain)) {
    return Response.json(
      { error: "Disposable email addresses are not allowed" },
      { status: 400 },
    );
  }

  if (process.env.DATABASE_URL) {
    try {
      const withinLimit = await checkAndIncrementRateLimit(email);
      if (!withinLimit) {
        return Response.json(
          { error: "Limit reached: 1 free report per email per day" },
          { status: 429 },
        );
      }
    } catch (err) {
      console.error("report rate-limit check failed", err);
    }
  }

  const slug = slugifyReport(brand, category);

  if (!process.env.DATABASE_URL) {
    const payload = buildReportPayload(brand, category);
    saveReportMemory(slug, payload);
    return Response.json({ slug, ok: true, fixture: true });
  }

  const { getDb } = await import("@/db");
  const { reports } = await import("@/db/schema");
  const db = getDb();

  const [reportRow] = await db
    .insert(reports)
    .values({
      slug,
      brandName: brand,
      categoryName: category,
      email,
      payload: {},
      status: "pending",
    })
    .returning({ id: reports.id });

  let fixture = false;
  let payload = buildReportPayload(brand, category);
  let runId: string | undefined;

  try {
    const { runMiniWaveReport } = await import(
      "@/lib/pipeline/report-from-wave"
    );
    const result = await runMiniWaveReport(brand, category);
    payload = result.payload;
    runId = result.runId;
  } catch (err) {
    console.error("mini-wave report failed, falling back to fixture", err);
    fixture = true;
  }

  saveReportMemory(slug, payload);

  await db
    .update(reports)
    .set({ payload, status: "ready", runId })
    .where(eq(reports.id, reportRow.id));

  return Response.json({ slug, ok: true, fixture });
}
