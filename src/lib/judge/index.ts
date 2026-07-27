import { JUDGE_VERSION, type JudgeOutput, parseJudgeOutput } from "./schema";
import { findAllBrandMentions } from "@/lib/metrics/alias";
import { completeAnthropic } from "@/lib/models/anthropic";
import { completeOpenAI } from "@/lib/models/openai";
import { isFixtureMode, hasApiKey } from "@/lib/models/types";

export { JUDGE_VERSION, JUDGE_SYSTEM_PROMPT, parseJudgeOutput, safeParseJudgeOutput, judgeOutputSchema } from "./schema";

type BrandInput = { name: string; aliases: string[] };

/**
 * Fixture/heuristic judge: alias match + simple position/rec heuristics.
 * Used when FIXTURE_MODE or no judge API key.
 */
export function heuristicJudge(
  rawText: string,
  brands: BrandInput[],
  citedUrls: string[] = [],
): JudgeOutput {
  const found = findAllBrandMentions(rawText, brands);
  const lower = rawText.toLowerCase();
  const mentions = found.map((f, i) => {
    let rec: 0 | 1 | 2 | 3 = 1;
    if (
      i === 0 &&
      (lower.includes("best") ||
        lower.includes("recommend") ||
        lower.includes("i'd start") ||
        lower.includes("top"))
    ) {
      rec = 3;
    } else if (
      lower.includes(`recommend ${f.matched_alias.toLowerCase()}`) ||
      lower.includes("close second") ||
      lower.includes("alternative")
    ) {
      rec = 2;
    }
    let sentiment: -1 | 0 | 1 = 0;
    if (
      lower.includes("wouldn't") ||
      lower.includes("avoid") ||
      lower.includes("critic")
    ) {
      sentiment = -1;
    } else if (rec >= 2) {
      sentiment = 1;
    }
    return {
      brand: f.brand,
      matched_alias: f.matched_alias,
      position: i + 1,
      sentiment,
      rec_strength: rec,
      quote: f.matched_alias,
    };
  });

  return {
    mentions,
    cited_urls: citedUrls,
    refused: mentions.length === 0 && /can't|cannot|unable|won't advise/i.test(rawText),
  };
}

export async function judgeCompletion(
  rawText: string,
  brands: BrandInput[],
  citedUrls: string[] = [],
): Promise<{ output: JudgeOutput; judgeVersion: string; fixture: boolean }> {
  if (isFixtureMode() || (!hasApiKey("anthropic") && !hasApiKey("openai"))) {
    return {
      output: heuristicJudge(rawText, brands, citedUrls),
      judgeVersion: JUDGE_VERSION,
      fixture: true,
    };
  }

  const brandList = brands
    .map((b) => `- ${b.name} (aliases: ${b.aliases.join(", ") || "none"})`)
    .join("\n");

  const userPrompt = `Known brands:\n${brandList}\n\nRaw answer:\n"""${rawText}"""\n\nExtract JSON.`;

  let text: string;
  if (hasApiKey("anthropic")) {
    const res = await completeAnthropic({
      prompt: `${userPrompt}`,
      temperature: 0,
      maxTokens: 1200,
    });
    text = res.text;
  } else {
    const res = await completeOpenAI({
      prompt: userPrompt,
      temperature: 0,
      maxTokens: 1200,
    });
    text = res.text;
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      output: heuristicJudge(rawText, brands, citedUrls),
      judgeVersion: JUDGE_VERSION,
      fixture: true,
    };
  }

  try {
    const parsed = parseJudgeOutput(JSON.parse(jsonMatch[0]));
    return { output: parsed, judgeVersion: JUDGE_VERSION, fixture: false };
  } catch {
    return {
      output: heuristicJudge(rawText, brands, citedUrls),
      judgeVersion: JUDGE_VERSION,
      fixture: true,
    };
  }
}
