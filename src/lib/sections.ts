/**
 * Public page sections the owner can show/hide and retitle from the dashboard
 * (Page sections). Saved overrides live in SiteSettings.sections as
 * { [key]: { enabled?, label?, title?, intro? } }; anything left empty falls
 * back to the defaults below. "{name}" is replaced with the owner's first name.
 */

export type SectionKey =
  | "hero"
  | "trust"
  | "why"
  | "showreel"
  | "work"
  | "caseStudies"
  | "gallery"
  | "services"
  | "process"
  | "testimonials"
  | "about"
  | "faq"
  | "contact";

type Def = {
  /** Name shown in the dashboard. */
  name: string;
  /** Where the content for this section is edited. */
  contentHref: string;
  label?: string;
  title?: string;
  intro?: string;
};

export const SECTIONS: Record<SectionKey, Def> = {
  hero: { name: "Hero (top of the page)", contentHref: "/admin/settings#hero" },
  trust: { name: "Trust bar (client logos & stats)", contentHref: "/admin/logos", title: "Trusted by creators, brands & agencies" },
  why: {
    name: "Problems & solutions",
    contentHref: "/admin/painpoints",
    label: "Why work with me",
    title: "Your problem, solved",
    intro: "The editing headaches creators and brands bring to me, and exactly how {name} fixes each one.",
  },
  showreel: {
    name: "Showreel",
    contentHref: "/admin/settings#hero",
    label: "Showreel",
    title: "My best work in 90 seconds",
    intro: "A fast cut of recent edits. Press play to watch with sound.",
  },
  work: {
    name: "Selected work",
    contentHref: "/admin/projects",
    label: "Selected work",
    title: "Edits that got results",
    intro: "Real projects for creators, brands and agencies. Click any project to watch it and see the outcome.",
  },
  caseStudies: {
    name: "Case studies",
    contentHref: "/admin/projects",
    label: "Case studies",
    title: "How the edit moved the numbers",
    intro: "A closer look at the problem, what I changed, and the measurable result.",
  },
  gallery: {
    name: "Gallery",
    contentHref: "/admin/gallery",
    label: "Gallery",
    title: "Stills, thumbnails & behind the scenes",
    intro: "Frames from my edits, thumbnail designs and moments from set. Tap any image to view it full screen.",
  },
  services: {
    name: "Services & pricing",
    contentHref: "/admin/services",
    label: "Services & packages",
    title: "What I can edit for you",
    intro: "Pick a service to see what's included, how long it takes and where pricing starts.",
  },
  process: {
    name: "Process",
    contentHref: "/admin/process",
    label: "How it works",
    title: "From footage to final cut",
    intro: "A simple five-step process, so you always know what happens next and when.",
  },
  testimonials: {
    name: "Testimonials",
    contentHref: "/admin/testimonials",
    label: "Testimonials",
    title: "What clients say",
    intro: "Real words from creators, brands and agencies I've edited for.",
  },
  about: { name: "About", contentHref: "/admin/settings#about", label: "About {name}", title: "About me" },
  faq: {
    name: "FAQ",
    contentHref: "/admin/faqs",
    label: "FAQ",
    title: "Questions, answered",
    intro: "Everything clients usually ask before we start working together.",
  },
  contact: { name: "Contact form", contentHref: "/admin/settings#contact", label: "Contact", title: "Let's talk" },
};

export const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[];

export type SectionOverride = { enabled?: boolean; label?: string; title?: string; intro?: string };
export type SectionOverrides = Partial<Record<SectionKey, SectionOverride>>;
export type SectionText = { label: string; title: string; intro: string };
export type ResolvedSection = SectionText & { enabled: boolean };

/** Reads the stored JSON defensively: unknown keys and wrong types are ignored. */
export function readOverrides(raw: unknown): SectionOverrides {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: SectionOverrides = {};
  for (const key of SECTION_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (!v || typeof v !== "object") continue;
    const o = v as Record<string, unknown>;
    out[key] = {
      enabled: typeof o.enabled === "boolean" ? o.enabled : undefined,
      label: typeof o.label === "string" ? o.label : undefined,
      title: typeof o.title === "string" ? o.title : undefined,
      intro: typeof o.intro === "string" ? o.intro : undefined,
    };
  }
  return out;
}

/** Every section with its saved text, or the default where nothing was saved. */
export function resolveSections(raw: unknown, ownerName: string, fallbacks: Partial<Record<SectionKey, { title?: string }>> = {}) {
  const first = ownerName.split(" ")[0] || ownerName;
  const fill = (t = "") => t.replaceAll("{name}", first);
  const saved = readOverrides(raw);
  return Object.fromEntries(
    SECTION_KEYS.map((key) => {
      const d = SECTIONS[key];
      const o = saved[key] ?? {};
      const pick = (v: string | undefined, def: string | undefined) => fill(v?.trim() || def);
      return [
        key,
        {
          enabled: o.enabled ?? true,
          label: pick(o.label, d.label),
          title: pick(o.title, fallbacks[key]?.title || d.title),
          intro: pick(o.intro, d.intro),
        },
      ];
    }),
  ) as Record<SectionKey, ResolvedSection>;
}

/** Navbar / footer links, minus sections that are switched off. */
export function sectionLinks(sections: Record<SectionKey, ResolvedSection>, keys: SectionKey[]) {
  const names: Partial<Record<SectionKey, string>> = { work: "Work", services: "Services", gallery: "Gallery", about: "About", faq: "FAQ", contact: "Contact" };
  return keys.filter((k) => sections[k].enabled).map((k) => ({ href: `#${k}`, label: names[k] ?? SECTIONS[k].name }));
}
