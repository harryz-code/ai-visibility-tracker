import { eq } from "drizzle-orm";
import { getStripe, appUrl } from "@/lib/stripe/client";
import { getUser } from "@/lib/supabase/server";

/** Creates a Stripe Customer Portal session for the caller's workspace. 501 when Stripe isn't configured. */
export async function POST() {
  const stripe = getStripe();
  if (!stripe) {
    return Response.json(
      { error: "Stripe is not configured in this environment" },
      { status: 501 },
    );
  }

  const user = await getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return Response.json(
      { error: "DATABASE_URL is not configured" },
      { status: 501 },
    );
  }

  const { getDb } = await import("@/db");
  const { workspaces, subscriptions } = await import("@/db/schema");
  const db = getDb();

  const [workspace] = await db
    .select({ id: workspaces.id })
    .from(workspaces)
    .where(eq(workspaces.ownerId, user.id));
  if (!workspace) {
    return Response.json({ error: "No workspace found" }, { status: 404 });
  }

  const [subscription] = await db
    .select({ stripeCustomerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.workspaceId, workspace.id));
  if (!subscription?.stripeCustomerId) {
    return Response.json({ error: "No Stripe customer found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${appUrl()}/dashboard/settings`,
  });

  return Response.json({ url: session.url });
}
