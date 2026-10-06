import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";

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
 * Serifa stă doar pe afirmațiile mari, niciodată pe interfață. Un serviciu
 * public se citește altfel decât un produs: literele cu picior aduc registrul
 * de instituție, dar numai acolo unde chiar se face o afirmație.
 */
const sourceSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  variable: "--font-source-serif",
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
      className={`${jakarta.variable} ${sourceSerif.variable} antialiased`}
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
