import { ImageResponse } from "next/og";

import { t } from "@/lib/messages";

export const alt = "Open Brașov";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 96,
        background: "#fafaf7",
        color: "#14261d",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "#1b5e3b",
            display: "flex",
          }}
        />
        <div style={{ fontSize: 40, fontWeight: 700 }}>{t.brand.name}</div>
      </div>
      <div style={{ marginTop: 48, fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
        {t.home.title}
      </div>
      <div style={{ marginTop: 32, fontSize: 32, color: "#5b6b62" }}>{t.brand.tagline}</div>
    </div>,
    size,
  );
}
