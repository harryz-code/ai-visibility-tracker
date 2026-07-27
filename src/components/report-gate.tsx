"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function ReportGate({ children }: { children: React.ReactNode }) {
  const [gated, setGated] = useState(false);
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    function onScroll() {
      if (unlocked || gated) return;
      const el = document.documentElement;
      const pct = (el.scrollTop + window.innerHeight) / el.scrollHeight;
      if (pct >= 0.5) setGated(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [gated, unlocked]);

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setUnlocked(true);
    setGated(false);
  }

  function emailPdf() {
    setToast("Would send PDF via Resend (stubbed in demo).");
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <>
      <div className="mx-auto flex max-w-6xl justify-end gap-2 px-6 pt-4">
        <button
          type="button"
          onClick={emailPdf}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Email PDF
        </button>
        <Link
          href="/pricing"
          className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-600"
        >
          Track weekly →
        </Link>
      </div>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}
      {gated && !unlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={submitEmail}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-zinc-900">
              Unlock the full report
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Enter your work email to keep reading (demo gate — nothing is
              sent).
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-4 w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-sky-400"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-sky-500 py-2.5 text-sm font-medium text-white hover:bg-sky-600"
            >
              Continue
            </button>
          </form>
        </div>
      )}
    </>
  );
}
