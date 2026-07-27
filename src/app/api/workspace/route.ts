import { z } from "zod";
import { eq } from "drizzle-orm";
import { getUser } from "@/lib/supabase/server";

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  plan: z.enum(["free", "solo", "team"]).optional(),
  trackedBrandName: z.string().min(1).max(80).optional(),
  categoryName: z.string().min(1).max(80).optional(),
  market: z.string().min(1).max(80).optional(),
});

/** Returns the caller's workspace, or 401 when unauthenticated / Supabase unconfigured. */
export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return Response.json({ workspace: null, fixture: true });
  }

  const { getDb } = await import("@/db");
  const { workspaces } = await import("@/db/schema");
  const db = getDb();
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerId, user.id));

  return Response.json({ workspace: workspace ?? null });
}

/** Creates (or returns the existing) workspace for the authenticated user. */
export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json({ workspace: null, fixture: true, ok: true });
  }

  const { getDb } = await import("@/db");
  const { workspaces, workspaceMembers, brands, categories } = await import(
    "@/db/schema"
  );
  const db = getDb();

  const [existing] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.ownerId, user.id));
  if (existing) {
    return Response.json({ workspace: existing, ok: true });
  }

  let trackedBrandId: string | undefined;
  if (parsed.data.trackedBrandName && parsed.data.categoryName) {
    const [category] = await db
      .insert(categories)
      .values({
        name: parsed.data.categoryName,
        market: parsed.data.market ?? "United States",
      })
      .returning({ id: categories.id });
    const [brand] = await db
      .insert(brands)
      .values({ name: parsed.data.trackedBrandName, categoryId: category.id })
      .returning({ id: brands.id });
    trackedBrandId = brand.id;
  }

  const [workspace] = await db
    .insert(workspaces)
    .values({
      name: parsed.data.name,
      ownerId: user.id,
      plan: parsed.data.plan ?? "free",
      trackedBrandId,
    })
    .returning();

  await db
    .insert(workspaceMembers)
    .values({ workspaceId: workspace.id, userId: user.id, role: "owner" });

  return Response.json({ workspace, ok: true });
}
