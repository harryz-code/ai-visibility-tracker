"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PricingCheckoutButton({
  plan,
  className,
  children,
}: {
  plan: "solo" | "team";
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) {
          window.location.href = json.url;
          return;
        }
      }
    } catch {
      // fall through to demo path below
    }
    // Stripe not configured (501) or request failed — explore the fixture demo instead.
    router.push("/onboarding");
  }

  return (
    <button type="button" onClick={onClick} disabled={pending} className={className}>
      {pending ? "Redirecting…" : children}
    </button>
  );
}
