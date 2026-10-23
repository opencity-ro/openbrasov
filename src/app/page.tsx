import { GithubIcon } from "@/components/icons/github";
import { Hero } from "@/components/landing/hero";
import { ReportCategories } from "@/components/landing/report-categories";
import { Reveal } from "@/components/landing/reveal";
import { Statement } from "@/components/landing/statement";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="continut" className="flex-1">
        <Hero />

        <section className="border-border border-y">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <Statement text={t.home.statement} />
          </div>
        </section>

        {/*
         * Pașii, ca un parcurs pe o linie, nu ca trei cutii alăturate. Cutiile ar
         * fi spus că sunt trei lucruri independente; linia spune că e unul singur,
         * cu trei opriri.
         */}
        <section className="bg-card border-border border-b">
          <div className="mx-auto max-w-6xl px-4 py-18 sm:px-6 sm:py-24">
            <Reveal>
              <h2 className="font-display text-3xl font-medium tracking-[-0.025em] sm:text-[2.5rem]">
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
                  <li className="group relative">
                    <span className="bg-primary text-primary-foreground ring-card relative flex size-10 items-center justify-center rounded-full text-sm font-bold tabular-nums ring-8 transition-transform duration-300 group-hover:scale-110">
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
            <h2 className="font-display text-3xl font-medium tracking-[-0.025em] sm:text-[2.5rem]">
              {t.home.categoriesTitle}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
              {t.home.categoriesBody}
            </p>
          </Reveal>
          <div className="mt-12">
            <ReportCategories />
          </div>
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
              <Button
                asChild
                size="xl"
                variant="outline"
                className="self-start transition-transform duration-200 hover:-translate-y-0.5 lg:self-auto"
              >
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
