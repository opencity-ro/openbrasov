"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { reportIconUrl } from "@/components/map/report-icons";
import { t } from "@/lib/messages";
import { categoryColor, categoryLabel, type ReportCategory } from "@/lib/reports/categories";
import { cn } from "@/lib/utils";

/**
 * Ce poți raporta: toate categoriile, cu un filtru deasupra.
 *
 * Lista întreagă e argumentul, deci nu se taie. Dar treizeci și patru de plăcuțe
 * odată sunt un zid, așa că filtrul le împarte pe domeniile în care se gândește
 * omul la oraș, nu pe coloanele din baza de date. „Toate" rămâne starea de
 * pornire: cine vrea dovada o are din prima privire.
 *
 * Fiecare plăcuță duce la categoria ei pe hartă, deci secțiunea nu e o listă, e
 * un punct de plecare.
 */

type GroupKey = keyof typeof t.home.categoryGroups;

const GROUPS: { key: GroupKey; items: ReportCategory[] }[] = [
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

export function CategoriesWall() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<GroupKey | null>(null);
  const shown = active
    ? (GROUPS.find((group) => group.key === active)?.items ?? [])
    : GROUPS.flatMap((group) => group.items);

  const filters: { key: GroupKey | null; label: string }[] = [
    { key: null, label: t.home.categoriesAll },
    ...GROUPS.map((group) => ({ key: group.key, label: t.home.categoryGroups[group.key] })),
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t.home.categoriesTitle}>
        {filters.map((filter) => {
          const on = filter.key === active;
          return (
            <button
              key={filter.key ?? "all"}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(filter.key)}
              className={cn(
                "focus-visible:ring-ring/50 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:ring-3 focus-visible:outline-none",
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:border-foreground/25",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Înălțimea minimă ține pagina pe loc când filtrul lasă patru plăcuțe din
          treizeci și patru: fără ea, secțiunea se prăbușește sub degetul tău și
          restul paginii sare în sus. */}
      <motion.ul layout className="mt-8 flex min-h-[16rem] flex-wrap content-start gap-2.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((category) => (
            <motion.li
              key={category}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/harta?categorie=${category}`}
                className="group border-border bg-card hover:border-foreground/25 focus-visible:ring-ring/50 flex items-center gap-2.5 rounded-lg border py-2 pr-4 pl-2 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:outline-none"
              >
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-110"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${categoryColor[category]}, transparent 84%)`,
                  }}
                >
                  <Image src={reportIconUrl(category)} alt="" width={20} height={20} />
                </span>
                {categoryLabel(category)}
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
