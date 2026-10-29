"use client";

/**
 * Analytics event helper. Sends to Google Analytics 4 and/or Meta Pixel
 * when their IDs are configured in the dashboard; otherwise a no-op.
 */
type Win = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

export function track(event: string, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  const w = window as Win;
  w.gtag?.("event", event, params);
  if (w.fbq) {
    const standard: Record<string, string> = { generate_lead: "Lead", book_call: "Schedule", contact_click: "Contact", subscribe: "Subscribe" };
    if (standard[event]) w.fbq("track", standard[event], params);
    else w.fbq("trackCustom", event, params);
  }
}
