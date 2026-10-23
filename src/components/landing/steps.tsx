"use client";

import { motion, useReducedMotion } from "motion/react";

import { t } from "@/lib/messages";

/**
 * Cum funcționează: titlul rămâne agățat în stânga, pașii trec prin dreapta.
 *
 * Trei cutii alăturate ar fi spus că sunt trei lucruri independente. Aici e un
 * singur drum cu trei opriri, iar titlul care stă pe loc cât timp pașii se
 * derulează e chiar lucrul care o spune. Cifrele sunt mari și în serifă: ele
 * poartă ritmul, nu niște iconițe decorative.
 */
export function Steps() {
  const reduce = useReducedMotion();

  return (
    <section className="border-border border-b">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-3xl leading-[1.08] font-medium tracking-[-0.025em] text-balance sm:text-[2.75rem]">
            {t.home.stepsTitle}
          </h2>
        </div>

        <ol className="divide-border border-border divide-y border-t">
          {t.home.steps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 py-8 sm:gap-x-10 sm:py-10"
            >
              <span className="font-display text-muted-foreground/45 group-hover:text-primary text-4xl leading-none font-medium tabular-nums transition-colors duration-300 sm:text-5xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-semibold sm:text-2xl">{step.title}</h3>
                <p className="text-muted-foreground mt-3 max-w-xl leading-relaxed">{step.body}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
