import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Montserrat, Newsreader } from "next/font/google";

import { ThemeProvider } from "@/components/site/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

/** Interfața și textul: o singură voce, de la buton la paragraf. */
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-montserrat",
  display: "swap",
});

/**
 * Vocea de afiș, numai pe titluri. E croită pentru citit lung, deci la corp mare
 * are desenul așezat al unei pagini tipărite, nu zvâcul unui titlu de reclamă.
 * Lângă geometria lui Montserrat face contrastul care lipsea când tot ce scria pe
 * pagină era același sans îngroșat.
 *
 * Cursivul ei poartă cuvântul accentuat dintr-un titlu; nu amestecăm două familii
 * ca să scoatem un cuvânt în față.
 */
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

/**
 * Vocea tehnică: etichete, coduri, cifre, legende de planșă.
 *
 * Nu e un costum de „tehnologic" pus peste text obișnuit. Monospațiatul apare
 * exact acolo unde conținutul chiar e dată — o categorie, un număr, o licență —
 * și nicăieri altundeva. Cifrele ei au lățime egală, deci coloanele nu mai joacă.
 */
const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
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
    { media: "(prefers-color-scheme: light)", color: "#f6f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#14171a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ro"
      className={`${montserrat.variable} ${newsreader.variable} ${mono.variable} antialiased`}
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
