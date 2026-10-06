import { ImageResponse } from "next/og";

import { t } from "@/lib/messages";

export const alt = "Open Brașov";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Aceleași căi ca în `src/app/icon.svg`; cardul nu are acces la componente. */
const MARK =
  "M11 2H21A7 7 0 0 1 28 9V19A7 7 0 0 1 21 26L17.1 28.9A1.1 1.1 0 0 1 14.9 28.9L11 26A7 7 0 0 1 4 19V9A7 7 0 0 1 11 2ZM9.4 14a6.6 6.6 0 1 0 13.2 0a6.6 6.6 0 1 0-13.2 0";
const MARK_PIP = "M10.8 14a5.2 5.2 0 1 0 10.4 0a5.2 5.2 0 1 0-10.4 0";

/**
 * Cardul care pleacă în Facebook, WhatsApp și grupurile de cartier, adică primul
 * loc în care majoritatea oamenilor văd proiectul. Stă pe Onyx, nu pe alb: într-un
 * fir de conversație plin de capturi albe, pânza închisă se oprește la ochi.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 88,
        background: "#0d160b",
        color: "#e9efe6",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="44" height="44" viewBox="0 0 32 32">
          <path fill="#08a045" fillRule="evenodd" d={MARK} />
          <path fill="#d65108" d={MARK_PIP} />
        </svg>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.6 }}>{t.brand.name}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2.4 }}>
          {t.home.title}
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#9fb09b" }}>{t.brand.tagline}</div>
      </div>
      <div style={{ display: "flex", height: 6, width: 160, background: "#08a045" }} />
    </div>,
    size,
  );
}
