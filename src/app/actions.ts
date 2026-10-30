"use server";

/**
 * Public form actions. These are POSTs (not page views), so it's fine
 * for them to touch the database.
 */
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { contactSchema, subscribeSchema } from "@/lib/validators";
import { escapeHtml, sendEmail } from "@/lib/email";

export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  downloadUrl?: string;
  /** Echoed back on error so fields survive React's post-action form reset. */
  values?: Record<string, string>;
};

/** Bots fill the hidden field or submit instantly; real people do neither. */
function looksLikeSpam(form: FormData) {
  if (String(form.get("website") ?? "").length > 0) return true;
  const started = Number(form.get("startedAt") ?? 0);
  return !started || Date.now() - started < 2500;
}

export async function submitContact(_prev: FormState, form: FormData): Promise<FormState> {
  // Pretend success to bots so they don't retry.
  if (looksLikeSpam(form)) return { status: "success", message: "Thanks! Your message is on its way." };

  const values = Object.fromEntries(
    ["name", "email", "projectType", "budget", "message"].map((k) => [k, String(form.get(k) ?? "").slice(0, 3000)]),
  );
  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => (fieldErrors[String(i.path[0])] ??= i.message));
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors, values };
  }

  const limit = await rateLimit(`contact:${await clientIp()}`, 3, 10 * 60);
  if (!limit.ok) return { status: "error", message: "Too many messages. Please try again in a few minutes, or use WhatsApp.", values };

  try {
    const msg = await prisma.contactMessage.create({ data: parsed.data });
    await notifyOwner(msg);
    return { status: "success", message: "Thanks! Your message is on its way. I'll reply within 24 hours." };
  } catch (err) {
    console.error("[contact]", err);
    return { status: "error", message: "Couldn't send right now. Please email or WhatsApp me instead.", values };
  }
}

export async function subscribe(_prev: FormState, form: FormData): Promise<FormState> {
  if (looksLikeSpam(form)) return { status: "success", message: "You're in! Check your inbox." };
  const parsed = subscribeSchema.safeParse({ email: form.get("email") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const limit = await rateLimit(`subscribe:${await clientIp()}`, 5, 10 * 60);
  if (!limit.ok) return { status: "error", message: "Too many attempts. Try again later." };

  try {
    await prisma.subscriber.upsert({ where: { email: parsed.data.email }, update: {}, create: parsed.data });
    const s = await prisma.siteSettings.findUnique({ where: { id: "site" }, select: { leadMagnetUrl: true } });
    return { status: "success", message: "You're in! Thanks for subscribing.", downloadUrl: s?.leadMagnetUrl || undefined };
  } catch (err) {
    console.error("[subscribe]", err);
    return { status: "error", message: "Couldn't subscribe right now. Please try again." };
  }
}

/** Optional email alert for new enquiries. Never blocks the form. */
async function notifyOwner(msg: { name: string; email: string; projectType: string; budget: string; message: string }) {
  const to = process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  if (!to) return;
  await sendEmail({
    to,
    replyTo: msg.email,
    subject: `New enquiry from ${msg.name}${msg.projectType ? ` — ${msg.projectType}` : ""}`,
    html: `<h2>New portfolio enquiry</h2>
<p><b>Name:</b> ${escapeHtml(msg.name)}<br/><b>Email:</b> ${escapeHtml(msg.email)}<br/>
<b>Project:</b> ${escapeHtml(msg.projectType || "—")}<br/><b>Budget:</b> ${escapeHtml(msg.budget || "—")}</p>
<p style="white-space:pre-wrap">${escapeHtml(msg.message)}</p>`,
  });
}
