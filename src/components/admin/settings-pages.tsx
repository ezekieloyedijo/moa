"use client";

import { SettingsEditor, type SettingsSection } from "./settings-editor";

type Values = Record<string, unknown>;

const general: SettingsSection[] = [
  {
    id: "brand",
    title: "Brand & identity",
    fields: [
      { type: "text", name: "brandName", label: "Brand name", help: "Shown as the logo wordmark, e.g. MOA" },
      { type: "text", name: "ownerName", label: "Full name" },
      { type: "text", name: "role", label: "Role / job title", help: "Appears in the H1 and Google results.", full: true },
      { type: "image", name: "logoLightUrl", label: "Logo for LIGHT mode (optional)", help: "Dark-coloured logo. Leave empty to use the text wordmark.", aspect: "3/1", fit: "contain", maxWidth: 800, folder: "brand" },
      { type: "image", name: "logoDarkUrl", label: "Logo for DARK mode (optional)", help: "Light-coloured logo version.", aspect: "3/1", fit: "contain", maxWidth: 800, folder: "brand" },
    ],
  },
  {
    id: "hero",
    title: "Hero section",
    description: "The first thing visitors see. Say who you are, what you do and why to hire you.",
    fields: [
      { type: "text", name: "heroHeadline", label: "Headline name (big letters)", placeholder: "Mercy Adedayo", counter: 60 },
      { type: "tags", name: "rotatingWords", label: "Rotating words", help: "Shown in “I help creators, brands & agencies win with ___”." },
      { type: "textarea", name: "heroSubheadline", label: "Value line", rows: 3, counter: 300 },
      { type: "text", name: "tagline", label: "Tagline", full: true },
      { type: "text", name: "trustLine", label: "Trust line (social proof)", placeholder: "Trusted by 40+ creators · 25M+ views", full: true, counter: 160 },
      { type: "text", name: "availabilityStatus", label: "Availability badge", placeholder: "Available for new projects" },
      { type: "text", name: "availableFrom", label: "Available from", placeholder: "Booking from December" },
      {
        type: "url",
        name: "heroVideoUrl",
        label: "Background video (muted MP4 loop)",
        help: "Use /hero.mp4 (file in the project's /public folder) or an external MP4 link. 10–15s, 720p, under 4MB, no audio. Never upload video to Blob.",
        full: true,
      },
      { type: "image", name: "heroPosterUrl", label: "Background poster image", help: "Shown on phones, slow connections and while the video loads.", full: true, folder: "hero" },
      { type: "url", name: "showreelUrl", label: "Showreel link (YouTube or Vimeo)", full: true },
      { type: "image", name: "showreelThumbnailUrl", label: "Showreel cover image (optional)", full: true, folder: "hero" },
    ],
  },
  {
    id: "contact",
    title: "Contact & availability",
    fields: [
      { type: "email", name: "email", label: "Public email" },
      { type: "text", name: "whatsappNumber", label: "WhatsApp number", placeholder: "+234 801 234 5678", help: "With country code." },
      { type: "url", name: "calendlyUrl", label: "Calendly (booking) link", full: true, help: "All “Book a Call” buttons open this. Leave empty to scroll to the contact form instead." },
      { type: "text", name: "replyTime", label: "Reply-time promise", placeholder: "I reply within 24 hours" },
      { type: "number", name: "happyClients", label: "Happy clients count", help: "Used in “Join 40+ happy clients”." },
      { type: "text", name: "location", label: "Location", placeholder: "Lagos, Nigeria" },
      { type: "text", name: "timezone", label: "Time zone", placeholder: "Africa/Lagos", help: "For the local time shown in the footer." },
    ],
  },
  {
    id: "about",
    title: "About section",
    description: "The section title is edited under Page sections.",
    fields: [
      { type: "textarea", name: "aboutText", label: "Your story", rows: 8, help: "Leave a blank line between paragraphs. Keep paragraphs short.", counter: 3000 },
      { type: "image", name: "portraitUrl", label: "Portrait photo", aspect: "4/5", maxWidth: 1200, folder: "brand" },
      { type: "text", name: "portraitAlt", label: "Portrait alt text", help: "Describe the photo for Google and screen readers." },
      { type: "number", name: "yearsExperience", label: "Years of experience" },
      { type: "tags", name: "softwareTools", label: "Software you use", full: true },
    ],
  },
  {
    id: "lead",
    title: "Lead magnet (footer signup)",
    description: "Visitors enter their email to get a free resource. Signups appear under Subscribers.",
    fields: [
      { type: "toggle", name: "leadMagnetEnabled", label: "Show the signup in the footer", full: true },
      { type: "text", name: "leadMagnetTitle", label: "Offer title", full: true, placeholder: "Free guide: 7 editing tricks that double watch time" },
      { type: "url", name: "leadMagnetUrl", label: "Download link (PDF, Google Drive…)", full: true },
    ],
  },
];

const seo: SettingsSection[] = [
  {
    id: "search",
    title: "Google search listing",
    description: "How the site appears in Google. Include your name, what you do and where.",
    fields: [
      { type: "text", name: "seoTitle", label: "Page title", help: "Ideal: 50–60 characters, e.g. “Mercy Adedayo | Video Editor in Lagos”." },
      { type: "textarea", name: "seoDescription", label: "Meta description", rows: 3, help: "Ideal: 150–160 characters. Say who you help and how." },
    ],
  },
  {
    id: "social",
    title: "Social share image",
    description: "Shown when the link is shared on WhatsApp, LinkedIn, X, etc. Leave empty to use the auto-generated image with your name and role.",
    fields: [{ type: "image", name: "ogImageUrl", label: "Open Graph image (1200×630)", aspect: "1200/630", maxWidth: 1200, full: true, folder: "seo" }],
  },
  {
    id: "tracking",
    title: "Verification & analytics",
    fields: [
      { type: "text", name: "googleSiteVerification", label: "Google Search Console verification code", help: "Only the content=\"…\" value from the HTML tag method.", full: true },
      { type: "text", name: "googleAnalyticsId", label: "Google Analytics 4 ID", placeholder: "G-XXXXXXXXXX" },
      { type: "text", name: "metaPixelId", label: "Meta Pixel ID", placeholder: "1234567890" },
    ],
  },
];

// Live counters for the SEO fields
const withIdeal = (secs: SettingsSection[]) =>
  secs.map((s) => ({
    ...s,
    fields: s.fields.map((f) =>
      f.name === "seoTitle" ? { ...f, type: "text" as const, counter: 60 } : f.name === "seoDescription" ? { ...f, type: "textarea" as const, counter: 160 } : f,
    ),
  }));

export function GeneralSettings({ initial }: { initial: Values }) {
  return (
    <SettingsEditor
      title="Settings & Hero"
      description="Your name, hero, contact details, about text and branding. Saving updates the live site within seconds."
      sections={general}
      initial={initial}
    />
  );
}

export function SeoSettings({ initial, siteUrl }: { initial: Values; siteUrl: string }) {
  return (
    <SettingsEditor
      title="SEO & tracking"
      description="Control your Google listing, share image and analytics."
      sections={withIdeal(seo)}
      initial={initial}
      aside={(v) => <GooglePreview title={String(v.seoTitle || "")} description={String(v.seoDescription || "")} url={siteUrl} />}
    />
  );
}

function GooglePreview({ title, description, url }: { title: string; description: string; url: string }) {
  const host = url.replace(/^https?:\/\//, "");
  const tLen = title.length;
  const dLen = description.length;
  const badge = (ok: boolean, text: string) => (
    <span className={ok ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>{text}</span>
  );
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 md:p-7" aria-label="Google search preview">
      <h2 className="mb-4 text-lg font-semibold">Google preview</h2>
      <div className="rounded-xl bg-white p-4 font-[arial,sans-serif] text-left shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0B0B0F] text-[10px] font-bold text-[#FF6B35]">▶</span>
          <span>
            <span className="block text-sm leading-tight text-[#202124]">{host}</span>
            <span className="block text-xs leading-tight text-[#4d5156]">{url}</span>
          </span>
        </div>
        <p className="mt-2 truncate text-xl leading-snug text-[#1a0dab]">{title || "Your page title"}</p>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#4d5156]">{description || "Your meta description will appear here."}</p>
      </div>
      <p className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {badge(tLen >= 30 && tLen <= 60, `Title: ${tLen} characters ${tLen > 60 ? "(may be cut off)" : tLen < 30 ? "(a bit short)" : "✓"}`)}
        {badge(dLen >= 150 && dLen <= 160, `Description: ${dLen} characters ${dLen > 160 ? "(may be cut off)" : dLen < 150 ? "(aim for 150–160)" : "✓"}`)}
      </p>
    </section>
  );
}
