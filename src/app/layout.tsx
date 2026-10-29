import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/providers";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

// next/font self-hosts + preloads fonts, so there's no layout shift.
const display = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-serif-italic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0F" },
    { media: "(prefers-color-scheme: light)", color: "#FAFAF7" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <head>
        {/* Marks JS as available before first paint so scroll-reveal styles apply without flashing.
            Without JS, every section stays fully visible. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
