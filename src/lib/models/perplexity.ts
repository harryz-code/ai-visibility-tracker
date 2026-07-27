import OpenAI from "openai";
import type { CompletionRequest, CompletionResult } from "./types";
import { acquireToken, withBackoff } from "./rate-limit";
import { fixtureComplete } from "./fixture";
import { hasApiKey, isFixtureMode } from "./types";

/** Perplexity Sonar via OpenAI-compatible endpoint */
export async function completePerplexity(
  req: CompletionRequest,
  sampleHint = 0,
): Promise<CompletionResult> {
  if (isFixtureMode() || !hasApiKey("perplexity")) {
    return fixtureComplete("perplexity", req, sampleHint);
  }

  await acquireToken("perplexity");
  const client = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: "https://api.perplexity.ai",
  });
  const start = Date.now();

  const res = await withBackoff(() =>
    client.chat.completions.create({
      model: "sonar",
      messages: [{ role: "user", content: req.prompt }],
      temperature: req.temperature ?? 1,
      max_tokens: req.maxTokens ?? 800,
    }),
  );

  const text = res.choices[0]?.message?.content ?? "";
  const citations =
    (
      res as unknown as {
        citations?: string[];
      }
    ).citations ?? [];

  return {
    text,
    citedUrls: citations,
    latencyMs: Date.now() - start,
    costUsd: 0.001,
    fixture: false,
  };
}
