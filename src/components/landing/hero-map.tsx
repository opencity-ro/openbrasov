"use client";

import { useState } from "react";

import { CityMap } from "@/components/landing/city-map";
import { categoryColor, categoryLabel, type ReportCategory } from "@/lib/reports/categories";
import { cn } from "@/lib/utils";

/**
 * Harta eroului plus cheia ei de citire.
 *
 * Cheia nu e o legendă moartă: treci peste un rând și semnele categoriei alea se
 * ridică pe hartă, iar restul se retrag. E felul cel mai scurt de a arăta că
 * punctele colorate de pe hartă chiar înseamnă ceva, fără să scrii o frază
 * despre asta.
 *
 * Rândurile sunt butoane, deci merg și cu tastatura, nu doar cu mouse-ul.
 */

const KEY_CATEGORIES: ReportCategory[] = ["pothole", "green_space", "illegal_dumping"];

export function HeroMap() {
  const [highlight, setHighlight] = useState<ReportCategory | null>(null);

  return (
    <>
      <div className="absolute inset-0">
        <CityMap clearTextColumn highlight={highlight} />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(104deg,var(--background)_0%,var(--background)_24%,color-mix(in_oklch,var(--background),transparent_42%)_44%,transparent_74%)]"
      />
      <div
        aria-hidden="true"
        className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent"
      />

      <ul className="absolute right-6 bottom-8 hidden space-y-1 lg:block">
        {KEY_CATEGORIES.map((category) => {
          const on = highlight === category;
          return (
            <li key={category}>
              <button
                type="button"
                onPointerEnter={() => setHighlight(category)}
                onPointerLeave={() => setHighlight(null)}
                onFocus={() => setHighlight(category)}
                onBlur={() => setHighlight(null)}
                aria-pressed={on}
                className="focus-visible:ring-ring/50 flex w-full items-center justify-end gap-3 rounded px-1 py-1.5 focus-visible:ring-2 focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "font-mono text-[0.625rem] tracking-[0.14em] uppercase transition-colors duration-200",
                    on ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {categoryLabel(category)}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "bg-border block h-px transition-all duration-200",
                    on ? "w-12" : "w-8",
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "block size-2.5 rounded-full ring-2 transition-transform duration-200",
                    on ? "scale-125 ring-white" : "ring-white/70",
                  )}
                  style={{ backgroundColor: categoryColor[category] }}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
