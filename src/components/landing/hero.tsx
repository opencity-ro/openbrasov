"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";

import { CityMap } from "@/components/landing/city-map";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

/**
 * Eroul: orașul ocupă toată secțiunea, textul stă peste el.
 *
 * Harta nu e o ilustrație așezată lângă titlu, ci pământul pe care stă pagina. Un
 * voal pleacă din stânga și se stinge spre dreapta, deci literele au contrastul
 * lor fără ca orașul să fie acoperit; partea din dreapta rămâne curată, cu semnele
 * vizibile și apăsabile.
 *
 * Jos, o bandă cu trei lucruri adevărate despre produs. Nu sunt cifre de creștere
 * și nu sunt promisiuni: sunt fapte care se pot verifica deschizând harta.
 */

const lift = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const lines = t.home.title
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: lift },
  });

  return (
    <section className="relative isolate flex min-h-[clamp(36rem,90vh,54rem)] flex-col overflow-hidden">
      <div className="absolute inset-0">
        <CityMap />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,var(--background)_0%,var(--background)_22%,color-mix(in_oklch,var(--background),transparent_30%)_44%,transparent_80%)]"
      />
      <div
        aria-hidden="true"
        className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t to-transparent"
      />

      <div className="pointer-events-none relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 pt-24 pb-10 sm:px-6">
        <h1 className="font-display max-w-[15ch] text-[2.9rem] leading-[1.02] font-medium tracking-[-0.03em] sm:text-6xl lg:text-[4.75rem]">
          {lines.map((line, index) => (
            <span key={line} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, delay: 0.06 + index * 0.1, ease: lift }}
              >
                {line}.
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          {...rise(0.42)}
          className="text-muted-foreground mt-7 max-w-md text-lg leading-relaxed"
        >
          {t.home.subtitle}
        </motion.p>

        <motion.div {...rise(0.52)} className="pointer-events-auto mt-9 flex flex-wrap gap-3">
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
        </motion.div>
      </div>

      <motion.dl
        {...rise(0.66)}
        className="border-border/80 relative mx-auto grid w-full max-w-6xl grid-cols-1 border-t px-4 sm:grid-cols-3 sm:px-6"
      >
        {t.home.facts.map((fact) => (
          <div key={fact.label} className="flex items-baseline gap-3 py-5 sm:flex-col sm:gap-1">
            <dt className="font-display text-2xl leading-none font-medium tabular-nums sm:text-[1.75rem]">
              {fact.value}
            </dt>
            <dd className="text-muted-foreground text-sm leading-snug">{fact.label}</dd>
          </div>
        ))}
      </motion.dl>
    </section>
  );
}
