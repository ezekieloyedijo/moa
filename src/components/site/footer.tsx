"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { subscribe, type FormState } from "@/app/actions";
import type { SettingsData, SocialData } from "@/lib/types";
import { track } from "@/lib/track";
import { Icon } from "@/components/icons";
import { Logo } from "./logo";
import { scrollToTarget } from "./smooth-scroll";

function LocalTime({ tz, location }: { tz: string; location: string }) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = () => {
      try {
        setNow(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz || "UTC" }).format(new Date()));
      } catch {
        setNow("");
      }
    };
    fmt();
    const t = window.setInterval(fmt, 30_000);
    return () => window.clearInterval(t);
  }, [tz]);
  return (
    <p className="flex items-center gap-2 text-sm text-muted">
      <Icon name="clock" size={16} />
      {now ? `${now} in ${location.split(",")[0]}` : location}
    </p>
  );
}

function LeadMagnet({ title }: { title: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, { status: "idle" });
  const [startedAt, setStartedAt] = useState(0);
  useEffect(() => setStartedAt(Date.now()), []);
  useEffect(() => {
    if (state.status === "success") {
      track("subscribe", { form: "lead_magnet" });
      toast.success(state.message);
    } else if (state.status === "error") toast.error(state.message);
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5" role="status">
        <p className="font-semibold">You&apos;re in!</p>
        {state.downloadUrl ? (
          <a href={state.downloadUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 font-semibold text-accent">
            <Icon name="download" size={18} /> Download your free guide
          </a>
        ) : (
          <p className="text-sm text-muted">{state.message}</p>
        )}
      </div>
    );
  }
  return (
    <form action={action} className="relative">
      <p className="mb-3 font-semibold">{title}</p>
      <div className="absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="flex gap-2">
        <label htmlFor="lm-email" className="sr-only">
          Email address
        </label>
        <input
          id="lm-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="you@email.com"
          className="min-h-12 w-full min-w-0 flex-1 rounded-full border border-line bg-bg px-5 text-base focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        <button type="submit" disabled={pending} className="min-h-12 shrink-0 rounded-full bg-accent px-5 font-semibold text-on-accent disabled:opacity-60">
          {pending ? "…" : "Get it"}
        </button>
      </div>
    </form>
  );
}

/** 14 FOOTER */
export function Footer({ s, socials, links }: { s: SettingsData; socials: SocialData[]; links: Array<{ href: string; label: string }> }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line pb-28 pt-16 md:pb-10">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-12 md:px-8">
        <div className="space-y-4 md:col-span-4">
          <Logo brand={s.brandName} lightUrl={s.logoLightUrl} darkUrl={s.logoDarkUrl} />
          <p className="max-w-xs text-muted">
            {s.ownerName}, {s.role.toLowerCase()} based in {s.location}.
          </p>
          <p className="flex items-center gap-2 text-sm">
            <span className="pulse-dot relative h-2 w-2 rounded-full bg-emerald-500 text-emerald-500" aria-hidden="true" />
            {s.availabilityStatus}
          </p>
          <LocalTime tz={s.timezone} location={s.location} />
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">Quick links</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1">
            {links.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className="inline-flex min-h-11 items-center hover:text-accent">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6 md:col-span-5">
          {s.leadMagnetEnabled && s.leadMagnetTitle && <LeadMagnet title={s.leadMagnetTitle} />}
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Social media">
              {socials.map((so) => (
                <li key={so.id}>
                  <a
                    href={so.url}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={`${so.platform} ${so.handle}`}
                    className="grid h-12 w-12 place-items-center rounded-full border border-line transition-[transform,background-color,color,border-color] duration-300 hover:-translate-y-1 hover:rotate-[8deg] hover:border-accent hover:bg-accent hover:text-on-accent"
                  >
                    <Icon name={so.platform.toLowerCase()} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col-reverse items-start justify-between gap-4 border-t border-line px-4 pt-6 text-sm text-muted sm:flex-row sm:items-center md:px-8">
        <p>
          © {year} {s.ownerName} ({s.brandName}). All rights reserved.
        </p>
        <button type="button" onClick={() => scrollToTarget(0)} className="group inline-flex min-h-11 items-center gap-2 hover:text-fg">
          Back to top
          <span className="grid h-9 w-9 place-items-center rounded-full border border-line transition group-hover:-translate-y-1 group-hover:border-accent">
            <Icon name="arrowUp" size={16} />
          </span>
        </button>
      </div>
    </footer>
  );
}
