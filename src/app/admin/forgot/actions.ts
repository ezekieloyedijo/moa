"use server";

import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { emailEnabled, escapeHtml, sendEmail } from "@/lib/email";
import { forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators";
import { siteUrl } from "@/lib/utils";

export type ResetState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /** The reset link is unusable; the form offers to send a new one. */
  linkExpired?: boolean;
};

const TOKEN_TTL_MINUTES = 30;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Step 1: email a single-use reset link. The reply is identical whether or not
 * the email has an account, so the form can't be used to discover the admin email.
 */
export async function requestPasswordReset(_prev: ResetState, form: FormData): Promise<ResetState> {
  const parsed = forgotPasswordSchema.safeParse({ email: form.get("email") });
  if (!parsed.success) return { status: "error", fieldErrors: { email: parsed.error.issues[0].message } };
  const { email } = parsed.data;

  if (!emailEnabled()) {
    return { status: "error", message: "Password reset emails aren't set up yet (RESEND_API_KEY is missing)." };
  }

  const [byIp, byEmail] = await Promise.all([
    rateLimit(`reset:ip:${await clientIp()}`, 5, 15 * 60),
    rateLimit(`reset:email:${email}`, 3, 15 * 60),
  ]);
  if (!byIp.ok || !byEmail.ok) return { status: "error", message: "Too many requests. Please wait 15 minutes and try again." };

  const sent: ResetState = {
    status: "success",
    message: `If ${email} belongs to the dashboard account, a reset link is on its way. It expires in ${TOKEN_TTL_MINUTES} minutes.`,
  };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return sent;

  // A new link replaces any earlier unused ones.
  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000) },
    }),
  ]);

  const link = `${siteUrl()}/admin/reset?token=${token}`;
  const ok = await sendEmail({
    to: user.email,
    subject: "Reset your dashboard password",
    html: `<p>Hi ${escapeHtml(user.name?.split(" ")[0] || "there")},</p>
<p>Someone (hopefully you) asked to reset the password for your portfolio dashboard.</p>
<p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#C2410C;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Choose a new password</a></p>
<p>This link works once and expires in ${TOKEN_TTL_MINUTES} minutes. If you didn't ask for it, ignore this email; your password stays the same.</p>`,
  });
  if (!ok) return { status: "error", message: "Couldn't send the email right now. Please try again in a few minutes." };
  return sent;
}

/** Step 2: check the token, set the new password, and use up every reset link for that account. */
export async function resetPassword(_prev: ResetState, form: FormData): Promise<ResetState> {
  const parsed = resetPasswordSchema.safeParse({
    token: form.get("token"),
    next: form.get("next"),
    confirm: form.get("confirm"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => (fieldErrors[String(i.path[0])] ??= i.message));
    return { status: "error", message: fieldErrors.token, fieldErrors, linkExpired: !!fieldErrors.token };
  }

  const limit = await rateLimit(`reset-submit:ip:${await clientIp()}`, 10, 15 * 60);
  if (!limit.ok) return { status: "error", message: "Too many attempts. Please wait 15 minutes and try again." };

  const expired: ResetState = { status: "error", message: "This reset link has expired or was already used.", linkExpired: true };
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(parsed.data.token) } });
  if (!record || record.expiresAt < new Date()) return expired;

  const passwordHash = await bcrypt.hash(parsed.data.next, 12);
  const used = await prisma.$transaction(async (tx) => {
    // Deleting this exact row first makes the link single-use even if it's submitted twice at once.
    const { count } = await tx.passwordResetToken.deleteMany({ where: { id: record.id } });
    if (count === 0) return false;
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tx.passwordResetToken.deleteMany({ where: { userId: record.userId } });
    return true;
  });
  if (!used) return expired;

  return { status: "success", message: "Your password has been changed. You can log in with it now." };
}
