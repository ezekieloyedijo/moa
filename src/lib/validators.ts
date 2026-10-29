import { z } from "zod";
import { parseVideoUrl } from "./video";

/**
 * Zod schemas shared by dashboard forms (inline validation) and server
 * actions (authoritative validation). Never trust client-side checks alone.
 */

const str = (max = 300) => z.string().trim().max(max, `Keep it under ${max} characters`);
const req = (max = 300) => str(max).min(1, "Required");
const optUrl = str(600).refine((v) => v === "" || /^(https?:\/\/|\/)/.test(v), "Enter a full URL (https://…)");
const reqUrl = req(600).refine((v) => /^(https?:\/\/|\/)/.test(v), "Enter a full URL (https://…)");
const list = (max = 30) => z.array(z.string().trim().min(1).max(200)).max(max);
const bool = z.boolean();
const int = (min = 0, max = 1_000_000_000) => z.coerce.number().int().min(min).max(max);
const videoLink = req(600).refine((v) => !!parseVideoUrl(v), "Paste a YouTube, Vimeo, Instagram or TikTok link");
const optVideoLink = str(600).refine((v) => v === "" || !!parseVideoUrl(v), "Paste a YouTube, Vimeo, Instagram or TikTok link");
const platform = z.enum(["YOUTUBE", "VIMEO", "INSTAGRAM", "TIKTOK"]);
const orientation = z.enum(["LANDSCAPE", "PORTRAIT"]);

export const schemas = {
  projects: z.object({
    title: req(120),
    slug: str(80),
    client: str(120),
    categoryId: z.string().trim().max(40).nullable().transform((v) => v || null),
    description: req(2000),
    role: str(200),
    tools: list(),
    resultMetric: str(80),
    videoUrl: videoLink,
    orientation,
    thumbnailUrl: optUrl,
    thumbnailAlt: str(200),
    featured: bool,
    published: bool,
    isCaseStudy: bool,
    challenge: str(1500),
    approach: str(1500),
    results: str(1500),
    beforeImageUrl: optUrl,
    afterImageUrl: optUrl,
    socialLinks: z
      .array(z.object({ platform, url: reqUrl, viewCount: str(40) }))
      .max(6),
  }),
  categories: z.object({ name: req(60), slug: str(60) }),
  services: z.object({
    title: req(100),
    description: req(600),
    deliverables: list(),
    turnaround: str(60),
    startingPrice: str(60),
    icon: str(30),
  }),
  pricing: z.object({
    name: req(60),
    price: req(60),
    features: list(),
    revisions: str(80),
    turnaround: str(60),
    isPopular: bool,
    ctaLabel: req(40),
  }),
  testimonials: z.object({
    name: req(80),
    role: str(80),
    company: str(120),
    quote: req(600),
    rating: int(1, 5),
    photoUrl: optUrl,
    videoUrl: optVideoLink,
    published: bool,
  }),
  faqs: z.object({ question: req(200), answer: req(1500) }),
  stats: z.object({ label: req(60), value: int(0), suffix: str(10) }),
  logos: z.object({ name: req(80), logoUrl: reqUrl }),
  socials: z.object({ platform: req(30), url: reqUrl, handle: str(80) }),
  process: z.object({ title: req(80), description: req(400), icon: str(30) }),
  painpoints: z.object({ problem: req(200), solution: req(300) }),
  gallery: z.object({
    title: str(120),
    caption: str(300),
    imageUrl: reqUrl,
    altText: req(200),
    category: req(60),
    orientation,
    width: int(1, 10000),
    height: int(1, 10000),
    featured: bool,
    published: bool,
  }),
} as const;

export type ResourceKey = keyof typeof schemas;
export const resourceKeys = Object.keys(schemas) as ResourceKey[];

export const settingsSchema = z.object({
  brandName: req(30),
  ownerName: req(100),
  role: req(100),
  tagline: str(200),
  heroHeadline: req(60),
  heroSubheadline: str(300),
  rotatingWords: list(10),
  trustLine: str(160),
  availabilityStatus: str(80),
  availableFrom: str(80),
  location: str(80),
  timezone: str(60).refine((tz) => {
    if (!tz) return true;
    try {
      new Intl.DateTimeFormat("en", { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  }, "Use an IANA time zone like Africa/Lagos"),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]),
  whatsappNumber: str(30),
  calendlyUrl: optUrl,
  replyTime: str(80),
  happyClients: int(0, 100000),
  heroVideoUrl: optUrl,
  heroPosterUrl: optUrl,
  showreelUrl: optVideoLink,
  showreelThumbnailUrl: optUrl,
  logoLightUrl: optUrl,
  logoDarkUrl: optUrl,
  portraitUrl: optUrl,
  portraitAlt: str(200),
  aboutHeading: str(160),
  aboutText: str(3000),
  softwareTools: list(20),
  yearsExperience: int(0, 80),
  seoTitle: str(70),
  seoDescription: str(170),
  ogImageUrl: optUrl,
  googleSiteVerification: str(120),
  googleAnalyticsId: str(30).refine((v) => v === "" || /^G-[A-Z0-9]+$/i.test(v), "Looks like G-XXXXXXX"),
  metaPixelId: str(30).refine((v) => v === "" || /^\d+$/.test(v), "Digits only"),
  leadMagnetTitle: str(120),
  leadMagnetUrl: optUrl,
});
export type SettingsInput = z.infer<typeof settingsSchema>;

/** Image fields per resource — used to delete replaced/removed blobs. */
export const imageFields: Record<ResourceKey | "settings", string[]> = {
  projects: ["thumbnailUrl", "beforeImageUrl", "afterImageUrl"],
  categories: [],
  services: [],
  pricing: [],
  testimonials: ["photoUrl"],
  faqs: [],
  stats: [],
  logos: ["logoUrl"],
  socials: [],
  process: [],
  painpoints: [],
  gallery: ["imageUrl"],
  settings: ["heroPosterUrl", "showreelThumbnailUrl", "logoLightUrl", "logoDarkUrl", "portraitUrl", "ogImageUrl"],
};

// ── Public forms ────────────────────────────────────────────
export const contactSchema = z.object({
  name: req(100),
  email: z.string().trim().email("Enter a valid email so I can reply"),
  projectType: str(80),
  budget: str(60),
  message: z.string().trim().min(10, "Tell me a little more (10+ characters)").max(3000),
});

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

export const passwordSchema = z
  .object({
    current: z.string().min(1, "Required"),
    next: z.string().min(10, "Use at least 10 characters").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "Passwords don't match", path: ["confirm"] });
