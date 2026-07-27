import { desc, eq } from "drizzle-orm";
import { getUser } from "@/lib/supabase/server";

/** Lists alerts for the caller's workspace. 401 when unauthenticated / Supabase unconfigured. */
export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return Response.json({ alerts: [], fixture: true });
  }

  const { getDb } = await import("@/db");
  const { alerts, workspaces } = await import("@/db/schema");
  const db = getDb();

  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerId, user.id));
  if (!workspace) return Response.json({ alerts: [] });

  const rows = await db
    .select()
    .from(alerts)
    .where(eq(alerts.workspaceId, workspace.id))
    .orderBy(desc(alerts.createdAt))
    .limit(50);

  return Response.json({ alerts: rows });
}
