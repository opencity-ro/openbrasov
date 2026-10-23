import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HeroMap } from "@/components/landing/hero-map";
import { Marked } from "@/components/landing/marked";
import { Reveal } from "@/components/landing/reveal";
import { reportIconUrl } from "@/components/map/report-icons";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";
import { categoryColor, categoryLabel, type ReportCategory } from "@/lib/reports/categories";

/**
 * Pagina de pornire: două priveliști, nimic de citit pe derulate.
 *
 * Prima e orașul, pe toată lățimea, cu tiparul peste el și cu o cheie de citire
 * care aprinde semnele unei categorii când treci peste ea. Harta nu e fundal
 * decorativ: e produsul, iar cheia o dovedește.
 *
 * A doua e indexul categoriilor, scris ca un cuprins: șase domenii numerotate,
 * fiecare cu rândurile lui. Lista întreagă e singurul argument care nu se poate
 * scrie din cuvinte, iar ca cuprins se parcurge, nu se îndură.
 *
 * Nimic nu se mișcă la derulare.
 */

/** Domeniile indexului, în ordinea în care se gândește omul la oraș. */
const DOMAINS: { key: keyof typeof t.home.categoryGroups; items: ReportCategory[] }[] = [
  {
    key: "road",
    items: [
      "pothole",
      "sidewalk",
      "crosswalk_marking",
      "road_marking",
      "traffic_light",
      "signage",
      "speed_bump_request",
      "public_transport",
      "accessibility",
    ],
  },
  {
    key: "parking",
    items: [
      "illegal_parking_road",
      "illegal_parking_sidewalk",
      "bollards",
      "illegal_scooter_parking",
      "abandoned_vehicle",
    ],
  },
  {
    key: "clean",
    items: [
      "illegal_dumping",
      "waste_collection",
      "unsanitary_land",
      "air_quality",
      "noise",
      "green_space",
      "park",
    ],
  },
  {
    key: "order",
    items: [
      "vandalism",
      "illegal_construction",
      "public_space_occupation",
      "illegal_street_vending",
      "commercial_space",
      "heritage",
    ],
  },
  { key: "animals", items: ["stray_animal", "wildlife", "rodents", "insects"] },
  { key: "utilities", items: ["street_lighting", "water_or_heating", "other"] },
];

export function Masthead() {
  const lines = t.home.title
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <section className="relative isolate overflow-hidden">
      <HeroMap />

      <div className="relative mx-auto grid min-h-[clamp(32rem,84vh,48rem)] max-w-6xl content-center px-4 py-16 sm:px-6 lg:py-20">
        <Reveal trigger="load" className="max-w-2xl">
          <h1 className="font-display text-[2.6rem] leading-[1.08] font-medium tracking-[-0.02em] sm:text-[3.5rem] lg:text-[4.25rem]">
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
    </section>
  );
}

export function CategoryIndex() {
  return (
    <section className="border-border bg-card border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <div>
            <h2 className="font-display text-2xl font-medium tracking-[-0.025em] sm:text-[2.25rem]">
              {t.home.indexTitle}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-md leading-relaxed">
              {t.home.indexBody}
            </p>
          </div>
          <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
            {t.home.indexNote}
          </p>
        </Reveal>

        {/*
         * Cuprins, nu grămadă de plăcuțe: șase domenii numerotate, fiecare cu
         * rândurile lui și cu numărul lor. Numele categoriei se vede, fiindcă
         * jumătate din ele nu se ghicesc dintr-o iconiță.
         */}
        <div className="border-border divide-border mt-10 grid divide-y border-t sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">
          {DOMAINS.map((domain, index) => (
            <Reveal key={domain.key} delay={index * 0.05}>
              <section className="border-border h-full py-7 sm:px-7 sm:py-8 sm:first:pl-0 lg:border-l lg:first:border-l-0 lg:[&:nth-child(4)]:border-l-0">
                <header className="flex items-baseline gap-3">
                  <span className="text-primary font-mono text-[0.625rem] tracking-[0.18em] tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-semibold">{t.home.categoryGroups[domain.key]}</h3>
                  <span className="text-muted-foreground ml-auto font-mono text-[0.625rem] tabular-nums">
                    {domain.items.length}
                  </span>
                </header>

                <ul className="mt-4 space-y-0.5">
                  {domain.items.map((category) => (
                    <li key={category}>
                      <Link
                        href={`/harta?categorie=${category}`}
                        className="group hover:bg-background/60 focus-visible:ring-ring/50 -mx-2 flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <span
                          aria-hidden="true"
                          className="block size-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: categoryColor[category] }}
                        />
                        <Image
                          src={reportIconUrl(category)}
                          alt=""
                          width={18}
                          height={18}
                          className="size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110"
                        />
                        <span className="group-hover:text-foreground text-muted-foreground transition-colors">
                          {categoryLabel(category)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
