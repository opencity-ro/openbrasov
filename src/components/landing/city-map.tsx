"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

import { reportIconUrl } from "@/components/map/report-icons";
import { categoryColor, categoryLabel, type ReportCategory } from "@/lib/reports/categories";
import { cn } from "@/lib/utils";

import {
  CITY_GREEN,
  CITY_MAJOR_ROADS,
  CITY_MINOR_ROADS,
  CITY_PINS,
  CITY_STREETS,
  CITY_VIEW_BOX,
  CITY_WATER,
  CITY_WATERWAY,
} from "./city-map-data";

/**
 * Harta orașului, desenată și înclinată.
 *
 * Geometria vine din chiar dalele vectoriale ale hărții noastre, coborâte într-un
 * fișier de contururi cu `pnpm map:city`: e Brașovul adevărat, cu Tâmpa, cu Oltul
 * și cu rețeaua lui de străzi, fără nicio cerere de rețea și fără bibliotecă de hărți.
 *
 * Planul stă culcat sub un unghi, iar semnele se ridică perpendicular pe el. De
 * aceea fiecare semn își poartă umbra pe pământ și se vede că stă *deasupra*
 * orașului, nu lipit peste poza lui. Semnele sunt elemente adevărate, nu desen:
 * se pot ținti cu mouse-ul, cu degetul și cu tastatura, iar fiecare duce la
 * categoria lui pe hartă.
 */

/** Cât de culcat stă planul. Mai mult și străzile din fund se string într-o dungă. */
const TILT = 46;

/** Cât se mișcă planul după cursor. Atât cât să pară viu, nu cât să fugă. */
const SWAY = 3.5;

/** Perechea semn-categorie, aleasă ca să acopere paleta și familiile de icoane. */
const PIN_CATEGORIES: ReportCategory[] = [
  "pothole",
  "street_lighting",
  "illegal_parking_road",
  "green_space",
  "illegal_dumping",
  "vandalism",
  "traffic_light",
  "sidewalk",
  "water_or_heating",
  "stray_animal",
  "public_transport",
  "illegal_parking_sidewalk",
  "park",
  "noise",
  "signage",
  "waste_collection",
  "abandoned_vehicle",
  "bollards",
  "heritage",
  "crosswalk_marking",
  "illegal_construction",
  "air_quality",
];

/** Semnele cu puls: cele mai noi sesizări, ca pe hartă. Trei, nu toate. */
const PULSING = new Set([1, 7, 14]);

const [VIEW_X, VIEW_Y, VIEW_W, VIEW_H] = CITY_VIEW_BOX.split(" ").map(Number);

export function CityMap({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 90, damping: 18, mass: 0.6 };
  const swayZ = useSpring(useTransform(pointerX, [-1, 1], [-SWAY, SWAY]), spring);
  const swayX = useSpring(useTransform(pointerY, [-1, 1], [SWAY, -SWAY]), spring);
  const rotateX = useTransform(swayX, (value) => `${TILT + (reduce ? 0 : value)}deg`);
  const rotateZ = useTransform(swayZ, (value) => `${-9 + (reduce ? 0 : value)}deg`);

  const follow = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduce) return;
      const box = event.currentTarget.getBoundingClientRect();
      pointerX.set(((event.clientX - box.left) / box.width) * 2 - 1);
      pointerY.set(((event.clientY - box.top) / box.height) * 2 - 1);
    },
    [pointerX, pointerY, reduce],
  );

  const release = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  return (
    <div
      onPointerMove={follow}
      onPointerLeave={release}
      className={cn("relative h-full [perspective-origin:50%_30%] [perspective:1500px]", className)}
    >
      <motion.div
        style={{ rotateX, rotateZ }}
        className="absolute inset-[-14%] [transform-style:preserve-3d]"
      >
        <svg
          viewBox={CITY_VIEW_BOX}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Harta Brașovului"
          className="absolute inset-0 size-full"
        >
          <rect x={VIEW_X} y={VIEW_Y} width={VIEW_W} height={VIEW_H} fill="var(--map-canvas)" />
          <path d={CITY_GREEN} fill="var(--map-green)" fillRule="evenodd" />
          <path d={CITY_WATER} fill="var(--map-water)" fillRule="evenodd" />
          <path
            d={CITY_WATERWAY}
            fill="none"
            stroke="var(--map-water)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d={CITY_STREETS}
            fill="none"
            stroke="var(--map-street)"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={CITY_MINOR_ROADS}
            fill="none"
            stroke="var(--map-road)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={CITY_MAJOR_ROADS}
            fill="none"
            stroke="var(--map-major)"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {CITY_PINS.map(([x, y], index) => {
          const category = PIN_CATEGORIES[index % PIN_CATEGORIES.length];
          const color = categoryColor[category];
          const left = ((x - VIEW_X) / VIEW_W) * 100;
          const top = ((y - VIEW_Y) / VIEW_H) * 100;
          const open = hovered === index;

          return (
            <Link
              key={`${x}-${y}`}
              href={`/harta?categorie=${category}`}
              aria-label={`${categoryLabel(category)} pe hartă`}
              onPointerEnter={() => setHovered(index)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              style={
                {
                  left: `${left}%`,
                  top: `${top}%`,
                  "--pin-delay": `${index * 55}ms`,
                  "--pin-tilt": `${TILT}deg`,
                  zIndex: open ? 30 : 10 + Math.round(top / 4),
                } as React.CSSProperties
              }
              className="city-pin group absolute block [transform-style:preserve-3d] focus-visible:outline-none"
            >
              {/* Umbra rămâne culcată pe plan: ea e ce spune că semnul stă deasupra lui. */}
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 block h-[7px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-black/45 blur-[2px]"
              />

              <span className="city-pin-body block origin-bottom">
                {PULSING.has(index) && !reduce && (
                  <span
                    aria-hidden="true"
                    className="city-pin-pulse absolute top-[17px] left-1/2 block size-9 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}

                {/* Eticheta se ridică din semn, nu plutește lângă el. */}
                <span
                  className={cn(
                    "border-border bg-popover text-popover-foreground pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 block w-max max-w-[11rem] -translate-x-1/2 rounded-lg border px-2.5 py-1.5 text-center text-xs leading-tight font-semibold shadow-lg transition duration-200",
                    open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                  )}
                >
                  {categoryLabel(category)}
                </span>

                <span
                  className="city-pin-head relative block size-[34px] rounded-full border-2 shadow-[0_6px_14px_-4px_rgb(0_0_0/0.55)] transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: color, borderColor: "var(--map-pin-ring)" }}
                >
                  <Image
                    src={reportIconUrl(category)}
                    alt=""
                    width={26}
                    height={26}
                    className="absolute top-1/2 left-1/2 size-[26px] -translate-x-1/2 -translate-y-1/2"
                  />
                </span>

                {/* Piciorul: un triunghi în culoarea inelului, sub disc. */}
                <span
                  aria-hidden="true"
                  className="absolute top-[30px] left-1/2 block size-0 -translate-x-1/2 border-x-[6px] border-t-[11px] border-x-transparent"
                  style={{ borderTopColor: "var(--map-pin-ring)" }}
                />
              </span>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
