import type {
  SiteSettings,
  Project,
  Category,
  SocialPostLink,
  Service,
  PricingTier,
  Testimonial,
  FAQ,
  Stat,
  ClientLogo,
  SocialLink,
  ProcessStep,
  PainPoint,
  GalleryItem,
} from "@prisma/client";

/** Dates become ISO strings so data can cross the server → client boundary. */
export type Plain<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] };
type Strip<T> = Omit<Plain<T>, "createdAt" | "updatedAt">;

export type SettingsData = Strip<SiteSettings>;
export type CategoryData = Strip<Category>;
export type ProjectData = Strip<Project> & {
  category: { name: string; slug: string } | null;
  socialLinks: Array<Pick<SocialPostLink, "id" | "platform" | "url" | "viewCount">>;
};
export type ServiceData = Strip<Service>;
export type PricingData = Strip<PricingTier>;
export type TestimonialData = Strip<Testimonial>;
export type FaqData = Strip<FAQ>;
export type StatData = Strip<Stat>;
export type LogoData = Strip<ClientLogo>;
export type SocialData = Strip<SocialLink>;
export type ProcessData = Strip<ProcessStep>;
export type PainPointData = Strip<PainPoint>;
export type GalleryData = Strip<GalleryItem>;

/** Everything the public page renders — fetched once at build/revalidation. */
export interface PublicData {
  settings: SettingsData;
  categories: CategoryData[];
  projects: ProjectData[];
  services: ServiceData[];
  pricing: PricingData[];
  testimonials: TestimonialData[];
  faqs: FaqData[];
  stats: StatData[];
  logos: LogoData[];
  socials: SocialData[];
  process: ProcessData[];
  painPoints: PainPointData[];
  gallery: GalleryData[];
}
