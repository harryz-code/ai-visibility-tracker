import { eq, ilike } from "drizzle-orm";
import { getIndustryLeaderboard } from "@/lib/demo/personalized";

/** Public category leaderboard: avg share-of-voice by brand from metrics_daily, or fixture fallback. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const industry = searchParams.get("industry") ?? "";

  if (!process.env.DATABASE_URL || !industry) {
    return Response.json({ rows: getIndustryLeaderboard(industry), fixture: true });
  }

  try {
    const { getDb } = await import("@/db");
    const { brands, categories, metricsDaily } = await import("@/db/schema");
    const db = getDb();

    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(ilike(categories.name, industry));
    if (!category) {
      return Response.json({ rows: getIndustryLeaderboard(industry), fixture: true });
    }

    const rows = await db
      .select({
        brand: brands.name,
        shareOfVoice: metricsDaily.shareOfVoice,
        mentionRate: metricsDaily.mentionRate,
        mentionRateCiLow: metricsDaily.mentionRateCiLow,
        mentionRateCiHigh: metricsDaily.mentionRateCiHigh,
      })
      .from(metricsDaily)
      .innerJoin(brands, eq(brands.id, metricsDaily.brandId))
      .where(eq(metricsDaily.categoryId, category.id));

    if (rows.length === 0) {
      return Response.json({ rows: getIndustryLeaderboard(industry), fixture: true });
    }

    const byBrand = new Map<string, typeof rows>();
    for (const row of rows) {
      const list = byBrand.get(row.brand) ?? [];
      list.push(row);
      byBrand.set(row.brand, list);
    }

    const aggregated = [...byBrand.entries()]
      .map(([brand, brandRows]) => {
        const avgShare =
          brandRows.reduce((s, r) => s + r.shareOfVoice, 0) / brandRows.length;
        const avgRate =
          brandRows.reduce((s, r) => s + r.mentionRate, 0) / brandRows.length;
        return {
          brand,
          overallScore: Math.round(avgShare * 100),
          mentionRate: avgRate,
          ciLow: Math.min(...brandRows.map((r) => r.mentionRateCiLow)),
          ciHigh: Math.max(...brandRows.map((r) => r.mentionRateCiHigh)),
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore);

    return Response.json({ rows: aggregated, fixture: false });
  } catch (err) {
    console.error("leaderboard DB query failed, using fixture", err);
    return Response.json({ rows: getIndustryLeaderboard(industry), fixture: true });
  }
}
