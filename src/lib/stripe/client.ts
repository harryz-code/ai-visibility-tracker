import Stripe from "stripe";

/** Returns a Stripe client, or null when STRIPE_SECRET_KEY is unset (fixture mode). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}
