import type { Metadata } from "next";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { t } from "@/lib/messages";

export const metadata: Metadata = { title: t.legal.termsTitle };

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.01em]">{t.legal.termsTitle}</h1>
        <p className="text-muted-foreground mt-4">{t.legal.draft}</p>
      </main>
      <SiteFooter />
    </>
  );
}
