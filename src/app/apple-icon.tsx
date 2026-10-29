import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0B0F" }}>
        <svg width="96" height="96" viewBox="0 0 64 64">
          <path d="M20 12v40l32-20z" fill="#FF6B35" />
        </svg>
      </div>
    ),
    size,
  );
}
