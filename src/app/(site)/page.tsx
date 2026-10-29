import type { Metadata } from "next";
import { getPublicData } from "@/lib/data";
import { buildJsonLd } from "@/lib/jsonld";
import { siteUrl } from "@/lib/utils";
import { introScript } from "@/lib/intro";
import { VideoModalProvider } from "@/components/site/video-modal";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { RevealObserver } from "@/components/site/reveal-observer";
import { IntroLoader } from "@/components/site/intro-loader";
import { Navbar } from "@/components/site/navbar";
import { Hero } from "@/components/site/hero";
import { TrustBar } from "@/components/site/trust-bar";
import { ProblemSolution } from "@/components/site/problem-solution";
import { Showreel } from "@/components/site/showreel";
import { Work } from "@/components/site/work";
import { CaseStudies } from "@/components/site/case-studies";
import { Gallery } from "@/components/site/gallery";
import { Services } from "@/components/site/services";
import { Process } from "@/components/site/process";
import { Testimonials } from "@/components/site/testimonials";
import { About } from "@/components/site/about";
import { Faq } from "@/components/site/faq";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { GlobalCtas } from "@/components/site/global-ctas";
import { CustomCursor } from "@/components/site/custom-cursor";
import { Analytics } from "@/components/site/analytics";

/**
 * The public portfolio. Fully static: built once, then rebuilt on demand
 * when the owner saves in the dashboard (revalidatePath). Visitors never
 * trigger a database query.
 */
export const dynamic = "force-static";
export const revalidate = false;

export async function generateMetadata(): Promise<Metadata> {
  const { settings: s } = await getPublicData();
  const title = s.seoTitle || `${s.ownerName} | ${s.role} in ${s.location.split(",")[0]}`;
  const description = s.seoDescription || s.heroSubheadline;
  return {
    title,
    description,
    applicationName: s.brandName,
    authors: [{ name: s.ownerName, url: siteUrl() }],
    creator: s.ownerName,
    keywords: ["video editor", "motion designer", s.ownerName, s.brandName, `video editor ${s.location}`, "YouTube editor", "reels editor"],
    alternates: { canonical: "/" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1 } },
    openGraph: {
      type: "profile",
      url: "/",
      siteName: `${s.ownerName} (${s.brandName})`,
      title,
      description,
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
    verification: s.googleSiteVerification ? { google: s.googleSiteVerification } : undefined,
  };
}

export default async function HomePage() {
  const d = await getPublicData();
  const s = d.settings;
  const bookHref = s.calendlyUrl || "#contact";
  const bookExternal = !!s.calendlyUrl;
  const proof = s.trustLine;

  // Visible section numbers (01, 02, …) follow the sections that actually render.
  let n = 0;
  const num = () => ++n;

  return (
    <VideoModalProvider>
      <script dangerouslySetInnerHTML={{ __html: introScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(d)).replace(/</g, "\\u003c") }} />

      <IntroLoader brand={s.brandName} />
      <div className="grain" aria-hidden="true" />
      <SmoothScroll />
      <RevealObserver />
      <CustomCursor />

      <Navbar brand={s.brandName} logoLightUrl={s.logoLightUrl} logoDarkUrl={s.logoDarkUrl} bookHref={bookHref} bookExternal={bookExternal} />

      <main id="main">
        <Hero s={s} bookHref={bookHref} bookExternal={bookExternal} />
        <TrustBar logos={d.logos} stats={d.stats} />
        {d.painPoints.length > 0 && <ProblemSolution items={d.painPoints} name={s.ownerName} index={num()} />}
        {s.showreelUrl && <Showreel url={s.showreelUrl} thumbnail={s.showreelThumbnailUrl || s.heroPosterUrl} owner={s.ownerName} index={num()} />}
        {d.projects.length > 0 && <Work projects={d.projects} categories={d.categories} index={num()} proof={proof} />}
        {d.projects.some((p) => p.isCaseStudy) && <CaseStudies projects={d.projects} index={num()} />}
        {d.gallery.length > 0 && <Gallery items={d.gallery} index={num()} />}
        <Services services={d.services} pricing={d.pricing} index={num()} bookHref={bookHref} bookExternal={bookExternal} proof={proof} />
        {d.process.length > 0 && <Process steps={d.process} index={num()} />}
        {d.testimonials.length > 0 && (
          <Testimonials items={d.testimonials} index={num()} happyClients={s.happyClients} bookHref={bookHref} bookExternal={bookExternal} />
        )}
        <About s={s} index={num()} />
        {d.faqs.length > 0 && <Faq faqs={d.faqs} index={num()} />}
        <Contact s={s} projectTypes={d.services.map((x) => x.title)} testimonial={d.testimonials[0]} index={num()} />
      </main>

      <Footer s={s} socials={d.socials} />
      <GlobalCtas
        whatsapp={s.whatsappNumber}
        ownerFirstName={s.ownerName.split(" ")[0]}
        bookHref={bookHref}
        bookExternal={bookExternal}
        proof={proof}
        availability={s.availabilityStatus}
      />
      <Analytics gaId={s.googleAnalyticsId} pixelId={s.metaPixelId} />
    </VideoModalProvider>
  );
}
