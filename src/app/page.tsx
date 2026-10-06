import Link from "next/link";

import { GithubIcon } from "@/components/icons/github";
import { LandingMapPreview } from "@/components/landing/map-preview";
import { ReportCategories } from "@/components/landing/report-categories";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";
import { listPublicReports } from "@/lib/reports/queries";

export default async function HomePage() {
  const reports = await listPublicReports();

  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-14 lg:pt-20 lg:pb-24">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-[-0.025em] text-balance sm:text-5xl lg:text-6xl">
              {t.home.title}
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-relaxed">
              {t.home.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="xl">
                <Link href="/harta">{t.home.ctaMap}</Link>
              </Button>
              <Button size="xl" variant="outline" disabled aria-disabled="true">
                {t.home.ctaReport}
                <span className="bg-pending text-pending-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                  {t.home.ctaReportSoon}
                </span>
              </Button>
            </div>
          </div>

          <div>
            <LandingMapPreview reports={reports} />
            {/* Datele sunt de probă, și scrie asta sub ele. O hartă plină care pare
                reală ar cumpăra încredere cu o minciună pe care o prinde oricine
                caută o sesizare anume. */}
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{t.home.mapSample}</p>
          </div>
        </section>

        <section className="border-border bg-card border-y">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
              {t.home.stepsTitle}
            </h2>
            <ol className="divide-border mt-8 divide-y">
              {t.home.steps.map((step, index) => {
                const state = "state" in step ? step.state : null;
                return (
                  <li
                    key={step.title}
                    className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[2rem_minmax(0,18rem)_minmax(0,1fr)] sm:py-7"
                  >
                    <span className="text-muted-foreground text-lg font-semibold tabular-nums">
                      {index + 1}
                    </span>
                    <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                      {step.title}
                      {state && (
                        <span className="bg-pending text-pending-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                          {state}
                        </span>
                      )}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{step.body}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
            {t.home.categoriesTitle}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            {t.home.categoriesBody}
          </p>
          <div className="mt-10">
            <ReportCategories />
          </div>
        </section>

        <section className="border-border bg-card border-t">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl">
                {t.home.openSourceTitle}
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                {t.home.openSourceBody}
              </p>
            </div>
            <Button asChild size="xl" variant="outline" className="self-start lg:self-auto">
              <a href="https://github.com/opencity-ro/openbrasov" target="_blank" rel="noreferrer">
                <GithubIcon />
                {t.home.openSourceCta}
              </a>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
