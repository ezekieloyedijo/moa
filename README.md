# MOA: Mercy Oluwatosin Adedayo, Portfolio + Dashboard

A fast, animated portfolio for a video editor and motion designer, with a private dashboard for editing every word, image and video on the site without touching code.

- **Public site** (`/`): statically generated. Visitors never hit the database.
- **Dashboard** (`/admin`): owner-only. Saving rebuilds the public page within seconds.

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · GSAP + ScrollTrigger · Framer Motion · Lenis · next-themes · Prisma 6 + Neon Postgres · Vercel Blob (images only) · Auth.js v5 · Zod · Resend (optional)

---

## Folder structure

```
prisma/
  schema.prisma          Database models
  migrations/            SQL migrations (run by `prisma migrate deploy`)
  seed.ts                Fills every table with placeholder content
public/placeholders/     Placeholder portrait, logos, before/after images
scripts/hash-password.mjs
src/
  app/
    (site)/page.tsx      The public one-page portfolio (static)
    admin/               Dashboard: login, layout, pages, server actions
    api/                 Auth, Blob upload tokens, subscriber CSV export
    actions.ts           Public form actions (contact, newsletter)
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx …
  components/
    site/                Public sections (hero, work, gallery, contact…)
    admin/               Dashboard UI (resource manager, uploader, forms…)
  content/placeholder.ts Placeholder content (used by the seed + build fallback)
  lib/                   db, auth, data loading, validation, video parsing, upload
  middleware.ts          Protects /admin
```

---

## 1. Setup and deployment

### a. Create the Neon database
1. Sign up at [neon.tech](https://neon.tech) (free) and create a project. Pick the region closest to your Vercel region (e.g. `aws-us-east-1` for Vercel `iad1`).
2. Open **Dashboard → Connect**.
   - With **Connection pooling ON**, copy the string (its host contains `-pooler`). This is `DATABASE_URL`.
   - With **Connection pooling OFF**, copy the string. This is `DATABASE_URL_UNPOOLED`.
   - *Shortcut:* if you create the database from **Vercel → Storage → Neon** instead, Vercel adds both `DATABASE_URL` and `DATABASE_URL_UNPOOLED` to the project for you.

### b. Run locally
```bash
npm install
cp .env.example .env          # then fill in the values (see comments inside)
npx auth secret               # or: openssl rand -base64 32  → paste into AUTH_SECRET
npm run db:deploy             # creates the tables in Neon
npm run db:seed               # fills them with placeholder content + creates the admin user
npm run dev                   # http://localhost:3000  and  http://localhost:3000/admin
```
> For local image uploads you also need `BLOB_READ_WRITE_TOKEN` (step d). Everything else works without it.

### c. Push to GitHub and import into Vercel
1. Push this folder to a GitHub repository.
2. In [vercel.com](https://vercel.com) choose **Add New → Project**, import the repo and keep the defaults (framework: Next.js). Vercel automatically runs the `vercel-build` script, which applies migrations before building.

### d. Create the Vercel Blob store (images only)
Vercel project → **Storage → Create → Blob** → connect it to the project. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically. Copy it into your local `.env` too.

### e. Environment variables (Vercel → Settings → Environment Variables)
| Variable | Required | What it is |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon **pooled** connection string |
| `DATABASE_URL_UNPOOLED` | ✅ | Neon **direct** connection string (migrations). Added automatically by the Vercel Neon integration |
| `BLOB_READ_WRITE_TOKEN` | ✅ | Added automatically when you connect Blob |
| `AUTH_SECRET` | ✅ | Long random string |
| `ADMIN_EMAIL` | ✅ | The owner's login email |
| `ADMIN_PASSWORD_HASH` | ✅* | bcrypt hash from `npm run hash-password -- "password"` |
| `NEXT_PUBLIC_SITE_URL` | ✅ | e.g. `https://mercyadedayo.com` (no trailing slash) |
| `RESEND_API_KEY`, `NOTIFY_EMAIL`, `RESEND_FROM` | optional | "Forgot password" emails and alerts for new contact messages |

\* Not needed if you already created the admin by running the seed against the production database.

Then **Deployments → Redeploy**.

### f. Connect a custom domain
Vercel project → **Settings → Domains → Add** → follow the DNS instructions at your registrar (an `A` record to `76.76.21.21`, or a `CNAME` to `cname.vercel-dns.com`). Then update `NEXT_PUBLIC_SITE_URL` to the new domain and redeploy.

### g. Hero background video (optional)
Export a 10–15 second muted loop (720p, under 4MB, no audio), name it `hero.mp4`, put it in `/public`, then in **Dashboard → Settings & Hero → Background video** enter `/hero.mp4`. With [ffmpeg](https://ffmpeg.org):
```bash
ffmpeg -i reel.mov -t 12 -an -vf "scale=-2:720,fps=25" -c:v libx264 -crf 28 -preset slow -movflags +faststart public/hero.mp4
```
Phones, data-saver users and slow connections see the poster image only.

---

## 2. Creating the admin account and logging in

Pick **one** method:

- **Seed (easiest):** set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` and run `npm run db:seed` with `DATABASE_URL` pointing at the production database. Then delete `ADMIN_PASSWORD` from `.env`.
- **Env hash (no local setup):** run `npm run hash-password -- "your-strong-password"`, then paste the hash into `ADMIN_PASSWORD_HASH` on Vercel along with `ADMIN_EMAIL`. Your first successful login creates the account. (In a local `.env`, escape each `$` as `\$`; the script prints both versions.)

Log in at **`https://your-domain.com/admin`**. Change the password any time under **Account**. After 5 failed attempts in 15 minutes, login is locked for that IP and email until the window resets.

**Forgot password?** The login page links to `/admin/forgot`, which emails a single-use reset link (valid for 30 minutes). This needs `RESEND_API_KEY`. With the default sender (`onboarding@resend.dev`), Resend only delivers to the email address that owns the Resend account, so **sign up for Resend with the admin email** (or verify your own domain in Resend and set `RESEND_FROM`).

---

## 3. Owner guide: adding a project

1. **Upload the video to YouTube** (public or unlisted). For reels, upload as a **YouTube Short**. Vimeo, Instagram and TikTok links also work.
2. In the dashboard, go to **Projects → Add project**.
3. **Paste the video link.** The platform is detected, and the thumbnail, title and orientation (Shorts are vertical) are filled in automatically. Press the preview to check it plays.
4. **Add the details:** client, category, a 2–3 sentence description (Google reads this), your role, the tools, and a **result metric** (e.g. "+68% view duration").
5. *(Optional)* Upload a custom thumbnail (required for Instagram and TikTok videos) and add "Also on Instagram · 120K views" links.
6. *(Optional)* Turn on **Show as a case study** and fill in Challenge, Approach and Results, plus before/after images.
7. Keep **Published** on and click **Save & publish changes**. The live site updates in a few seconds.
8. Drag the ⋮⋮ handle in the list to change the order.

Everything else (hero text, services, prices, testimonials, FAQs, gallery, logos, SEO) works the same way from the sidebar.

---

## 4. Placeholder content to replace

- [ ] **Portrait** (Settings & Hero → About section). `public/placeholders/portrait.svg` is a silhouette.
- [ ] **Logo** (optional): upload light- and dark-mode versions, or keep the MOA wordmark.
- [ ] **Hero poster + background video** (currently a Blender film still).
- [ ] **Showreel link** (currently *Big Buck Bunny*).
- [ ] **All 8 projects.** The videos are Creative-Commons Blender films and the clients and metrics are invented.
- [ ] **Case study** text and before/after images.
- [ ] **Gallery** images.
- [ ] **Testimonials** (4 invented quotes), **client logos** (6 invented brands), **stats** (250+, 25M+, 40+, 6).
- [ ] **Email, WhatsApp number, Calendly link** (all placeholders).
- [ ] **Social links** (point to the platform home pages).
- [ ] **Services and pricing** amounts, turnaround times.
- [ ] **Trust line**, "Join 40+ happy clients" count, availability text.
- [ ] **Lead magnet** title and download link.
- [ ] **SEO** title/description and Google Search Console code.
- [ ] Delete the two sample messages in the inbox.

---

## 5. Submitting the site to Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console) → **Add property** → **URL prefix** → enter `https://your-domain.com`.
2. Choose **HTML tag** verification and copy only the `content="…"` value.
3. Paste it into **Dashboard → SEO & tracking → Google Search Console verification code** and save.
4. Back in Search Console, click **Verify**.
5. Open **Sitemaps** and submit `sitemap.xml`.
6. Use **URL Inspection** on the homepage → **Request indexing**.
7. Optionally test the structured data at [search.google.com/test/rich-results](https://search.google.com/test/rich-results).

Ranking for your name usually happens within days. Generic terms like "video editor Lagos" take longer and benefit from links from your social profiles and client channels.

---

## 6. Free-tier tips

- **Never upload videos to Blob.** Videos live on YouTube, Vimeo, Instagram or TikTok, and the site only stores the link. The uploader rejects non-images.
- Images are automatically **compressed to WebP (~200KB, 1600px max)** in the browser before upload. Very large originals are fine; they shrink first.
- Replaced or deleted images are **deleted from Blob automatically**, so storage doesn't fill with orphans.
- The public page is **static**: visitor traffic doesn't use database hours, so Neon can sleep. Only saves, logins and form submissions touch the database.
- Keep the hero MP4 under 4MB. It's served from `/public`, not Blob.
- Check usage now and then: **Vercel → Usage** (bandwidth, Blob storage, function invocations) and **Neon → Monitoring** (compute hours, storage).
- Resend's free tier covers ~100 emails/day, which is plenty for contact alerts.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run db:deploy` | Apply migrations |
| `npm run db:migrate` | Create a new migration after editing `schema.prisma` (dev) |
| `npm run db:seed` | Reset content tables to placeholder content (keeps the admin, messages, subscribers) |
| `npm run db:studio` | Browse the database |
| `npm run hash-password -- "pw"` | Generate `ADMIN_PASSWORD_HASH` |

> ⚠️ `db:seed` **replaces** all content (projects, services, etc.) with placeholders. Don't run it after the owner has started editing.
