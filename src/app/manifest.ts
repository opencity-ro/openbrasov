import type { MetadataRoute } from "next";

import { t } from "@/lib/messages";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: t.brand.name,
    short_name: t.brand.name,
    description: t.brand.tagline,
    start_url: "/harta",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#1b5e3b",
    lang: "ro",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
