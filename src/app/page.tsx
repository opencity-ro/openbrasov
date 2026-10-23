import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { GithubIcon } from "@/components/icons/github";
import { CategoriesWall } from "@/components/landing/categories-wall";
import { CityStage } from "@/components/landing/city-stage";
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
        <CityStage />

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <Reveal>
            <h2 className="font-display text-3xl leading-[1.08] font-medium tracking-[-0.025em] text-balance sm:text-[2.75rem]">
              {t.home.categoriesTitle}
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl text-lg leading-relaxed">
              {t.home.categoriesBody}
            </p>
          </Reveal>
          <Reveal delay={0.06} className="mt-10">
            <CategoriesWall />
          </Reveal>
        </section>

        {/*
         * Ultima bandă: o singură afirmație și un singur drum mai departe. Pagina
         * s-a terminat de explicat, deci aici nu mai are ce să adauge.
         */}
        <section className="border-border bg-card border-y">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:items-end lg:justify-between">
            <Reveal className="max-w-2xl">
              <h2 className="font-display text-3xl leading-[1.08] font-medium tracking-[-0.025em] text-balance sm:text-[2.75rem]">
                {t.home.finalTitle}
              </h2>
              <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
                {t.home.finalBody}
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <Button
                asChild
                size="xl"
                className="shadow-xl transition-transform duration-200 hover:-translate-y-0.5"
              >
                <Link href="/harta">
                  {t.home.ctaMap}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div>
                <h2 className="font-display text-2xl font-medium tracking-[-0.02em] sm:text-[1.75rem]">
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
