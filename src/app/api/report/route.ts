import { z } from "zod";
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

  const slug = slugifyReport(brand, category);
  const payload = buildReportPayload(brand, category);
  saveReportMemory(slug, payload);

  // Persist when DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/db");
      const { reports } = await import("@/db/schema");
      const db = getDb();
      await db.insert(reports).values({
        slug,
        brandName: payload.brandName,
        categoryName: payload.categoryName,
        email,
        payload,
      });
    } catch (err) {
      console.error("report DB persist failed", err);
    }
  }

  return Response.json({ slug, ok: true });
}
