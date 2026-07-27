import { inngest } from "../client";
import { getDb } from "@/db";
import { workspaces } from "@/db/schema";
import { sendDigest } from "@/lib/email/resend";

/**
 * digest/weekly — stub: loads workspaces and would email a weekly summary
 * via Resend. Runs every Monday 9am UTC, or on-demand via the event.
 */
export const digestWeekly = inngest.createFunction(
  {
    id: "digest-weekly",
    retries: 1,
    triggers: [{ event: "digest/weekly" }, { cron: "0 9 * * 1" }],
  },
  async ({ step }) => {
    const rows = await step.run("load-workspaces", async () => {
      const db = getDb();
      return db
        .select({ id: workspaces.id, name: workspaces.name, ownerId: workspaces.ownerId })
        .from(workspaces);
    });

    const sent = await step.run("send-digests", async () => {
      let count = 0;
      for (const ws of rows) {
        // ownerId is a Supabase user id, not an email — real lookup would
        // join auth.users; stubbed here since this is a fixture/demo build.
        await sendDigest({
          to: ws.ownerId,
          workspaceName: ws.name,
          summary: `Weekly AI visibility summary for ${ws.name} is ready in your dashboard.`,
        });
        count += 1;
      }
      return count;
    });

    return { workspaces: rows.length, sent };
  },
);
