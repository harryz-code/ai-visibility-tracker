import { describe, expect, it } from "vitest";
import { judgeOutputSchema, parseJudgeOutput } from "@/lib/judge/schema";
import { heuristicJudge } from "@/lib/judge";

describe("judgeOutputSchema", () => {
  it("accepts valid extraction", () => {
    const raw = {
      mentions: [
        {
          brand: "Affirm",
          matched_alias: "Affirm",
          position: 1,
          sentiment: 1,
          rec_strength: 3,
          quote: "Affirm is best",
        },
      ],
      cited_urls: ["https://affirm.com"],
      refused: false,
    };
    expect(parseJudgeOutput(raw)).toEqual(raw);
  });

  it("rejects invalid rec_strength", () => {
    const result = judgeOutputSchema.safeParse({
      mentions: [
        {
          brand: "Klarna",
          matched_alias: "Klarna",
          position: 1,
          sentiment: 0,
          rec_strength: 5,
          quote: "Klarna",
        },
      ],
      cited_urls: [],
      refused: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("heuristicJudge", () => {
  it("extracts brands via aliases", () => {
    const out = heuristicJudge(
      "I'd start with Klarna for fashion. Affirm is a close second.",
      [
        { name: "Klarna", aliases: ["Klarna"] },
        { name: "Affirm", aliases: ["Affirm"] },
        { name: "Afterpay", aliases: ["Afterpay", "After Pay"] },
      ],
    );
    expect(out.mentions.map((m) => m.brand)).toContain("Klarna");
    expect(out.mentions.map((m) => m.brand)).toContain("Affirm");
    expect(out.refused).toBe(false);
  });
});
