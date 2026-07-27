import { z } from "zod";
import { getStripe, appUrl } from "@/lib/stripe/client";
import { getUser } from "@/lib/supabase/server";

const bodySchema = z.object({
  plan: z.enum(["solo", "team"]),
});

/** Creates a Stripe Checkout session for the given plan. 501 when Stripe isn't configured. */
export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return Response.json(
      { error: "Stripe is not configured in this environment" },
      { status: 501 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const priceId =
    parsed.data.plan === "team"
      ? process.env.STRIPE_PRICE_TEAM
      : process.env.STRIPE_PRICE_SOLO;
  if (!priceId) {
    return Response.json(
      { error: `Missing Stripe price id for plan "${parsed.data.plan}"` },
      { status: 500 },
    );
  }

  const user = await getUser();
  const base = appUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/dashboard/settings?checkout=success`,
    cancel_url: `${base}/pricing`,
    customer_email: user?.email ?? undefined,
    client_reference_id: user?.id,
  });

  return Response.json({ url: session.url });
}
