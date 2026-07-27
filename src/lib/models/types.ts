export type ModelProvider = "openai" | "anthropic" | "gemini" | "perplexity";

export type CompletionRequest = {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
};

export type CompletionResult = {
  text: string;
  citedUrls: string[];
  latencyMs: number;
  costUsd: number;
  fixture: boolean;
};

export function isFixtureMode(): boolean {
  if (process.env.FIXTURE_MODE === "true") return true;
  if (process.env.FIXTURE_MODE === "false") return false;
  // Default: fixture when any primary key is missing
  return !(
    process.env.OPENAI_API_KEY ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.PERPLEXITY_API_KEY
  );
}

export function hasApiKey(provider: ModelProvider): boolean {
  switch (provider) {
    case "openai":
      return Boolean(process.env.OPENAI_API_KEY);
    case "anthropic":
      return Boolean(process.env.ANTHROPIC_API_KEY);
    case "gemini":
      return Boolean(process.env.GOOGLE_AI_API_KEY);
    case "perplexity":
      return Boolean(process.env.PERPLEXITY_API_KEY);
  }
}
