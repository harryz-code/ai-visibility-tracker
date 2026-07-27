import { z } from "zod";
import { eq } from "drizzle-orm";
import { getReportMemory, type ReportPayload } from "@/lib/report/build";
import { sendReportPdfEmail } from "@/lib/email/resend";

const schema = z.object({
  slug: z.string().min(1),
  email: z.string().email(),
});

async function loadPayload(slug: string): Promise<ReportPayload | null> {
  const cached = getReportMemory(slug);
  if (cached) return cached;
  if (!process.env.DATABASE_URL) return null;

  const { getDb } = await import("@/db");
  const { reports } = await import("@/db/schema");
  const db = getDb();
  const [row] = await db
    .select({ payload: reports.payload })
    .from(reports)
    .where(eq(reports.slug, slug));
  return (row?.payload as ReportPayload) ?? null;
}

/** Emails the free report link/summary via Resend (no-ops when RESEND_API_KEY is unset). */
export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  const { slug, email } = parsed.data;

  const payload = await loadPayload(slug);
  if (!payload) {
    return Response.json({ error: "Report not found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const result = await sendReportPdfEmail({
    to: email,
    brandName: payload.brandName,
    categoryName: payload.categoryName,
    overallScore: payload.overallScore,
    reportUrl: `${appUrl}/r/${slug}`,
  });

  return Response.json({ ok: true, sent: result.sent });
}
