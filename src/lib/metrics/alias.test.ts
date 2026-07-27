import { describe, expect, it } from "vitest";
import { matchBrand, findAllBrandMentions } from "./alias";

const brands = [
  { name: "Affirm", aliases: ["Affirm", "Affrm"] },
  { name: "Klarna", aliases: ["Klarna"] },
  { name: "Afterpay", aliases: ["Afterpay", "After Pay"] },
];

describe("matchBrand", () => {
  it("matches canonical name", () => {
    expect(matchBrand("Try Affirm today", brands)?.brand).toBe("Affirm");
  });

  it("matches alias / misspelling", () => {
    expect(matchBrand("Affrm is ok", brands)?.matched_alias).toBe("Affrm");
  });

  it("matches multi-word alias", () => {
    expect(matchBrand("After Pay works in stores", brands)?.brand).toBe(
      "Afterpay",
    );
  });

  it("returns null when absent", () => {
    expect(matchBrand("no bnpl here", brands)).toBeNull();
  });
});

describe("findAllBrandMentions", () => {
  it("finds multiple brands", () => {
    const found = findAllBrandMentions(
      "Klarna and Affirm both work; Afterpay too.",
      brands,
    );
    expect(found.map((f) => f.brand).sort()).toEqual([
      "Affirm",
      "Afterpay",
      "Klarna",
    ]);
  });
});
