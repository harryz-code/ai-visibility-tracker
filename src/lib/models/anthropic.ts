import Anthropic from "@anthropic-ai/sdk";
import type { CompletionRequest, CompletionResult } from "./types";
import { acquireToken, withBackoff } from "./rate-limit";
import { fixtureComplete } from "./fixture";
import { hasApiKey, isFixtureMode } from "./types";

export async function completeAnthropic(
  req: CompletionRequest,
  sampleHint = 0,
): Promise<CompletionResult> {
  if (isFixtureMode() || !hasApiKey("anthropic")) {
    return fixtureComplete("anthropic", req, sampleHint);
  }

  await acquireToken("anthropic");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const start = Date.now();

  const res = await withBackoff(() =>
    client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: req.maxTokens ?? 800,
      temperature: req.temperature ?? 1,
      messages: [{ role: "user", content: req.prompt }],
    }),
  );

  const text = res.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n");

  const inTok = res.usage.input_tokens;
  const outTok = res.usage.output_tokens;
  const costUsd = (inTok * 0.8 + outTok * 4) / 1_000_000;

  return {
    text,
    citedUrls: [],
    latencyMs: Date.now() - start,
    costUsd,
    fixture: false,
  };
}
