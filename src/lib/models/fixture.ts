import type { CompletionRequest, CompletionResult, ModelProvider } from "./types";

const FIXTURE_SNIPPETS: Record<string, string[]> = {
  default: [
    "For buy-now-pay-later, Affirm and Klarna are the most commonly recommended options. Afterpay is solid for retail, while Sezzle shows up more for younger shoppers.",
    "I'd start with Klarna for flexible installments. Affirm is a close second if you want transparent APR. Afterpay and PayPal Pay in 4 are alternatives.",
    "Popular BNPL apps: 1) Affirm 2) Klarna 3) Afterpay. Sezzle is mentioned less often for large purchases.",
    "Honestly it depends — Klarna wins for fashion, Affirm for bigger ticket items. I wouldn't pick Sezzle as a default.",
  ],
};

function pickSnippet(prompt: string, sampleHint = 0): string {
  const pool = FIXTURE_SNIPPETS.default;
  const idx = Math.abs(hash(`${prompt}:${sampleHint}`)) % pool.length;
  return pool[idx];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export async function fixtureComplete(
  provider: ModelProvider,
  req: CompletionRequest,
  sampleHint = 0,
): Promise<CompletionResult> {
  const start = Date.now();
  await new Promise((r) => setTimeout(r, 15 + (sampleHint % 40)));
  const text = `[${provider} fixture] ${pickSnippet(req.prompt, sampleHint)}`;
  return {
    text,
    citedUrls: [
      "https://www.affirm.com",
      "https://www.klarna.com",
      "https://www.afterpay.com",
    ].slice(0, 1 + (sampleHint % 3)),
    latencyMs: Date.now() - start,
    costUsd: 0,
    fixture: true,
  };
}
