import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/harta`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/termeni`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    {
      url: `${SITE_URL}/confidentialitate`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
