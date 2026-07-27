/**
 * Wilson score interval for a binomial proportion (95% by default).
 * Used for mention-rate confidence intervals on every chart.
 */
export type WilsonInterval = {
  rate: number;
  low: number;
  high: number;
  n: number;
  successes: number;
};

export function wilsonInterval(
  successes: number,
  n: number,
  z = 1.96,
): WilsonInterval {
  if (n <= 0) {
    return { rate: 0, low: 0, high: 0, n: 0, successes: 0 };
  }
  const p = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = p + z2 / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
  return {
    rate: p,
    low: Math.max(0, (center - margin) / denom),
    high: Math.min(1, (center + margin) / denom),
    n,
    successes,
  };
}

/** Week-over-week change is significant only if new interval doesn't overlap old point estimate... 
 *  Spec: alert ONLY when WoW change falls outside the CI.
 *  Practical: |newRate - oldRate| significance if oldRate is outside new CI or intervals don't overlap.
 */
export function isSignificantChange(
  oldRate: number,
  newCi: Pick<WilsonInterval, "low" | "high">,
): boolean {
  return oldRate < newCi.low || oldRate > newCi.high;
}
