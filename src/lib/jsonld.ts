import type { PublicData } from "./types";
import { siteUrl } from "./utils";
import { embedUrl, watchUrl, youtubeThumb } from "./video";

/** Structured data for Google, generated from the database content. */
export function buildJsonLd(d: PublicData) {
  const url = siteUrl();
  const s = d.settings;
  const abs = (u: string) => (u.startsWith("http") ? u : `${url}${u}`);
  const personId = `${url}/#person`;

  const person = {
    "@type": "Person",
    "@id": personId,
    name: s.ownerName,
    alternateName: s.brandName,
    jobTitle: s.role,
    description: s.seoDescription || s.heroSubheadline,
    url,
    image: s.portraitUrl ? abs(s.portraitUrl) : undefined,
    email: s.email ? `mailto:${s.email}` : undefined,
    address: s.location
      ? { "@type": "PostalAddress", addressLocality: s.location.split(",")[0].trim(), addressCountry: s.location.split(",").pop()?.trim() }
      : undefined,
    sameAs: d.socials.map((x) => x.url),
    knowsAbout: ["Video editing", "Motion design", "Colour grading", ...s.softwareTools],
  };

  const website = {
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: `${s.ownerName} (${s.brandName})`,
    publisher: { "@id": personId },
    inLanguage: "en",
  };

  const business = {
    "@type": "ProfessionalService",
    "@id": `${url}/#service`,
    name: `${s.brandName}: ${s.ownerName}, ${s.role}`,
    url,
    image: s.ogImageUrl ? abs(s.ogImageUrl) : `${url}/opengraph-image`,
    founder: { "@id": personId },
    areaServed: "Worldwide",
    address: person.address,
    email: s.email || undefined,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Video editing services",
      itemListElement: d.services.map((sv) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: sv.title, description: sv.description },
      })),
    },
  };

  const videos = d.projects.map((p) => ({
    "@type": "VideoObject",
    name: p.title,
    description: p.description || p.title,
    thumbnailUrl: [p.thumbnailUrl ? abs(p.thumbnailUrl) : p.platform === "YOUTUBE" ? youtubeThumb(p.videoId) : `${url}/opengraph-image`],
    uploadDate: p.publishedAt,
    embedUrl: embedUrl(p.platform, p.videoId).split("?")[0],
    contentUrl: watchUrl(p.platform, p.videoId),
    creator: { "@id": personId },
  }));

  const faq = d.faqs.length
    ? {
        "@type": "FAQPage",
        mainEntity: d.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
      }
    : null;

  return {
    "@context": "https://schema.org",
    "@graph": [person, website, business, ...videos, ...(faq ? [faq] : [])],
  };
}
