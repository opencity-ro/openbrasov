import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        /**
         * Glifele hărții se schimbă doar când regenerăm fontul, iar atunci se
         * schimbă și calea. Fără antetul ăsta, fișierele din `public/` sunt
         * revalidate la fiecare încărcare a hărții.
         */
        source: "/map-fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
