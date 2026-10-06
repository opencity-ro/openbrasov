import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";

import { ThemeProvider } from "@/components/site/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

/** Interfața și textul: o singură voce, de la buton la paragraf. */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

/**
 * Vocea de afiș, numai pe titlurile mari. Are talia mai largă și tăietura mai
 * apăsată decât Jakarta, deci un titlu scris cu ea se desparte de restul paginii
 * fără să urce în corp de literă. Pe interfață nu intră: acolo ar începe să strige.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { type: "website", locale: "ro_RO", siteName: "Open Brașov" },
  title: {
    default: "Open Brașov",
    template: "%s · Open Brașov",
  },
  description:
    "Platformă civică open source pentru Brașov: fotografiezi o problemă, AI-ul scrie sesizarea, instituția o primește.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0d160b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      className={`${jakarta.variable} ${bricolage.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-dvh flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
