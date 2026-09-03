const FALLBACK_SITE_URL = "https://openbrasov.ro";

function withProtocol(host: string) {
  return /^https?:\/\//.test(host) ? host : `https://${host}`;
}

/**
 * Public origin of the site, used for metadataBase, sitemap and robots.
 *
 * The value must never be empty: `new URL("")` throws and takes the whole build
 * down. An unset `NEXT_PUBLIC_*` variable is inlined as an empty string at build
 * time, so blank values are treated the same as missing ones.
 */
export function resolveSiteUrl(env: Record<string, string | undefined> = process.env): string {
  const candidates = [
    env.NEXT_PUBLIC_SITE_URL,
    // Set automatically on Vercel; the production domain of the project.
    env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    // Deployment-specific URL, the only one available on preview builds.
    env.NEXT_PUBLIC_VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) return withProtocol(value);
  }

  return FALLBACK_SITE_URL;
}

export const SITE_URL = resolveSiteUrl();
