import { describe, expect, it } from "vitest";
import { wilsonInterval, isSignificantChange } from "./wilson";

describe("wilsonInterval", () => {
  it("returns zeros for n=0", () => {
    expect(wilsonInterval(0, 0)).toEqual({
      rate: 0,
      low: 0,
      high: 0,
      n: 0,
      successes: 0,
    });
  });

  it("centers rate at successes/n", () => {
    const ci = wilsonInterval(8, 10);
    expect(ci.rate).toBeCloseTo(0.8);
    expect(ci.low).toBeLessThan(ci.rate);
    expect(ci.high).toBeGreaterThan(ci.rate);
    expect(ci.low).toBeGreaterThanOrEqual(0);
    expect(ci.high).toBeLessThanOrEqual(1);
  });

  it("narrows with larger n", () => {
    const small = wilsonInterval(8, 10);
    const large = wilsonInterval(80, 100);
    const smallWidth = small.high - small.low;
    const largeWidth = large.high - large.low;
    expect(largeWidth).toBeLessThan(smallWidth);
  });

  it("handles 0% and 100%", () => {
    const zero = wilsonInterval(0, 50);
    expect(zero.rate).toBe(0);
    expect(zero.low).toBe(0);
    expect(zero.high).toBeGreaterThan(0);

    const full = wilsonInterval(50, 50);
    expect(full.rate).toBe(1);
    expect(full.high).toBe(1);
    expect(full.low).toBeLessThan(1);
  });
});

describe("isSignificantChange", () => {
  it("flags when old rate is outside new CI", () => {
    expect(isSignificantChange(0.9, { low: 0.4, high: 0.6 })).toBe(true);
    expect(isSignificantChange(0.5, { low: 0.4, high: 0.6 })).toBe(false);
  });
});
