import { ImageResponse } from "next/og";
import { getPublicData } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-static";
export const alt = "Mercy Oluwatosin Adedayo, Video Editor & Motion Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * 1200×630 social preview with name + role, regenerated whenever the owner
 * saves. If a custom OG image is uploaded in the dashboard, it's used instead.
 */
export default async function OgImage() {
  const { settings: s } = await getPublicData();

  if (s.ogImageUrl) {
    const src = s.ogImageUrl.startsWith("http") ? s.ogImageUrl : `${siteUrl()}${s.ogImageUrl}`;
    return new ImageResponse(
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" width={1200} height={630} style={{ width: "100%", height: "100%", objectFit: "cover" }} />,
      size,
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B0B0F",
          color: "#F4F4F5",
          padding: "64px 72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#A1A1AA", letterSpacing: 4 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: "#FF6B35" }} />
            <span>{s.brandName}</span>
          </span>
          <span>00:00:00:00</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>{s.ownerName}</div>
          <div style={{ fontSize: 52, color: "#FF6B35", marginTop: 20, fontWeight: 700 }}>{s.role}</div>
          <div style={{ display: "flex", fontSize: 30, color: "#A1A1AA", marginTop: 24 }}>
            {`YouTube · Reels · Commercials · Music Videos · ${s.location}`}
          </div>
        </div>
        <div style={{ display: "flex", height: 6, width: "100%", background: "#2A2A33" }}>
          <div style={{ width: "62%", background: "#FF6B35" }} />
        </div>
      </div>
    ),
    size,
  );
}
