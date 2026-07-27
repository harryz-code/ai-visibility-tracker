"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      setStatus(
        "Auth isn't configured in this environment — the fixture UI works without an account.",
      );
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setPending(false);
    setStatus(
      error ? error.message : `Check ${email} for a magic sign-in link.`,
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Sign in
        </h1>
        <p className="mt-2 text-ink-body">
          {isSupabaseConfigured()
            ? "We'll email you a magic link — no password needed."
            : "Auth isn't configured in this environment. Explore the product via onboarding — it works entirely with local fixtures."}
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send magic link"}
          </button>
        </form>
        {status && <p className="mt-4 text-sm text-ink-muted">{status}</p>}
      </main>
    </>
  );
}
