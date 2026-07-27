import { z } from "zod";

export const JUDGE_VERSION = "judge-v1";

export const mentionSchema = z.object({
  brand: z.string(),
  matched_alias: z.string(),
  position: z.number().int().min(1),
  sentiment: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
  rec_strength: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
  quote: z.string(),
});

export const judgeOutputSchema = z.object({
  mentions: z.array(mentionSchema),
  cited_urls: z.array(z.string()),
  refused: z.boolean(),
});

export type JudgeOutput = z.infer<typeof judgeOutputSchema>;
export type JudgeMention = z.infer<typeof mentionSchema>;

/**
 * rec_strength rubric:
 * 0 absent, 1 merely listed, 2 positively recommended among others,
 * 3 the top/default pick.
 */
export const JUDGE_SYSTEM_PROMPT = `You are an extraction judge for AI visibility tracking.
Given a raw model answer and a list of known brands (with aliases), extract structured mentions.

Return ONLY valid JSON matching:
{
  "mentions": [{
    "brand": string,           // canonical brand name from the provided list
    "matched_alias": string,   // surface form found in the answer
    "position": number,        // 1-based order of appearance among brands
    "sentiment": -1 | 0 | 1,
    "rec_strength": 0 | 1 | 2 | 3,
    "quote": string            // short verbatim span
  }],
  "cited_urls": string[],
  "refused": boolean
}

rec_strength: 0=absent (do not include), 1=merely listed, 2=positively recommended among others, 3=top/default pick.
If the answer refuses or hedges with no brands, set refused=true and mentions=[].

Few-shot patterns to handle:
1) Brand mentioned but criticized → include with sentiment=-1, rec_strength=1
2) Brand in a list of 10 → rec_strength=1, position by list order
3) Brand as "alternative to X" → rec_strength=2
4) Answer refuses/hedges → refused=true
5) No brands at all → mentions=[], refused=false
6) Brand only in a citation URL → include if hostname/path clearly names brand
7) Misspelled brand → match via aliases
8) Comparison table → position by rank/row order, top row often rec_strength=3
`;

export function parseJudgeOutput(raw: unknown): JudgeOutput {
  return judgeOutputSchema.parse(raw);
}

export function safeParseJudgeOutput(raw: unknown) {
  return judgeOutputSchema.safeParse(raw);
}
