import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CityMap } from "@/components/landing/city-map";
import { Marked } from "@/components/landing/marked";
import { Reveal } from "@/components/landing/reveal";
import { reportIconUrl } from "@/components/map/report-icons";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";
import {
  categoryColor,
  categoryLabel,
  REPORT_CATEGORIES,
  type ReportCategory,
} from "@/lib/reports/categories";

/**
 * Pagina de pornire: două priveliști, nimic de citit pe derulate.
 *
 * Prima e fișa orașului — tiparul pe stânga, planșa hărții ancorată jos-dreapta
 * și ieșind din cadru pe două laturi, cu o cheie de citire pe margine. Harta nu
 * stă ca fundal sub text și nici ca poză într-o ramă: e obiectul despre care e
 * vorba, așezat în pagină ca pe o masă.
 *
 * A doua e indexul: toate cele treizeci și patru de categorii, numai iconițele,
 * strânse într-o bandă. Lista întreagă e singurul argument care nu se poate scrie
 * din cuvinte, iar ca bandă de culoare se citește dintr-o privire.
 *
 * Nimic nu se mișcă la derulare. Ce ține pagina trează sunt tiparul, liniile,
 * vocea tehnică pe date și semnele care se ridică sub mouse.
 */

/** Cele trei categorii din cheia de citire, alese ca să acopere trei domenii. */
const KEY_CATEGORIES: ReportCategory[] = ["pothole", "green_space", "illegal_dumping"];

export function Masthead() {
  const lines = t.home.title
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section className="relative isolate overflow-hidden">
      {/*
       * Planșa: ancorată jos-dreapta și tăiată de marginile ecranului pe două
       * laturi. Un dreptunghi întreg, centrat, ar fi fost o ilustrație; tăiat, se
       * citește ca o bucată dintr-un oraș care continuă dincolo de pagină.
       */}
      <div className="pointer-events-none absolute inset-0 lg:left-[38%]">
        <div className="pointer-events-auto absolute inset-0 lg:top-14 lg:-right-24 lg:-bottom-20 lg:left-0">
          <CityMap clearTextColumn />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(104deg,var(--background)_0%,var(--background)_26%,color-mix(in_oklch,var(--background),transparent_40%)_44%,transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
      />

      <div className="relative mx-auto grid min-h-[clamp(32rem,82vh,46rem)] max-w-6xl content-center px-4 py-16 sm:px-6 lg:py-20">
        <Reveal trigger="load" className="max-w-2xl">
          <h1 className="font-display text-[2.75rem] leading-[0.96] font-medium tracking-[-0.038em] sm:text-[3.75rem] lg:text-[4.75rem]">
            {lines.map((line, index) => (
              <span key={line} className="block">
                {index === 1 ? (
                  <>
                    <Marked>AI-ul</Marked> scrie.
                  </>
                ) : (
                  `${line}.`
                )}
              </span>
            ))}
          </h1>

          <p className="text-muted-foreground mt-7 max-w-md text-lg leading-relaxed">
            {t.home.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="xl"
              className="transition-transform duration-200 hover:-translate-y-0.5"
            >
              <Link href="/harta">
                {t.home.ctaMap}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              disabled
              aria-disabled="true"
              className="bg-background/70 backdrop-blur"
            >
              {t.home.ctaReport}
              <span className="bg-pending text-pending-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                {t.home.ctaReportSoon}
              </span>
            </Button>
          </div>

          <ol className="mt-12 max-w-xl space-y-3.5">
            {t.home.steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="text-primary mt-[0.2rem] font-mono text-[0.625rem] tracking-[0.18em] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="leading-snug">
                  <span className="font-semibold">{step.title}.</span>{" "}
                  <span className="text-muted-foreground">{step.short}</span>
                </p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>

      {/*
       * Cheia de citire: trei semne de pe hartă, numite. Stă pe marginea de jos a
       * planșei, cu o linie care leagă fiecare rând de hartă, ca legenda unei fișe.
       */}
      <Reveal
        trigger="load"
        delay={0.2}
        className="pointer-events-none absolute right-6 bottom-8 hidden lg:block"
      >
        <ul className="space-y-2.5">
          {KEY_CATEGORIES.map((category) => (
            <li key={category} className="flex items-center justify-end gap-3">
              <span className="text-muted-foreground font-mono text-[0.625rem] tracking-[0.14em] uppercase">
                {categoryLabel(category)}
              </span>
              <span aria-hidden="true" className="bg-border block h-px w-8" />
              <span
                aria-hidden="true"
                className="block size-2.5 rounded-full ring-2 ring-white/80"
                style={{ backgroundColor: categoryColor[category] }}
              />
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

export function CategoryIndex() {
  return (
    <section className="border-border bg-card border-t">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <Reveal className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
          <h2 className="font-display text-2xl font-medium tracking-[-0.025em] sm:text-[2rem]">
            {t.home.indexTitle}
          </h2>
          <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
            {t.home.indexNote}
          </p>
        </Reveal>

        {/*
         * Numai iconițele, strânse. Cu eticheta lângă fiecare ar fi ieșit o listă
         * de treizeci și patru de rânduri, adică exact lucrul pe care nu-l citește
         * nimeni. Numele apare sub mouse și îl poartă cititorul de ecran.
         */}
        <Reveal delay={0.06}>
          <ul className="mt-9 flex flex-wrap gap-2">
            {REPORT_CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={`/harta?categorie=${category}`}
                  title={categoryLabel(category)}
                  className="group focus-visible:ring-ring/50 relative flex size-12 items-center justify-center rounded-lg transition-transform duration-200 hover:-translate-y-1 focus-visible:ring-3 focus-visible:outline-none sm:size-[3.25rem]"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${categoryColor[category]}, transparent 86%)`,
                  }}
                >
                  <span className="sr-only">{categoryLabel(category)}</span>
                  <Image
                    src={reportIconUrl(category)}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 transition-transform duration-200 group-hover:scale-110"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
