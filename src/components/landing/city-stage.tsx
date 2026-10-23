"use client";

import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";

import { CityMap } from "@/components/landing/city-map";
import { Marked, Plate } from "@/components/landing/plate";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

/**
 * Scena: orașul rămâne pe ecran, camera se mișcă prin el, capitolele docheză peste.
 *
 * Pagina nu e un teanc de secțiuni cu aceeași hartă pusă undeva sus. Primele trei
 * ecrane sunt o singură scenă: harta stă agățată, iar derularea mută camera —
 * coboară spre oraș, se apleacă, se întoarce. Textul vine și pleacă peste ea.
 *
 * Agățarea e făcută cu `sticky`, nu cu un strat care fură derularea: pagina merge
 * mai departe exact cât ai dat din deget, se poate opri oricând și nu se blochează
 * dacă ceva nu s-a încărcat.
 *
 * Cu mișcarea redusă pornită, scena se desface singură în trei blocuri obișnuite,
 * unul sub altul, cu harta așezată în primul. Nimic nu depinde de derulare.
 */

const ease = [0.16, 1, 0.3, 1] as const;

export function CityStage() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  /**
   * Zborul camerei. Mișcările sunt mici dinadins: planul e desenat cu o margine
   * de siguranță în jurul cadrului, iar dacă o depășește, pe ecran intră pânza
   * goală a hărții — care, pe tema închisă, se confundă cu fundalul paginii și
   * pare că s-a stins ecranul.
   */
  const zoom = useTransform(p, [0, 0.45, 0.8, 1], [1, 1.32, 1.18, 1.04]);
  const panX = useTransform(p, [0, 0.45, 0.8, 1], [0, -64, 34, -12]);
  const panY = useTransform(p, [0, 0.45, 0.8, 1], [0, 38, -22, 10]);
  const tilt = useTransform(p, [0, 0.45, 0.8, 1], [40, 52, 45, 39]);
  const spin = useTransform(p, [0, 0.45, 0.8, 1], [-8, 0, -12, -6]);

  /* Capitolele se schimbă cap la cap: unul iese exact când intră următorul. */
  const oneOpacity = useTransform(p, [0, 0.18, 0.28], [1, 1, 0]);
  const oneY = useTransform(p, [0.18, 0.28], [0, -40]);
  const twoOpacity = useTransform(p, [0.26, 0.36, 0.58, 0.68], [0, 1, 1, 0]);
  const twoY = useTransform(p, [0.26, 0.36, 0.58, 0.68], [40, 0, 0, -40]);
  const threeOpacity = useTransform(p, [0.66, 0.76], [0, 1]);
  const threeY = useTransform(p, [0.66, 0.76], [40, 0]);

  const one = { opacity: oneOpacity, y: oneY };
  const two = { opacity: twoOpacity, y: twoY };
  const three = { opacity: threeOpacity, y: threeY };

  /** Cât din scenă a trecut, scris ca pe o fișă: 01 / 03. */
  const [chapterIndex, setChapterIndex] = useState("01");
  useMotionValueEvent(p, "change", (value) => {
    setChapterIndex(value < 0.3 ? "01" : value < 0.68 ? "02" : "03");
  });

  if (reduce) {
    return (
      <div className="border-border border-b">
        <div className="relative h-[70vh] overflow-hidden">
          <CityMap clearTextColumn />
        </div>
        <div className="mx-auto max-w-6xl space-y-16 px-4 py-20 sm:px-6">
          <ChapterOne />
          <ChapterTwo />
          <ChapterThree />
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 h-[100dvh] overflow-hidden">
        <div className="absolute inset-0">
          <CityMap camera={{ zoom, panX, panY, tilt, spin }} clearTextColumn />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,var(--background)_0%,var(--background)_34%,color-mix(in_oklch,var(--background),transparent_42%)_52%,transparent_80%)]"
        />
        <div
          aria-hidden="true"
          className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t to-transparent"
        />

        {/* Cadrul de vizor peste toată scena: colțare și două legende tehnice. */}
        <Plate
          className="absolute top-20 right-4 bottom-4 left-4 sm:top-24 sm:right-6 sm:bottom-6 sm:left-6"
          label={t.home.plateLabel}
          caption={t.home.plateCaption}
        />

        <span
          aria-hidden="true"
          className="text-muted-foreground absolute top-2.5 right-8 font-mono text-[0.6875rem] tracking-[0.14em] uppercase tabular-nums sm:top-4 sm:right-10"
        >
          {chapterIndex} / 03
        </span>

        <div className="pointer-events-none relative mx-auto flex h-full max-w-6xl items-center px-4 sm:px-10">
          <motion.div style={one} className="pointer-events-auto absolute max-w-2xl">
            <ChapterOne />
          </motion.div>
          <motion.div style={two} className="pointer-events-auto absolute max-w-2xl">
            <ChapterTwo />
          </motion.div>
          <motion.div style={three} className="pointer-events-auto absolute max-w-2xl">
            <ChapterThree />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ChapterOne() {
  const reduce = useReducedMotion();
  const lines = t.home.title
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div>
      <h1 className="font-display text-[2.9rem] leading-[0.98] font-medium tracking-[-0.035em] sm:text-[4.25rem] lg:text-[5.5rem]">
        {lines.map((line, index) => (
          <span key={line} className="block overflow-hidden pb-[0.1em]">
            <motion.span
              className="block"
              initial={reduce ? false : { y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.8, delay: 0.06 + index * 0.1, ease }}
            >
              {index === 1 ? (
                <>
                  <Marked>AI-ul</Marked> scrie.
                </>
              ) : (
                `${line}.`
              )}
            </motion.span>
          </span>
        ))}
      </h1>

      <p className="text-muted-foreground mt-8 max-w-md text-lg leading-relaxed">
        {t.home.subtitle}
      </p>

      <div className="mt-9 flex flex-wrap gap-3">
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

      <dl className="border-border/70 divide-border/70 mt-12 grid max-w-xl grid-cols-3 divide-x border-t">
        {t.home.facts.map((fact) => (
          <div key={fact.label} className="px-4 pt-5 first:pl-0 last:pr-0">
            <dt className="font-mono text-xl leading-none font-medium tabular-nums sm:text-2xl">
              {fact.value}
            </dt>
            <dd className="text-muted-foreground mt-2 font-mono text-[0.6875rem] leading-snug tracking-[0.08em] uppercase">
              {fact.label}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ChapterTwo() {
  return (
    <div>
      <h2 className="font-display text-3xl leading-[1.02] font-medium tracking-[-0.03em] sm:text-[3.25rem]">
        {t.home.stepsTitle}
      </h2>
      {/* Intrările atârnă de o linie verticală, ca pe o fișă numerotată. */}
      <ol className="border-border/70 mt-9 space-y-7 border-l pl-6 sm:pl-8">
        {t.home.steps.map((step, index) => (
          <li key={step.title} className="relative">
            <span
              aria-hidden="true"
              className="bg-primary absolute top-2.5 -left-[1.6rem] block h-px w-4 sm:-left-[2.1rem] sm:w-6"
            />
            <span className="text-primary font-mono text-[0.6875rem] tracking-[0.18em] uppercase">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display mt-1.5 text-2xl font-medium tracking-[-0.02em] sm:text-[1.75rem]">
              {step.title}
            </h3>
            <p className="text-muted-foreground mt-2 max-w-lg leading-relaxed">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ChapterThree() {
  return (
    <div>
      <p className="font-display text-[1.9rem] leading-[1.18] font-medium tracking-[-0.03em] text-balance sm:text-[3rem]">
        {t.home.statement}
      </p>
      <div className="mt-10">
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
      </div>
    </div>
  );
}
