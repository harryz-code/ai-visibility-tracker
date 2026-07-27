import { eq } from "drizzle-orm";
import { getReportMemory } from "@/lib/report/build";

type Props = { params: Promise<{ slug: string }> };

/** Polls report generation status. Fixture mode reports resolve immediately. */
export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;

  if (!process.env.DATABASE_URL) {
    const payload = getReportMemory(slug);
    return Response.json({ status: payload ? "ready" : "pending", fixture: true });
  }

  const { getDb } = await import("@/db");
  const { reports } = await import("@/db/schema");
  const db = getDb();
  const [row] = await db
    .select({ status: reports.status })
    .from(reports)
    .where(eq(reports.slug, slug));

  if (!row) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ status: row.status });
}
