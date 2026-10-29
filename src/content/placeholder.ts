/**
 * Realistic placeholder content.
 * - `prisma/seed.ts` writes this into the database on first setup.
 * - `src/lib/data.ts` falls back to it if the database is empty/unreachable
 *   during a build, so the site never deploys blank.
 *
 * Every value here is editable from the dashboard. Placeholder videos are
 * Creative-Commons Blender Foundation films — replace them with Mercy's work.
 */

// Blender open movies (CC-BY) used as stand-in YouTube videos.
const YT = {
  bunny: "aqz-KE-bpKQ",
  sintel: "eRsGyueVLvQ",
  steel: "R6MlUcmOul8",
  spring: "WhWc3b3KhnY",
};
// Sintel has no maxres thumbnail on YouTube, so it falls back to hqdefault.
export const placeholderThumb = (id: string) =>
  `https://i.ytimg.com/vi/${id}/${id === YT.sintel ? "hqdefault" : "maxresdefault"}.jpg`;
const thumb = placeholderThumb;

export const placeholderSettings = {
  brandName: "MOA",
  ownerName: "Mercy Oluwatosin Adedayo",
  role: "Video Editor & Motion Designer",
  tagline: "Edits that keep viewers watching and clients growing.",
  heroHeadline: "Mercy Adedayo",
  heroSubheadline:
    "Hook-first edits with tight pacing, sound design and motion graphics, so viewers watch to the end and your channel or campaign grows.",
  rotatingWords: ["YouTube videos", "Reels & Shorts", "Commercials", "Music videos"],
  trustLine: "Trusted by 40+ creators and brands · 25M+ views delivered",
  availabilityStatus: "Available for new projects",
  availableFrom: "Booking projects from December",
  location: "Lagos, Nigeria",
  timezone: "Africa/Lagos",
  email: "adedayomercy111@gmail.com",
  whatsappNumber: "+234 903 717 8317",
  calendlyUrl: "https://calendly.com/your-handle/consultation",
  replyTime: "I reply within 24 hours",
  happyClients: 40,
  heroVideoUrl: "",
  heroPosterUrl: thumb(YT.steel),
  showreelUrl: `https://www.youtube.com/watch?v=${YT.bunny}`,
  showreelThumbnailUrl: thumb(YT.bunny),
  logoLightUrl: "",
  logoDarkUrl: "",
  portraitUrl: "/images/adedayo-mercy.jpg",
  portraitAlt: "Portrait of Mercy Oluwatosin Adedayo, video editor and motion designer, arms crossed in a black, white and green patterned top",
  aboutHeading: "I turn raw footage into stories people finish watching.",
  aboutText:
    "I'm Mercy, a video editor and motion designer based in Lagos. For the past 3 years I've helped creators, brands and agencies turn hours of footage into videos people actually finish.\n\nI started cutting music videos for friends, then grew into YouTube channels and brand campaigns. Today I focus on pacing, sound design and motion graphics that make every second earn its place.\n\nYou get clear timelines, honest feedback and edits built around one goal: results on your channel or campaign.",
  softwareTools: ["Premiere Pro", "After Effects", "DaVinci Resolve", "CapCut", "Photoshop", "Audition"],
  yearsExperience: 3,
  seoTitle: "Mercy Adedayo (MOA) | Video Editor in Lagos, Nigeria",
  seoDescription:
    "Mercy Oluwatosin Adedayo is a professional video editor helping creators and brands grow with engaging YouTube videos, reels and ads. See work and book a call.",
  ogImageUrl: "",
  googleSiteVerification: "",
  googleAnalyticsId: "",
  metaPixelId: "",
  leadMagnetTitle: "Free guide: 7 editing tricks that double watch time",
  leadMagnetUrl: "https://example.com/watch-time-guide.pdf",
};

export const placeholderCategories = [
  { name: "YouTube", slug: "youtube", order: 0 },
  { name: "Reels & Shorts", slug: "reels", order: 1 },
  { name: "Commercials", slug: "commercials", order: 2 },
  { name: "Music Videos", slug: "music-videos", order: 3 },
];

type SocialSeed = { platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "VIMEO"; url: string; viewCount: string };

export const placeholderProjects: Array<{
  title: string;
  slug: string;
  client: string;
  categorySlug: string;
  description: string;
  role: string;
  tools: string[];
  resultMetric: string;
  videoId: string;
  orientation: "LANDSCAPE" | "PORTRAIT";
  featured: boolean;
  isCaseStudy?: boolean;
  challenge?: string;
  approach?: string;
  results?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  socialLinks?: SocialSeed[];
}> = [
  {
    title: "The 30-Day Business Challenge",
    slug: "30-day-business-challenge",
    client: "Tolu Builds (YouTube)",
    categorySlug: "youtube",
    description:
      "A 22-minute documentary-style YouTube episode following a creator launching a business in 30 days. Tight pacing, animated data callouts and a cold open designed to hook viewers in the first 10 seconds.",
    role: "Lead editor, motion graphics, sound design",
    tools: ["Premiere Pro", "After Effects", "Audition"],
    resultMetric: "+68% average view duration",
    videoId: YT.steel,
    orientation: "LANDSCAPE",
    featured: true,
    isCaseStudy: true,
    challenge:
      "The channel had strong ideas but viewers dropped off in the first minute. Average view duration sat at 31% and new uploads stalled at 20K views.",
    approach:
      "I rebuilt the intro as a 10-second cold open, cut dead air with J-cuts, added animated stat callouts and re-graded the footage for a warmer, cinematic look.",
    results:
      "Average view duration rose from 31% to 52%. The episode passed 1.2M views in six weeks and the channel gained 48K subscribers.",
    beforeImageUrl: "/placeholders/before.svg",
    afterImageUrl: "/placeholders/after.svg",
    socialLinks: [{ platform: "INSTAGRAM", url: "https://www.instagram.com/", viewCount: "120K views" }],
  },
  {
    title: "Glow Skincare Launch Ad",
    slug: "glow-skincare-launch-ad",
    client: "Glow Naturals",
    categorySlug: "commercials",
    description:
      "A 45-second product launch commercial for a skincare brand, cut for YouTube pre-roll with 15-second and 6-second variants for paid social.",
    role: "Editor, colourist, motion design",
    tools: ["DaVinci Resolve", "After Effects"],
    resultMetric: "3.4x return on ad spend",
    videoId: YT.spring,
    orientation: "LANDSCAPE",
    featured: true,
    isCaseStudy: true,
    challenge:
      "The brand had beautiful footage but no clear story. Previous ads explained ingredients instead of showing results, and paid campaigns underperformed.",
    approach:
      "I restructured the ad around one customer's morning routine, added kinetic product typography and delivered three cut-downs for each ad placement.",
    results:
      "The campaign hit a 3.4x return on ad spend, cut cost per click by 41% and sold out the first production run in nine days.",
    beforeImageUrl: "/placeholders/before.svg",
    afterImageUrl: "/placeholders/after.svg",
  },
  {
    title: "Afrobeats Single — “Lagos Nights”",
    slug: "lagos-nights-music-video",
    client: "Kemi Ade",
    categorySlug: "music-videos",
    description:
      "A performance and story music video edited to the beat, with speed ramps, light leaks and a teal-and-orange grade built for the artist's brand.",
    role: "Editor & colourist",
    tools: ["Premiere Pro", "DaVinci Resolve"],
    resultMetric: "2.1M views in 30 days",
    videoId: YT.sintel,
    orientation: "LANDSCAPE",
    featured: true,
    socialLinks: [
      { platform: "INSTAGRAM", url: "https://www.instagram.com/", viewCount: "340K views" },
      { platform: "TIKTOK", url: "https://www.tiktok.com/", viewCount: "1.1M views" },
    ],
  },
  {
    title: "Morning Routine Reel Series",
    slug: "morning-routine-reels",
    client: "FitWithDami",
    categorySlug: "reels",
    description:
      "A batch of 12 vertical reels with animated captions, sound-synced cuts and hooks tested for the first two seconds of every clip.",
    role: "Short-form editor, caption design",
    tools: ["CapCut", "After Effects"],
    resultMetric: "+22K followers in 2 months",
    videoId: YT.bunny,
    orientation: "PORTRAIT",
    featured: true,
    socialLinks: [{ platform: "INSTAGRAM", url: "https://www.instagram.com/", viewCount: "860K views" }],
  },
  {
    title: "Fintech App Explainer",
    slug: "fintech-app-explainer",
    client: "PayLite (via Studio North agency)",
    categorySlug: "commercials",
    description:
      "A 90-second explainer mixing live action with animated UI walkthroughs, so first-time users understand the app in under a minute.",
    role: "Motion designer & editor",
    tools: ["After Effects", "Premiere Pro", "Illustrator"],
    resultMetric: "+35% app sign-up rate",
    videoId: YT.steel,
    orientation: "LANDSCAPE",
    featured: false,
  },
  {
    title: "Street Food Tour Shorts",
    slug: "street-food-shorts",
    client: "Chops & Chill",
    categorySlug: "reels",
    description:
      "Fast-paced YouTube Shorts from a Lagos street food tour, with punchy sound design and on-screen prices to keep viewers swiping back.",
    role: "Short-form editor",
    tools: ["Premiere Pro", "CapCut"],
    resultMetric: "4.6M combined views",
    videoId: YT.spring,
    orientation: "PORTRAIT",
    featured: false,
    socialLinks: [{ platform: "TIKTOK", url: "https://www.tiktok.com/", viewCount: "2.3M views" }],
  },
  {
    title: "Tech Review: Budget Phones 2026",
    slug: "budget-phones-review",
    client: "GadgetHub NG",
    categorySlug: "youtube",
    description:
      "A long-form tech review with clean comparison graphics, B-roll sequences and chapter markers that lift search traffic.",
    role: "Editor, thumbnail design",
    tools: ["Premiere Pro", "Photoshop"],
    resultMetric: "9.8% click-through rate",
    videoId: YT.sintel,
    orientation: "LANDSCAPE",
    featured: false,
  },
  {
    title: "Wedding Highlight Film",
    slug: "wedding-highlight-film",
    client: "Ife & Seun",
    categorySlug: "music-videos",
    description:
      "A four-minute cinematic wedding highlight, cut to an original score with vows layered over the most emotional moments.",
    role: "Editor & colourist",
    tools: ["DaVinci Resolve"],
    resultMetric: "Delivered in 5 days",
    videoId: YT.bunny,
    orientation: "LANDSCAPE",
    featured: false,
  },
];

export const placeholderServices = [
  {
    title: "YouTube Video Editing",
    description:
      "Long-form edits built for retention: strong hooks, tight pacing, B-roll, captions and sound design that keep viewers to the end.",
    deliverables: ["Cold open hook", "Pacing & jump cuts", "B-roll + graphics", "Colour grade", "Sound design", "Chapters"],
    turnaround: "3–5 days",
    startingPrice: "From $150 / video",
    icon: "youtube",
  },
  {
    title: "Short-form Reels & Shorts",
    description:
      "Vertical videos for Instagram, TikTok and YouTube Shorts with animated captions and hooks in the first two seconds.",
    deliverables: ["9:16 edit", "Animated captions", "Trending audio sync", "3 hook variations"],
    turnaround: "24–48 hours",
    startingPrice: "From $40 / reel",
    icon: "phone",
  },
  {
    title: "Commercials & Brand Ads",
    description:
      "Product launches and paid-social ads with cut-downs for every placement, so one shoot powers a whole campaign.",
    deliverables: ["Hero ad (30–60s)", "15s + 6s cut-downs", "Kinetic typography", "Licensed music"],
    turnaround: "5–7 days",
    startingPrice: "From $400 / campaign",
    icon: "megaphone",
  },
  {
    title: "Music Videos",
    description:
      "Beat-synced edits, speed ramps and a signature colour grade that matches the artist's sound and brand.",
    deliverables: ["Performance + story edit", "Colour grade", "VFX touch-ups", "Vertical teaser"],
    turnaround: "7–10 days",
    startingPrice: "From $350 / video",
    icon: "music",
  },
  {
    title: "Motion Graphics",
    description:
      "Animated titles, lower thirds, logo reveals and explainer animations that make complex ideas easy to follow.",
    deliverables: ["Logo animation", "Lower thirds pack", "Explainer scenes", "Source files"],
    turnaround: "3–7 days",
    startingPrice: "From $120",
    icon: "spark",
  },
];

export const placeholderPricing = [
  {
    name: "Starter",
    price: "$150",
    features: ["1 YouTube video (up to 12 min)", "Captions & basic graphics", "Royalty-free music", "1080p export"],
    revisions: "2 revisions",
    turnaround: "5 days",
    isPopular: false,
    ctaLabel: "Start with Starter",
  },
  {
    name: "Growth",
    price: "$550 / month",
    features: [
      "4 YouTube videos per month",
      "8 Shorts or reels",
      "Thumbnail design",
      "Motion graphics & sound design",
      "Priority support on WhatsApp",
    ],
    revisions: "3 revisions per video",
    turnaround: "3–4 days",
    isPopular: true,
    ctaLabel: "Book a Growth call",
  },
  {
    name: "Brand Campaign",
    price: "From $1,200",
    features: ["Hero commercial + cut-downs", "Colour grade & sound mix", "Motion design package", "4K delivery + source files"],
    revisions: "Unlimited within scope",
    turnaround: "7–10 days",
    isPopular: false,
    ctaLabel: "Plan a campaign",
  },
];

export const placeholderTestimonials = [
  {
    name: "Tolu Bakare",
    role: "Creator",
    company: "Tolu Builds · 310K subscribers",
    quote:
      "Mercy changed my channel. My retention jumped within two uploads and she just gets my style. I don't even send notes anymore.",
    rating: 5,
  },
  {
    name: "Adaeze Okafor",
    role: "Marketing Lead",
    company: "Glow Naturals",
    quote:
      "Our launch ad outperformed everything we'd run before. Fast, organised and the cut-downs saved us a second shoot.",
    rating: 5,
  },
  {
    name: "Daniel Mensah",
    role: "Creative Director",
    company: "Studio North Agency",
    quote:
      "We hand Mercy our hardest motion briefs. She meets every deadline and the quality makes us look good to our clients.",
    rating: 5,
  },
  {
    name: "Kemi Ade",
    role: "Recording Artist",
    company: "Lagos Nights",
    quote: "She edited my music video exactly how I pictured it, and the grade is now part of my brand.",
    rating: 5,
  },
];

export const placeholderFaqs = [
  {
    question: "How do I send you my footage?",
    answer:
      "Upload your files to Google Drive, Dropbox or WeTransfer and share the link. For large shoots I can send you a dedicated upload folder.",
  },
  {
    question: "How long does an edit take?",
    answer:
      "Reels take 24–48 hours, YouTube videos 3–5 days and commercials 5–7 days. Rush delivery is available when my schedule allows.",
  },
  {
    question: "How many revisions do I get?",
    answer:
      "Every package includes revisions (listed on each plan). Most clients approve after the first round because we agree on style before I start.",
  },
  {
    question: "Do you work with international clients?",
    answer:
      "Yes. Most of my clients are in the US, UK and Canada. I work across time zones and accept payment via Wise, PayPal or bank transfer.",
  },
  {
    question: "Can you match my existing style?",
    answer:
      "Absolutely. Send two or three videos you love and I'll build a style guide for your channel, including fonts, captions, music and pacing.",
  },
  {
    question: "What do you need to get started?",
    answer:
      "Book a free 15-minute call, share your footage and goals, and I'll send a quote and timeline within 24 hours.",
  },
];

export const placeholderStats = [
  { label: "Projects delivered", value: 250, suffix: "+" },
  { label: "Views generated", value: 25, suffix: "M+" },
  { label: "Happy clients", value: 40, suffix: "+" },
  { label: "Years editing", value: 3, suffix: "" },
];

export const placeholderLogos = [
  { name: "Glow Naturals", logoUrl: "/placeholders/logos/glow.svg" },
  { name: "Studio North", logoUrl: "/placeholders/logos/studio-north.svg" },
  { name: "PayLite", logoUrl: "/placeholders/logos/paylite.svg" },
  { name: "GadgetHub", logoUrl: "/placeholders/logos/gadgethub.svg" },
  { name: "Chops & Chill", logoUrl: "/placeholders/logos/chops.svg" },
  { name: "Tolu Builds", logoUrl: "/placeholders/logos/tolu.svg" },
];

export const placeholderSocials = [
  { platform: "instagram", url: "https://www.instagram.com/", handle: "@mercyedits" },
  { platform: "youtube", url: "https://www.youtube.com/", handle: "@mercyedits" },
  { platform: "tiktok", url: "https://www.tiktok.com/", handle: "@mercyedits" },
  { platform: "linkedin", url: "https://www.linkedin.com/", handle: "Mercy Adedayo" },
  { platform: "x", url: "https://x.com/", handle: "@mercyedits" },
];

export const placeholderProcess = [
  { title: "Discovery call", description: "A free 15-minute call to understand your goals, audience and style.", icon: "phone" },
  { title: "Footage & brief", description: "You share footage and references. I send a clear timeline and quote.", icon: "folder" },
  { title: "First cut", description: "I deliver the first edit with pacing, music and graphics in place.", icon: "scissors" },
  { title: "Revisions", description: "You leave time-stamped notes. I refine until it feels right.", icon: "refresh" },
  { title: "Final delivery", description: "Exports for every platform, plus thumbnails or cut-downs if included.", icon: "rocket" },
];

export const placeholderPainPoints = [
  {
    problem: "Viewers click away in the first 30 seconds.",
    solution: "Hook-first edits: a cold open, tight pacing and no dead air, so viewers stay to the end.",
  },
  {
    problem: "Editing eats the time you should spend creating.",
    solution: "Send footage, get a finished video. You keep filming while I handle the timeline.",
  },
  {
    problem: "Freelancers miss deadlines and need constant hand-holding.",
    solution: "Clear timelines, WhatsApp updates and on-time delivery on 98% of projects.",
  },
  {
    problem: "Your videos look like everyone else's.",
    solution: "A custom style guide, colour grade and motion graphics that make your brand recognisable.",
  },
];

export const placeholderGallery = [
  { title: "Colour grade still", caption: "Teal-and-orange grade from a music video.", imageUrl: thumb(YT.sintel), altText: "Cinematic colour-graded still of a character in snow", category: "Stills" },
  { title: "Sci-fi grade", caption: "Cool-toned grade for a short film.", imageUrl: thumb(YT.steel), altText: "Futuristic city still with a cool blue colour grade", category: "Stills" },
  { title: "Thumbnail concept", caption: "High-contrast YouTube thumbnail design.", imageUrl: thumb(YT.bunny), altText: "Bright animated YouTube thumbnail with a large character", category: "Thumbnails" },
  { title: "Spring poster", caption: "Poster frame for an animated short.", imageUrl: thumb(YT.spring), altText: "Animated character in a misty mountain landscape", category: "Posters" },
  { title: "On set", caption: "Behind the scenes of a commercial shoot.", imageUrl: thumb(YT.steel), altText: "Behind-the-scenes still from a commercial shoot", category: "Behind the Scenes" },
  { title: "Edit bay", caption: "The timeline for a 22-minute episode.", imageUrl: thumb(YT.sintel), altText: "Editing timeline still from a long-form episode", category: "Behind the Scenes" },
];
