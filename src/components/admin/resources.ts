import type { ResourceKey } from "@/lib/validators";
import { iconNames } from "@/components/icons";
import { youtubeThumb } from "@/lib/video";

/**
 * Declarative config for every content type in the dashboard. The generic
 * ResourceManager renders list + form from this, so adding a field is a
 * one-line change here (plus the Zod schema and Prisma model).
 */

type Values = Record<string, unknown>;
type Base = { name: string; label: string; help?: string; full?: boolean; showIf?: (v: Values) => boolean };

export type FieldDef =
  | (Base & { type: "text" | "url" | "email" | "number"; placeholder?: string; counter?: number })
  | (Base & { type: "textarea"; rows?: number; placeholder?: string; counter?: number })
  | (Base & { type: "toggle" })
  | (Base & { type: "select"; options: Array<{ value: string; label: string }> | "categories" | "icons" })
  | (Base & { type: "tags"; placeholder?: string })
  | (Base & { type: "image"; aspect?: string; maxWidth?: number; fit?: "cover" | "contain"; folder?: string; dims?: boolean })
  | (Base & { type: "video" })
  | (Base & { type: "socialLinks" })
  | (Base & { type: "heading" });

export interface ResourceConfig {
  title: string;
  singular: string;
  description: string;
  fields: FieldDef[];
  defaults: Values;
  list: {
    title: (i: Values) => string;
    subtitle?: (i: Values) => string;
    image?: (i: Values) => string | undefined;
    imageFit?: "cover" | "contain";
  };
  toggles?: Array<{ field: string; label: string }>;
  /** Map a DB row to form values (for nested data). */
  toForm?: (i: Values) => Values;
}

const iconOptions = "icons" as const;
const orientation = [
  { value: "LANDSCAPE", label: "Horizontal 16:9" },
  { value: "PORTRAIT", label: "Vertical 9:16 (Reel / Short / TikTok)" },
];

export const resources: Record<Exclude<ResourceKey, "gallery">, ResourceConfig> = {
  projects: {
    title: "Projects",
    singular: "project",
    description: "Your portfolio videos. Upload to YouTube first, paste the link, add the details, then publish.",
    defaults: {
      title: "",
      slug: "",
      client: "",
      categoryId: null,
      description: "",
      role: "",
      tools: [],
      resultMetric: "",
      videoUrl: "",
      orientation: "LANDSCAPE",
      thumbnailUrl: "",
      thumbnailAlt: "",
      featured: false,
      published: true,
      isCaseStudy: false,
      challenge: "",
      approach: "",
      results: "",
      beforeImageUrl: "",
      afterImageUrl: "",
      socialLinks: [],
    },
    toForm: (i) => ({
      ...i,
      socialLinks: ((i.socialLinks as Values[]) ?? []).map((s) => ({ platform: s.platform, url: s.url, viewCount: s.viewCount })),
    }),
    list: {
      title: (i) => String(i.title),
      subtitle: (i) => [(i.category as { name?: string } | null)?.name, i.client, i.resultMetric].filter(Boolean).join(" · "),
      image: (i) => (i.thumbnailUrl as string) || (i.platform === "YOUTUBE" ? youtubeThumb(String(i.videoId)) : undefined),
    },
    toggles: [
      { field: "published", label: "Published" },
      { field: "featured", label: "Featured" },
    ],
    fields: [
      { type: "heading", name: "_video", label: "Video" },
      { type: "video", name: "videoUrl", label: "Video link", full: true },
      { type: "select", name: "orientation", label: "Orientation", options: orientation },
      { type: "select", name: "categoryId", label: "Category", options: "categories" },
      {
        type: "image",
        name: "thumbnailUrl",
        label: "Custom thumbnail (optional)",
        help: "Leave empty to use the YouTube thumbnail automatically.",
        full: true,
        folder: "thumbnails",
      },
      { type: "text", name: "thumbnailAlt", label: "Thumbnail alt text", help: "Describe the image for Google and screen readers.", full: true, counter: 200 },
      { type: "heading", name: "_details", label: "Details" },
      { type: "text", name: "title", label: "Project title", counter: 120 },
      { type: "text", name: "client", label: "Client / channel" },
      { type: "textarea", name: "description", label: "Description", rows: 4, full: true, help: "2–3 sentences. Google indexes this text.", counter: 2000 },
      { type: "text", name: "role", label: "Your role", placeholder: "Lead editor, motion graphics" },
      { type: "text", name: "resultMetric", label: "Result metric", placeholder: "+68% view duration", counter: 80 },
      { type: "tags", name: "tools", label: "Tools used", full: true, placeholder: "Premiere Pro, After Effects…" },
      { type: "text", name: "slug", label: "URL slug (optional)", help: "Auto-generated from the title if empty." },
      { type: "toggle", name: "published", label: "Published", help: "Drafts are hidden from the live site." },
      { type: "toggle", name: "featured", label: "Featured" },
      { type: "heading", name: "_social", label: "Original posts (social proof)" },
      { type: "socialLinks", name: "socialLinks", label: "“Also on Instagram / TikTok” links", full: true },
      { type: "heading", name: "_case", label: "Case study" },
      { type: "toggle", name: "isCaseStudy", label: "Show as a case study", full: true },
      { type: "textarea", name: "challenge", label: "Challenge", rows: 3, full: true, showIf: (v) => !!v.isCaseStudy },
      { type: "textarea", name: "approach", label: "Approach", rows: 3, full: true, showIf: (v) => !!v.isCaseStudy },
      { type: "textarea", name: "results", label: "Results", rows: 3, full: true, showIf: (v) => !!v.isCaseStudy },
      { type: "image", name: "beforeImageUrl", label: "Before image", folder: "case-studies", showIf: (v) => !!v.isCaseStudy },
      { type: "image", name: "afterImageUrl", label: "After image", folder: "case-studies", showIf: (v) => !!v.isCaseStudy },
    ],
  },

  categories: {
    title: "Categories",
    singular: "category",
    description: "Filter tabs on the Work section (e.g. YouTube, Reels, Commercials).",
    defaults: { name: "", slug: "" },
    list: { title: (i) => String(i.name), subtitle: (i) => `/${i.slug}` },
    fields: [
      { type: "text", name: "name", label: "Name" },
      { type: "text", name: "slug", label: "Slug (optional)", help: "Auto-generated from the name if empty." },
    ],
  },

  services: {
    title: "Services",
    singular: "service",
    description: "The numbered service accordion. Titles also fill the contact form's 'Project type' menu.",
    defaults: { title: "", description: "", deliverables: [], turnaround: "", startingPrice: "", icon: "film" },
    list: { title: (i) => String(i.title), subtitle: (i) => [i.startingPrice, i.turnaround].filter(Boolean).join(" · ") },
    fields: [
      { type: "text", name: "title", label: "Service name" },
      { type: "select", name: "icon", label: "Icon", options: iconOptions },
      { type: "textarea", name: "description", label: "Description", rows: 3, full: true, counter: 600 },
      { type: "tags", name: "deliverables", label: "Deliverables", full: true },
      { type: "text", name: "startingPrice", label: "Starting price", placeholder: "From $150 / video" },
      { type: "text", name: "turnaround", label: "Turnaround", placeholder: "3–5 days" },
    ],
  },

  pricing: {
    title: "Pricing tiers",
    singular: "pricing tier",
    description: "Packages shown under Services. Mark one as 'Most popular'.",
    defaults: { name: "", price: "", features: [], revisions: "", turnaround: "", isPopular: false, ctaLabel: "Book a Call" },
    list: { title: (i) => `${i.name}: ${i.price}`, subtitle: (i) => (i.isPopular ? "★ Most popular" : String(i.turnaround ?? "")) },
    toggles: [{ field: "isPopular", label: "Popular" }],
    fields: [
      { type: "text", name: "name", label: "Tier name" },
      { type: "text", name: "price", label: "Price", placeholder: "$550 / month" },
      { type: "tags", name: "features", label: "Features", full: true },
      { type: "text", name: "revisions", label: "Revisions", placeholder: "3 revisions" },
      { type: "text", name: "turnaround", label: "Turnaround" },
      { type: "text", name: "ctaLabel", label: "Button label" },
      { type: "toggle", name: "isPopular", label: "Most popular badge" },
    ],
  },

  testimonials: {
    title: "Testimonials",
    singular: "testimonial",
    description: "Client quotes for the carousel. Add a YouTube link to show a video testimonial.",
    defaults: { name: "", role: "", company: "", quote: "", rating: 5, photoUrl: "", videoUrl: "", published: true },
    list: { title: (i) => String(i.name), subtitle: (i) => String(i.company ?? ""), image: (i) => (i.photoUrl as string) || undefined },
    toggles: [{ field: "published", label: "Published" }],
    fields: [
      { type: "text", name: "name", label: "Client name" },
      { type: "text", name: "role", label: "Role", placeholder: "Creator / Marketing Lead" },
      { type: "text", name: "company", label: "Company or channel", full: true },
      { type: "textarea", name: "quote", label: "Quote", rows: 4, full: true, counter: 600 },
      {
        type: "select",
        name: "rating",
        label: "Rating",
        options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: "★".repeat(n) })),
      },
      { type: "url", name: "videoUrl", label: "Video testimonial link (optional)", placeholder: "https://youtu.be/…" },
      { type: "image", name: "photoUrl", label: "Photo (optional)", aspect: "1/1", maxWidth: 400, folder: "testimonials" },
      { type: "toggle", name: "published", label: "Published" },
    ],
  },

  faqs: {
    title: "FAQs",
    singular: "FAQ",
    description: "Questions shown in the FAQ accordion (also added to Google's FAQ structured data).",
    defaults: { question: "", answer: "" },
    list: { title: (i) => String(i.question) },
    fields: [
      { type: "text", name: "question", label: "Question", full: true },
      { type: "textarea", name: "answer", label: "Answer", rows: 5, full: true },
    ],
  },

  stats: {
    title: "Stats",
    singular: "stat",
    description: "Animated count-up numbers in the trust bar.",
    defaults: { label: "", value: 0, suffix: "" },
    list: { title: (i) => `${i.value}${i.suffix}`, subtitle: (i) => String(i.label) },
    fields: [
      { type: "number", name: "value", label: "Number", help: "Whole number only, e.g. 25" },
      { type: "text", name: "suffix", label: "Suffix", placeholder: "+ or M+ or %" },
      { type: "text", name: "label", label: "Label", full: true, placeholder: "Views generated" },
    ],
  },

  logos: {
    title: "Client logos",
    singular: "logo",
    description: "Shown in the moving logo bar. Logos are displayed monochrome so they suit both themes. SVG or transparent PNG works best.",
    defaults: { name: "", logoUrl: "" },
    list: { title: (i) => String(i.name), image: (i) => i.logoUrl as string, imageFit: "contain" },
    fields: [
      { type: "text", name: "name", label: "Client name (alt text)", full: true },
      { type: "image", name: "logoUrl", label: "Logo", aspect: "3/1", maxWidth: 600, fit: "contain", full: true, folder: "logos" },
    ],
  },

  socials: {
    title: "Social links",
    singular: "social link",
    description: "Footer icons and Google's 'sameAs' profile links.",
    defaults: { platform: "instagram", url: "", handle: "" },
    list: { title: (i) => String(i.platform), subtitle: (i) => String(i.handle || i.url) },
    fields: [
      {
        type: "select",
        name: "platform",
        label: "Platform",
        options: ["instagram", "youtube", "tiktok", "linkedin", "x", "vimeo", "behance", "facebook"].map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) })),
      },
      { type: "text", name: "handle", label: "Handle", placeholder: "@mercyedits" },
      { type: "url", name: "url", label: "Profile URL", full: true },
    ],
  },

  process: {
    title: "Process steps",
    singular: "step",
    description: "The 'From footage to final cut' timeline.",
    defaults: { title: "", description: "", icon: "spark" },
    list: { title: (i) => String(i.title), subtitle: (i) => String(i.description) },
    fields: [
      { type: "text", name: "title", label: "Step title" },
      { type: "select", name: "icon", label: "Icon", options: iconOptions },
      { type: "textarea", name: "description", label: "Description", rows: 3, full: true },
    ],
  },

  painpoints: {
    title: "Problems & solutions",
    singular: "problem / solution",
    description: "The 'Your problem, solved' section: a client pain point and how you fix it.",
    defaults: { problem: "", solution: "" },
    list: { title: (i) => String(i.problem), subtitle: (i) => `→ ${i.solution}` },
    fields: [
      { type: "text", name: "problem", label: "Client problem", full: true },
      { type: "textarea", name: "solution", label: "How you solve it", rows: 3, full: true },
    ],
  },
};

export const iconSelectOptions = iconNames
  .filter((n) => !["close", "menu", "chevron", "minus", "arrowUp", "copy"].includes(n))
  .map((n) => ({ value: n, label: n }));
