import OpenAI from "openai";
import type { CompletionRequest, CompletionResult } from "./types";
import { acquireToken, withBackoff } from "./rate-limit";
import { fixtureComplete } from "./fixture";
import { hasApiKey, isFixtureMode } from "./types";

export async function completeOpenAI(
  req: CompletionRequest,
  sampleHint = 0,
): Promise<CompletionResult> {
  if (isFixtureMode() || !hasApiKey("openai")) {
    return fixtureComplete("openai", req, sampleHint);
  }

  await acquireToken("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const start = Date.now();

  const res = await withBackoff(() =>
    client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: req.prompt }],
      temperature: req.temperature ?? 1,
      max_tokens: req.maxTokens ?? 800,
    }),
  );

  const text = res.choices[0]?.message?.content ?? "";
  const inTok = res.usage?.prompt_tokens ?? 0;
  const outTok = res.usage?.completion_tokens ?? 0;
  // rough gpt-4o-mini pricing
  const costUsd = (inTok * 0.15 + outTok * 0.6) / 1_000_000;

  return {
    text,
    citedUrls: [],
    latencyMs: Date.now() - start,
    costUsd,
    fixture: false,
  };
}
