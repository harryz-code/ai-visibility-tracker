"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IndustryGrid } from "@/components/industry-grid";
import { OTHER_CATEGORY } from "@/lib/workspace/types";

export function ReportForm() {
  const router = useRouter();
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Financial Services");
  const [categoryOther, setCategoryOther] = useState("");
  const [email, setEmail] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (category === OTHER_CATEGORY && !categoryOther.trim()) {
      setStatus("Please describe your industry.");
      return;
    }
    const categoryLabel =
      category === OTHER_CATEGORY ? categoryOther.trim() : category;

    setStatus("Queuing mini-wave…");
    setProgress(5);

    startTransition(async () => {
      const stages = [
        "Generating prompt corpus…",
        "Sampling OpenAI…",
        "Sampling Anthropic…",
        "Sampling Gemini…",
        "Sampling Perplexity…",
        "Running judge extraction…",
        "Rolling up metrics + CIs…",
      ];
      for (let i = 0; i < stages.length; i++) {
        setStatus(stages[i]);
        setProgress(10 + Math.round(((i + 1) / stages.length) * 70));
        await new Promise((r) => setTimeout(r, 350));
      }

      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brand, category: categoryLabel, email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus(json.error ?? "Failed to create report");
        setProgress(0);
        return;
      }
      setProgress(100);
      setStatus("Report ready — redirecting…");
      router.push(`/r/${json.slug}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink">Brand</label>
        <input
          required
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Your brand"
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-ink">
          Industry
        </label>
        <IndustryGrid
          value={category}
          otherValue={categoryOther}
          onChange={(c, o = "") => {
            setCategory(c);
            setCategoryOther(o);
          }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink">Work email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Running mini-wave…" : "Generate free report"}
      </button>
      {status && (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-ink-body">{status}</p>
        </div>
      )}
      <p className="text-xs text-ink-muted">
        Demo runs in fixture mode (~$0). Limit: 1 report per email per day
        (stubbed).
      </p>
    </form>
  );
}
