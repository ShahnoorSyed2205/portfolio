type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };

/** Send a GA4 event. Safe when the tag is blocked or not yet loaded. */
export function track(event: string, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  (window as GtagWindow).gtag?.("event", event, params);
}
