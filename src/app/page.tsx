import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { GithubIcon } from "@/components/icons/github";
import { CityMap } from "@/components/landing/city-map";
import { ReportCategories } from "@/components/landing/report-categories";
import { Reveal } from "@/components/landing/reveal";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        {/*
         * Eroul: textul pe stânga, orașul pe dreapta, ieșind din container până în
         * marginea ecranului. O hartă oprită la aceeași linie cu textul ar fi fost
         * o ilustrație; una care trece dincolo de margine se citește ca o fereastră.
         */}
        <section className="overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:pt-20 lg:pb-24">
            <Reveal trigger="load" className="lg:col-span-5">
              <h1 className="font-display text-[2.9rem] leading-[1.02] font-medium tracking-[-0.025em] text-balance sm:text-6xl lg:text-[4.5rem]">
                {t.home.title}
              </h1>
              <p className="text-muted-foreground mt-7 max-w-md text-lg leading-relaxed">
                {t.home.subtitle}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button size="xl" variant="outline" disabled aria-disabled="true">
                  {t.home.ctaReport}
                  <span className="bg-pending text-pending-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                    {t.home.ctaReportSoon}
                  </span>
                </Button>
              </div>
            </Reveal>

            <Reveal
              trigger="load"
              delay={0.1}
              className="lg:col-span-7 lg:mr-[calc(50%-50vw)] lg:pl-4"
            >
              <div className="border-border relative h-[clamp(20rem,52vh,34rem)] overflow-hidden rounded-2xl border bg-[var(--map-canvas)] lg:rounded-r-none">
                <CityMap />
                {/* Acțiunea stă pe hartă, nu lângă ea: harta e lucrul la care te uiți
                    deja, iar butonul e pasul următor al aceleiași priviri. */}
                <Button asChild size="xl" className="absolute bottom-5 left-5 shadow-xl">
                  <Link href="/harta">
                    {t.home.ctaMap}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/*
         * Pașii, ca un parcurs pe o linie, nu ca trei cutii alăturate. Cutiile ar
         * fi spus că sunt trei lucruri independente; linia spune că e unul singur,
         * cu trei opriri.
         */}
        <section className="border-border bg-card border-y">
          <div className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-24">
            <Reveal>
              <h2 className="font-display text-3xl font-medium tracking-[-0.02em] sm:text-[2.5rem]">
                {t.home.stepsTitle}
              </h2>
            </Reveal>
            <ol className="relative mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              <span
                aria-hidden="true"
                className="bg-border absolute top-5 right-6 left-6 hidden h-px sm:block"
              />
              {t.home.steps.map((step, index) => (
                <Reveal key={step.title} delay={index * 0.08}>
                  <li className="relative">
                    <span className="bg-primary text-primary-foreground ring-card relative flex size-10 items-center justify-center rounded-full text-sm font-bold tabular-nums ring-8">
                      {index + 1}
                    </span>
                    <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground mt-2 leading-relaxed">{step.body}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-24">
          <Reveal>
            <h2 className="font-display text-3xl font-medium tracking-[-0.02em] sm:text-[2.5rem]">
              {t.home.categoriesTitle}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
              {t.home.categoriesBody}
            </p>
          </Reveal>
          <Reveal delay={0.08} className="mt-12">
            <ReportCategories />
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
          <Reveal>
            <div className="border-border bg-card flex flex-col gap-7 rounded-2xl border p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div>
                <h2 className="font-display text-2xl font-medium tracking-[-0.02em] sm:text-[2rem]">
                  {t.home.openSourceTitle}
                </h2>
                <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
                  {t.home.openSourceBody}
                </p>
              </div>
              <Button asChild size="xl" variant="outline" className="self-start lg:self-auto">
                <a
                  href="https://github.com/opencity-ro/openbrasov"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubIcon />
                  {t.home.openSourceCta}
                </a>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
