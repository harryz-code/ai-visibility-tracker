import { desc, eq, isNotNull } from "drizzle-orm";
import { inngest } from "../client";
import { getDb } from "@/db";
import { alerts, metricsDaily, workspaces } from "@/db/schema";
import { isSignificantChange } from "@/lib/metrics/wilson";

/**
 * alerts/scan — stub: for each workspace's tracked brand, compare the two
 * most recent metrics_daily dates per model and fire an alert only when the
 * older rate falls outside the newer Wilson 95% CI (significance-gated).
 * Runs hourly, or on-demand via the event.
 */
export const alertsScan = inngest.createFunction(
  {
    id: "alerts-scan",
    retries: 1,
    triggers: [{ event: "alerts/scan" }, { cron: "0 * * * *" }],
  },
  async ({ step }) => {
    const trackedWorkspaces = await step.run("load-workspaces", async () => {
      const db = getDb();
      return db
        .select({
          id: workspaces.id,
          trackedBrandId: workspaces.trackedBrandId,
        })
        .from(workspaces)
        .where(isNotNull(workspaces.trackedBrandId));
    });

    let created = 0;
    for (const ws of trackedWorkspaces) {
      if (!ws.trackedBrandId) continue;
      const brandId = ws.trackedBrandId;

      created += await step.run(`scan-${ws.id}`, async () => {
        const db = getDb();
        const rows = await db
          .select({
            model: metricsDaily.model,
            date: metricsDaily.date,
            mentionRate: metricsDaily.mentionRate,
            mentionRateCiLow: metricsDaily.mentionRateCiLow,
            mentionRateCiHigh: metricsDaily.mentionRateCiHigh,
          })
          .from(metricsDaily)
          .where(eq(metricsDaily.brandId, brandId))
          .orderBy(desc(metricsDaily.date));

        const byModel = new Map<string, typeof rows>();
        for (const row of rows) {
          const list = byModel.get(row.model) ?? [];
          list.push(row);
          byModel.set(row.model, list);
        }

        let count = 0;
        for (const [model, modelRows] of byModel) {
          const dates = [...new Set(modelRows.map((r) => r.date))];
          if (dates.length < 2) continue;
          const latest = modelRows.find((r) => r.date === dates[0])!;
          const previous = modelRows.find((r) => r.date === dates[1])!;

          const significant = isSignificantChange(previous.mentionRate, {
            low: latest.mentionRateCiLow,
            high: latest.mentionRateCiHigh,
          });
          if (!significant) continue;

          await db.insert(alerts).values({
            workspaceId: ws.id,
            brandId,
            title: `Mention rate changed on ${model}`,
            detail: `New rate ${(latest.mentionRate * 100).toFixed(1)}% — previous ${(previous.mentionRate * 100).toFixed(1)}% sits outside the 95% CI (${(latest.mentionRateCiLow * 100).toFixed(1)}–${(latest.mentionRateCiHigh * 100).toFixed(1)}%).`,
            significant: true,
          });
          count += 1;
        }
        return count;
      });
    }

    return { workspacesScanned: trackedWorkspaces.length, alertsCreated: created };
  },
);
