/**
 * Simple token-bucket style rate limiter with exponential backoff helper.
 * In-memory — fine for single-instance / Inngest step concurrency.
 */

type Bucket = {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillPerMs: number;
};

const buckets = new Map<string, Bucket>();

export function configureRateLimit(
  key: string,
  requestsPerMinute: number,
): void {
  buckets.set(key, {
    tokens: requestsPerMinute,
    lastRefill: Date.now(),
    capacity: requestsPerMinute,
    refillPerMs: requestsPerMinute / 60_000,
  });
}

function getBucket(key: string): Bucket {
  let b = buckets.get(key);
  if (!b) {
    configureRateLimit(key, 60);
    b = buckets.get(key)!;
  }
  const now = Date.now();
  const elapsed = now - b.lastRefill;
  b.tokens = Math.min(b.capacity, b.tokens + elapsed * b.refillPerMs);
  b.lastRefill = now;
  return b;
}

export async function acquireToken(key: string): Promise<void> {
  for (;;) {
    const b = getBucket(key);
    if (b.tokens >= 1) {
      b.tokens -= 1;
      return;
    }
    const waitMs = Math.ceil((1 - b.tokens) / b.refillPerMs);
    await sleep(Math.min(Math.max(waitMs, 50), 5_000));
  }
}

export async function withBackoff<T>(
  fn: () => Promise<T>,
  opts: { retries?: number; baseMs?: number; label?: string } = {},
): Promise<T> {
  const retries = opts.retries ?? 4;
  const baseMs = opts.baseMs ?? 500;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      const delay = baseMs * 2 ** attempt + Math.random() * 100;
      await sleep(delay);
    }
  }
  throw lastErr;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Defaults per provider (conservative)
configureRateLimit("openai", 60);
configureRateLimit("anthropic", 40);
configureRateLimit("gemini", 60);
configureRateLimit("perplexity", 30);
