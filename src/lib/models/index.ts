import type { CompletionRequest, CompletionResult, ModelProvider } from "./types";
import { completeOpenAI } from "./openai";
import { completeAnthropic } from "./anthropic";
import { completeGemini } from "./gemini";
import { completePerplexity } from "./perplexity";

export * from "./types";
export { fixtureComplete } from "./fixture";

export const ALL_MODELS: ModelProvider[] = [
  "openai",
  "anthropic",
  "gemini",
  "perplexity",
];

export async function complete(
  provider: ModelProvider,
  req: CompletionRequest,
  sampleHint = 0,
): Promise<CompletionResult> {
  switch (provider) {
    case "openai":
      return completeOpenAI(req, sampleHint);
    case "anthropic":
      return completeAnthropic(req, sampleHint);
    case "gemini":
      return completeGemini(req, sampleHint);
    case "perplexity":
      return completePerplexity(req, sampleHint);
  }
}
