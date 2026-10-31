"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { submitContact } from "@/app/actions";
import { contactSchema } from "@/lib/validators";
import type { SettingsData, TestimonialData } from "@/lib/types";
import { cn, whatsappLink } from "@/lib/utils";
import { track } from "@/lib/track";
import { Icon } from "@/components/icons";
import { Avatar } from "./testimonials";
import type { SectionText } from "@/lib/sections";

const BUDGETS = ["Under $250", "$250 – $500", "$500 – $1,000", "$1,000 – $3,000", "$3,000+", "Not sure yet"];

/** 13 CONTACT / FINAL CTA */
export function Contact({
  s,
  projectTypes,
  testimonial,
  index,
  heading,
}: {
  s: SettingsData;
  projectTypes: string[];
  testimonial?: TestimonialData;
  index: number;
  heading: SectionText;
}) {
  const [startedAt, setStartedAt] = useState(0);
  const [fe, setFe] = useState<Record<string, string>>({});
  /** wa.me link of the sent enquiry; non-null switches to the success panel. */
  const [sentUrl, setSentUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const firstName = s.ownerName.split(" ")[0];
  const wa = whatsappLink(s.whatsappNumber, `Hi ${firstName}, I found your portfolio and I'd like to talk about a project.`);

  useEffect(() => setStartedAt(Date.now()), []);

  /**
   * Sends the enquiry to the owner's WhatsApp: validates, then opens wa.me
   * with every field pre-filled so the visitor just taps Send. A copy is also
   * saved to the dashboard inbox in the background; WhatsApp never waits on it.
   */
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = contactSchema.safeParse(
      Object.fromEntries(["name", "email", "projectType", "budget", "message"].map((k) => [k, String(form.get(k) ?? "")])),
    );
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errors[String(i.path[0])] ??= i.message));
      setFe(errors);
      toast.error("Please check the highlighted fields.");
      return;
    }
    setFe({});
    const d = parsed.data;
    const details = [
      `*Name:* ${d.name}`,
      `*Email:* ${d.email}`,
      d.projectType && `*Project type:* ${d.projectType}`,
      d.budget && `*Budget:* ${d.budget}`,
    ].filter(Boolean);
    const text = [
      `Hi ${firstName}, I found your portfolio and I'd like to work with you.`,
      details.join("\n"),
      `*Message:*\n${d.message}`,
    ].join("\n\n");
    const url = whatsappLink(s.whatsappNumber, text);
    if (!url) {
      toast.error("WhatsApp isn't set up yet. Please email me instead.");
      return;
    }

    // Must run synchronously inside the submit event, or popup blockers step in.
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;

    void submitContact({ status: "idle" }, form).catch(() => {});
    track("generate_lead", { form: "contact", method: "whatsapp" });
    formRef.current?.reset();
    setSentUrl(url);
  }

  async function copyEmail() {
    track("contact_click", { method: "email_copy" });
    try {
      await navigator.clipboard.writeText(s.email);
      toast.success(`Email copied: ${s.email}`);
    } catch {
      window.location.href = `mailto:${s.email}`;
    }
  }

  // The last word is highlighted, as in "LET'S TALK" (single-word titles stay plain).
  const lastSpace = heading.title.trimEnd().lastIndexOf(" ");
  const accentFrom = lastSpace > 0 ? lastSpace + 1 : Infinity;

  const field =
    "mt-2 block w-full min-h-12 rounded-xl border bg-bg px-4 py-3 text-base text-fg placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <p className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          <span className="text-accent">{String(index).padStart(2, "0")}</span>
          <span className="h-px w-8 bg-line" aria-hidden="true" /> {heading.label}
        </p>
        <h2 id="contact-title" className="flex flex-wrap font-display text-[clamp(4.5rem,19vw,17rem)] uppercase leading-[0.82] tracking-tight">
          {[...heading.title].map((ch, i) => (
            <span key={i} className="mask-line inline-block" style={{ "--i": i } as React.CSSProperties}>
              <span className={cn(ch === " " && "w-[0.25em]", i >= accentFrom && "text-accent")}>{ch === " " ? " " : ch}</span>
            </span>
          ))}
        </h2>
        <p className="mt-4 flex items-center gap-2 text-lg text-muted">
          <span className="pulse-dot relative h-2 w-2 rounded-full bg-emerald-500 text-emerald-500" aria-hidden="true" />
          {s.replyTime}. Tell me about your project.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {sentUrl ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-line bg-surface p-10 text-center"
                  role="status"
                >
                  <svg viewBox="0 0 52 52" className="h-20 w-20 text-accent" aria-hidden="true">
                    <motion.circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="2.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                    <motion.path d="M15 27l7 7 15-15" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5, duration: 0.4 }} />
                  </svg>
                  <h3 className="mt-6 font-display text-4xl uppercase">Almost there</h3>
                  <p className="mt-2 max-w-sm text-muted">
                    WhatsApp has opened with your message ready. Just tap <b className="text-fg">Send</b> and I&apos;ll reply within 24 hours.
                  </p>
                  <a href={sentUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#25D366] px-6 font-semibold text-[#0B0B0F]">
                    <Icon name="whatsapp" size={20} /> WhatsApp didn&apos;t open? Tap here
                  </a>
                  {s.calendlyUrl && (
                    <a href={s.calendlyUrl} target="_blank" rel="noopener noreferrer" className="mt-4 font-semibold text-accent underline underline-offset-4">
                      Want to talk sooner? Book a call →
                    </a>
                  )}
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  onSubmit={handleSubmit}
                  exit={{ opacity: 0, y: -10 }}
                  noValidate
                  className="relative grid gap-5 rounded-3xl border border-line bg-surface p-6 sm:grid-cols-2 md:p-8"
                >
                  {/* Spam traps: hidden honeypot + time-to-submit */}
                  <div className="absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
                    <label>
                      Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                    </label>
                  </div>
                  <input type="hidden" name="startedAt" value={startedAt} />

                  <div className="contents">
                  <label className="text-sm font-medium">
                    Name
                    <input name="name" required autoComplete="name" placeholder="Your name" aria-invalid={!!fe.name} className={cn(field, fe.name ? "border-red-500" : "border-line")} />
                    {fe.name && <span className="mt-1 block text-sm text-red-600 dark:text-red-400">{fe.name}</span>}
                  </label>
                  <label className="text-sm font-medium">
                    Email
                    <input name="email" type="email" inputMode="email" required autoComplete="email" placeholder="you@company.com" aria-invalid={!!fe.email} className={cn(field, fe.email ? "border-red-500" : "border-line")} />
                    {fe.email && <span className="mt-1 block text-sm text-red-600 dark:text-red-400">{fe.email}</span>}
                  </label>
                  <label className="text-sm font-medium">
                    Project type
                    <select name="projectType" defaultValue="" className={cn(field, "border-line")}>
                      <option value="">Choose one…</option>
                      {projectTypes.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                      <option>Something else</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Budget
                    <select name="budget" defaultValue="" className={cn(field, "border-line")}>
                      <option value="">Choose a range…</option>
                      {BUDGETS.map((b) => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium sm:col-span-2">
                    Message
                    <textarea name="message" required rows={5} placeholder="What are you working on, and when do you need it?" aria-invalid={!!fe.message} className={cn(field, "resize-y", fe.message ? "border-red-500" : "border-line")} />
                    {fe.message && <span className="mt-1 block text-sm text-red-600 dark:text-red-400">{fe.message}</span>}
                  </label>
                  </div>
                  <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted">Opens WhatsApp with your message ready to send.</p>
                    <button
                      type="submit"
                      className="shimmer inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 font-semibold text-on-accent transition active:scale-[0.97]"
                    >
                      <Icon name="whatsapp" size={18} /> Send on WhatsApp
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <aside className="space-y-6 lg:col-span-5" aria-label="Other ways to reach me">
            <div className="grid gap-3">
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => track("contact_click", { method: "whatsapp" })} className="flex min-h-16 items-center gap-4 rounded-2xl border border-line bg-surface px-5 transition hover:-translate-y-0.5 hover:border-accent">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#25D366] text-[#0B0B0F]">
                    <Icon name="whatsapp" size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">Chat on WhatsApp</span>
                    <span className="text-sm text-muted">Fastest reply</span>
                  </span>
                  <Icon name="arrowUpRight" className="text-muted" />
                </a>
              )}
              {s.email && (
                <button type="button" onClick={copyEmail} className="flex min-h-16 items-center gap-4 rounded-2xl border border-line bg-surface px-5 text-left transition hover:-translate-y-0.5 hover:border-accent">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Icon name="mail" />
                  </span>
                  <span className="min-w-0 flex-1">
                    {/* <wbr> lets a long address break cleanly before the "@" on narrow phones */}
                    <span className="block font-semibold wrap-anywhere">
                      {s.email.split("@")[0]}
                      {s.email.includes("@") && (
                        <>
                          <wbr />@{s.email.split("@").slice(1).join("@")}
                        </>
                      )}
                    </span>
                    <span className="text-sm text-muted">Click to copy</span>
                  </span>
                  <Icon name="copy" className="text-muted" />
                </button>
              )}
              {s.calendlyUrl && (
                <a href={s.calendlyUrl} target="_blank" rel="noopener noreferrer" onClick={() => track("book_call", { method: "calendly" })} className="flex min-h-16 items-center gap-4 rounded-2xl border border-line bg-surface px-5 transition hover:-translate-y-0.5 hover:border-accent">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Icon name="calendar" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">Book a free 15-min call</span>
                    <span className="text-sm text-muted">Pick a time on Calendly</span>
                  </span>
                  <Icon name="arrowUpRight" className="text-muted" />
                </a>
              )}
            </div>

            {testimonial && (
              <figure className="rounded-2xl border border-line bg-surface p-6">
                <blockquote className="font-serif text-xl italic leading-snug">“{testimonial.quote}”</blockquote>
                <figcaption className="mt-4 flex items-center gap-3">
                  <Avatar name={testimonial.name} photo={testimonial.photoUrl} size={44} />
                  <span>
                    <span className="block text-sm font-semibold">{testimonial.name}</span>
                    <span className="text-sm text-muted">{testimonial.company}</span>
                  </span>
                </figcaption>
              </figure>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
