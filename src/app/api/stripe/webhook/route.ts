import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";

function mapStatus(status: Stripe.Subscription.Status): "trialing" | "active" | "past_due" | "canceled" {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "past_due";
    default:
      return "canceled";
  }
}

/** Stripe webhook — keeps the `subscriptions` table in sync. 501 when Stripe isn't configured. */
export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return Response.json(
      { error: "Stripe webhook is not configured in this environment" },
      { status: 501 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("stripe webhook signature verification failed", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    return Response.json({ received: true, skipped: "no DATABASE_URL" });
  }

  const { getDb } = await import("@/db");
  const { workspaces, subscriptions } = await import("@/db/schema");
  const db = getDb();

  async function upsertFromSubscription(
    sub: Stripe.Subscription,
    workspaceId?: string,
  ) {
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const [existing] = await db
      .select({ id: subscriptions.id })
      .from(subscriptions)
      .where(eq(subscriptions.stripeSubscriptionId, sub.id));

    const periodEnd = sub.items.data[0]?.current_period_end;
    const values = {
      stripeCustomerId: customerId,
      stripeSubscriptionId: sub.id,
      status: mapStatus(sub.status),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    };

    if (existing) {
      await db
        .update(subscriptions)
        .set(values)
        .where(eq(subscriptions.id, existing.id));
      return;
    }

    if (!workspaceId) return;
    await db.insert(subscriptions).values({ workspaceId, ...values });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (userId && session.subscription) {
        const [workspace] = await db
          .select({ id: workspaces.id })
          .from(workspaces)
          .where(eq(workspaces.ownerId, userId));
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await upsertFromSubscription(sub, workspace?.id);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await upsertFromSubscription(sub);
      break;
    }
    default:
      break;
  }

  return Response.json({ received: true });
}
