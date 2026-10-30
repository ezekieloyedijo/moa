import "server-only";

/** True when Resend is configured, i.e. the site can send email at all. */
export const emailEnabled = () => !!process.env.RESEND_API_KEY;

/**
 * Sends one email via Resend's HTTP API (no SDK needed).
 * Returns false instead of throwing, so callers decide whether a failed send matters.
 */
export async function sendEmail(msg: { to: string; subject: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Portfolio <onboarding@resend.dev>",
        to: [msg.to],
        reply_to: msg.replyTo,
        subject: msg.subject,
        html: msg.html,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error("[resend]", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("[resend]", err);
    return false;
  }
}

/** Escapes user-supplied text before it goes into an email's HTML. */
export const escapeHtml = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
