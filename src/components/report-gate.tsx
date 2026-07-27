"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconDownload, IconEmail, IconShare } from "@/components/icons";

const GATE_KEY = "avt.report.gate.dismissed";

export function ReportGate({
  children,
  brandName,
  payload,
  slug,
}: {
  children: React.ReactNode;
  brandName?: string;
  payload?: Record<string, unknown>;
  slug?: string;
}) {
  const [gated, setGated] = useState(false);
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem(GATE_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    function onScroll() {
      if (unlocked || gated) return;
      if (sessionStorage.getItem(GATE_KEY) === "1") return;
      const el = document.documentElement;
      const pct = (el.scrollTop + window.innerHeight) / el.scrollHeight;
      if (pct >= 0.5) setGated(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [gated, unlocked]);

  function dismissGate() {
    sessionStorage.setItem(GATE_KEY, "1");
    setUnlocked(true);
    setGated(false);
  }

  function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    dismissGate();
  }

  async function emailPdf() {
    if (!slug) {
      setToast("Nothing to email yet.");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    const target = email || window.prompt("Email the report to:") || "";
    if (!target.includes("@")) return;

    setToast("Sending report…");
    try {
      const res = await fetch("/api/report/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email: target }),
      });
      const json = await res.json();
      setToast(
        json.sent
          ? `Report emailed to ${target}.`
          : "Email queued (Resend not configured in this environment).",
      );
    } catch {
      setToast("Could not send email right now.");
    }
    setTimeout(() => setToast(null), 3000);
  }

  async function shareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("Link copied to clipboard.");
    } catch {
      setToast(window.location.href);
    }
    setTimeout(() => setToast(null), 2500);
  }

  function downloadSummary(format: "md" | "json") {
    if (!payload) {
      setToast("Nothing to download yet.");
      setTimeout(() => setToast(null), 2000);
      return;
    }
    let body = "";
    let mime = "application/json";
    let ext = "json";
    if (format === "json") {
      body = JSON.stringify(payload, null, 2);
    } else {
      mime = "text/markdown";
      ext = "md";
      const score = payload.overallScore;
      body = `# AI Visibility — ${brandName ?? "Brand"}\n\nScore: **${score}**\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\`\n`;
    }
    const blob = new Blob([body], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avt-report-${(brandName || "brand").toLowerCase()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const btn =
    "inline-flex h-btn-sm items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm hover:bg-surface-muted";

  return (
    <>
      <div className="mx-auto flex max-w-6xl flex-wrap justify-end gap-2 px-6 pt-4">
        <button type="button" onClick={shareLink} className={btn}>
          <IconShare size={16} />
          Share link
        </button>
        <button type="button" onClick={() => downloadSummary("md")} className={btn}>
          <IconDownload size={16} />
          Download MD
        </button>
        <button type="button" onClick={() => downloadSummary("json")} className={btn}>
          <IconDownload size={16} />
          Download JSON
        </button>
        <button type="button" onClick={emailPdf} className={btn}>
          <IconEmail size={16} />
          Email PDF
        </button>
        <Link
          href="/pricing"
          className="inline-flex h-btn-sm items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
        >
          Track weekly →
        </Link>
      </div>
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-ink px-4 py-2 text-sm text-primary-foreground">
          {toast}
        </div>
      )}
      {gated && !unlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={submitEmail}
            className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl"
          >
            <h2 className="text-lg font-semibold text-ink">
              Unlock the full report
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Enter your work email to keep reading (demo — nothing is sent).
            </p>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="focus-ring mt-4 w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="mt-4 h-btn-md w-full rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary-hover"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={dismissGate}
              className="mt-2 w-full text-sm text-ink-muted hover:text-ink"
            >
              Skip for this session
            </button>
          </form>
        </div>
      )}
    </>
  );
}
