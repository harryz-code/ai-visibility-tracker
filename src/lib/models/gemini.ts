import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CompletionRequest, CompletionResult } from "./types";
import { acquireToken, withBackoff } from "./rate-limit";
import { fixtureComplete } from "./fixture";
import { hasApiKey, isFixtureMode } from "./types";

export async function completeGemini(
  req: CompletionRequest,
  sampleHint = 0,
): Promise<CompletionResult> {
  if (isFixtureMode() || !hasApiKey("gemini")) {
    return fixtureComplete("gemini", req, sampleHint);
  }

  await acquireToken("gemini");
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const start = Date.now();

  const res = await withBackoff(() =>
    model.generateContent({
      contents: [{ role: "user", parts: [{ text: req.prompt }] }],
      generationConfig: {
        temperature: req.temperature ?? 1,
        maxOutputTokens: req.maxTokens ?? 800,
      },
    }),
  );

  const text = res.response.text();
  // rough flash pricing
  const costUsd = 0.0001;

  return {
    text,
    citedUrls: [],
    latencyMs: Date.now() - start,
    costUsd,
    fixture: false,
  };
}
