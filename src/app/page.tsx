import { Camera, Landmark, Sparkles } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

const stepIcons = [Camera, Sparkles, Landmark] as const;

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-primary text-sm font-semibold tracking-wide uppercase">
            {t.home.eyebrow}
          </p>
          <h1 className="font-heading mt-3 max-w-3xl text-4xl font-bold text-balance sm:text-6xl">
            {t.home.title}
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
            {t.home.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="xl">
              <Link href="/harta">{t.home.ctaMap}</Link>
            </Button>
            <Button size="xl" variant="accent" disabled aria-disabled="true">
              {t.home.ctaReport}
              <span className="bg-accent-foreground/10 rounded-full px-2 py-0.5 text-xs font-medium">
                {t.home.ctaReportSoon}
              </span>
            </Button>
          </div>
        </section>

        <section className="bg-card border-border border-y">
          <ol className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
            {t.home.steps.map((step, index) => {
              const Icon = stepIcons[index];
              return (
                <li key={step.title} className="flex flex-col gap-3">
                  <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h2 className="font-heading text-xl font-semibold">
                    {index + 1}. {step.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{step.body}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-heading text-2xl font-semibold">{t.home.openSourceTitle}</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            {t.home.openSourceBody}
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
