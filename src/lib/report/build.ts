import { getDemoDataset } from "@/lib/demo/data";
import { DEFAULT_CATEGORIES } from "@/lib/workspace/types";

export type ReportPayload = ReturnType<typeof buildReportPayload>;

export function listReportCategories() {
  return [...DEFAULT_CATEGORIES];
}

export function buildReportPayload(brandName: string, categoryName: string) {
  const data = getDemoDataset(brandName.trim() || "Affirm");

  // Re-label tracked brand for custom inputs while keeping competitor structure
  const tracked = brandName.trim() || data.trackedBrand;
  const perModel = data.perModel;
  const overall = Math.round(
    perModel.reduce((s, m) => s + m.visibilityScore, 0) / perModel.length,
  );

  const competitors = data.competitors.map((c) =>
    c.brand === data.trackedBrand ? { ...c, brand: tracked } : c,
  );

  // Ensure tracked brand is in competitor list
  if (!competitors.some((c) => c.brand.toLowerCase() === tracked.toLowerCase())) {
    competitors.unshift({
      brand: tracked,
      overallScore: overall,
      mentionRate: perModel.reduce((s, m) => s + m.mentionRate, 0) / perModel.length,
      ciLow: Math.min(...perModel.map((m) => m.ciLow)),
      ciHigh: Math.max(...perModel.map((m) => m.ciHigh)),
    });
  }

  const weakest = [...perModel].sort(
    (a, b) => a.visibilityScore - b.visibilityScore,
  )[0];
  const topCompetitor = competitors.find(
    (c) => c.brand.toLowerCase() !== tracked.toLowerCase(),
  );

  return {
    brandName: tracked,
    categoryName,
    overallScore: overall,
    perModel,
    competitors: competitors.slice(0, 5),
    verbatims: data.verbatims.map((v) =>
      v.replaceAll(data.trackedBrand, tracked),
    ),
    citations: data.citations,
    biggestGap: `${tracked}'s weakest surface is ${weakest.model} (score ${weakest.visibilityScore})${
      topCompetitor
        ? ` — ${topCompetitor.brand} leads the category at ${topCompetitor.overallScore}`
        : ""
    }. Prioritize citation and unaided prompts on ${weakest.model}.`,
    generatedAt: new Date().toISOString(),
    methodology:
      "Mini-wave simulation (fixture mode): 30 prompts × 4 samples × 4 models stylized. Mention rates use Wilson 95% CIs.",
  };
}

export function slugifyReport(brand: string, category: string): string {
  const base = `${brand}-${category}-${Date.now().toString(36)}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base.slice(0, 64);
}

/** In-memory report store for fixture/demo mode (no DB required). */
const memoryReports = new Map<string, ReportPayload>();

export function saveReportMemory(slug: string, payload: ReportPayload) {
  memoryReports.set(slug, payload);
}

export function getReportMemory(slug: string): ReportPayload | undefined {
  return memoryReports.get(slug);
}

export function seedDemoReport() {
  const slug = "demo-affirm-bnpl";
  if (!memoryReports.has(slug)) {
    saveReportMemory(slug, buildReportPayload("Affirm", "BNPL"));
  }
  return slug;
}
