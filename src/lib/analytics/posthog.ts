import { PostHog } from "posthog-node";

let _client: PostHog | null | undefined;

function client(): PostHog | null {
  if (_client !== undefined) return _client;
  const key = process.env.POSTHOG_API_KEY;
  _client = key
    ? new PostHog(key, {
        host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com",
      })
    : null;
  return _client;
}

/**
 * Server-side event capture. No-op when POSTHOG_API_KEY is unset so
 * fixture mode and tests never depend on network access.
 */
export function captureEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): void {
  const ph = client();
  if (!ph) return;
  ph.capture({ distinctId, event, properties });
}

export async function shutdownAnalytics(): Promise<void> {
  const ph = client();
  if (ph) await ph.shutdown();
}
