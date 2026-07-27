import { and, desc, eq, ilike } from "drizzle-orm";
import { getPersonalizedDemo, type PersonalizedDemo } from "@/lib/demo/personalized";
import type { ModelMetricPoint, TimeseriesPoint } from "@/lib/demo/data";
import type { ModelProvider } from "@/lib/models/types";
import type { WorkspaceState } from "@/lib/workspace/types";
import { resolveCategoryLabel } from "@/lib/workspace/types";
import { scoreFromMentionRate } from "./rollup";

/**
 * Loads real metrics_daily rows for the workspace's tracked brand and shapes
 * them close to `PersonalizedDemo` (perModel, timeseries, competitors) so
 * dashboard charts can render live data. Falls back to the fixture
 * `getPersonalizedDemo` whenever DATABASE_URL is unset, the brand/category
 * isn't found, or there are no rows yet (new workspace, wave still running).
 */
export async function getMetricsFromDb(
  workspace?: WorkspaceState | null,
): Promise<PersonalizedDemo> {
  const fallback = getPersonalizedDemo(workspace);
  if (!process.env.DATABASE_URL || !workspace?.brand.name.trim()) {
    return fallback;
  }

  try {
    const { getDb } = await import("@/db");
    const { brands, categories, metricsDaily } = await import("@/db/schema");
    const db = getDb();

    const categoryLabel = resolveCategoryLabel(workspace.brand);
    const [category] = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(ilike(categories.name, categoryLabel));
    if (!category) return fallback;

    const [brand] = await db
      .select({ id: brands.id, name: brands.name })
      .from(brands)
      .where(
        and(
          eq(brands.categoryId, category.id),
          ilike(brands.name, workspace.brand.name.trim()),
        ),
      );
    if (!brand) return fallback;

    const brandRows = await db
      .select({
        model: metricsDaily.model,
        date: metricsDaily.date,
        mentionRate: metricsDaily.mentionRate,
        mentionRateCiLow: metricsDaily.mentionRateCiLow,
        mentionRateCiHigh: metricsDaily.mentionRateCiHigh,
        avgPosition: metricsDaily.avgPosition,
        sampleCount: metricsDaily.sampleCount,
      })
      .from(metricsDaily)
      .where(eq(metricsDaily.brandId, brand.id))
      .orderBy(desc(metricsDaily.date));
    if (brandRows.length === 0) return fallback;

    const dates = [...new Set(brandRows.map((r) => r.date))];
    const latestDate = dates[0];
    const perModel: ModelMetricPoint[] = brandRows
      .filter((r) => r.date === latestDate)
      .map((r) => ({
        model: r.model as ModelProvider,
        mentionRate: r.mentionRate,
        ciLow: r.mentionRateCiLow,
        ciHigh: r.mentionRateCiHigh,
        avgPosition: r.avgPosition,
        visibilityScore: scoreFromMentionRate(r.mentionRate),
        sampleCount: r.sampleCount,
      }));

    const timeseriesDates = dates.slice(0, 8).reverse();
    const timeseries: TimeseriesPoint[] = timeseriesDates.map((date) => {
      const rowsForDate = brandRows.filter((r) => r.date === date);
      const scoreFor = (model: ModelProvider) =>
        rowsForDate.find((r) => r.model === model)
          ? scoreFromMentionRate(
              rowsForDate.find((r) => r.model === model)!.mentionRate,
            )
          : 0;
      return {
        date,
        openai: scoreFor("openai"),
        anthropic: scoreFor("anthropic"),
        gemini: scoreFor("gemini"),
        perplexity: scoreFor("perplexity"),
      };
    });

    const categoryRows = await db
      .select({
        brandId: metricsDaily.brandId,
        brandName: brands.name,
        mentionRate: metricsDaily.mentionRate,
        mentionRateCiLow: metricsDaily.mentionRateCiLow,
        mentionRateCiHigh: metricsDaily.mentionRateCiHigh,
      })
      .from(metricsDaily)
      .innerJoin(brands, eq(brands.id, metricsDaily.brandId))
      .where(and(eq(metricsDaily.categoryId, category.id), eq(metricsDaily.date, latestDate)));

    const byBrand = new Map<string, typeof categoryRows>();
    for (const row of categoryRows) {
      const list = byBrand.get(row.brandId) ?? [];
      list.push(row);
      byBrand.set(row.brandId, list);
    }
    const competitors = [...byBrand.entries()]
      .map(([, rows]) => {
        const avgRate = rows.reduce((s, r) => s + r.mentionRate, 0) / rows.length;
        return {
          brand: rows[0].brandName,
          overallScore: scoreFromMentionRate(avgRate),
          mentionRate: avgRate,
          ciLow: Math.min(...rows.map((r) => r.mentionRateCiLow)),
          ciHigh: Math.max(...rows.map((r) => r.mentionRateCiHigh)),
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore);

    return {
      ...fallback,
      perModel,
      timeseries,
      competitors: competitors.length > 0 ? competitors : fallback.competitors,
    };
  } catch (err) {
    console.error("getMetricsFromDb failed, using fixture fallback", err);
    return fallback;
  }
}
