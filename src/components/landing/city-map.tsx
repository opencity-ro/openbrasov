"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

import { reportIconUrl } from "@/components/map/report-icons";
import { categoryColor, categoryLabel, type ReportCategory } from "@/lib/reports/categories";
import { cn } from "@/lib/utils";

import {
  CITY_BUILDINGS,
  CITY_GREEN,
  CITY_MAJOR_ROADS,
  CITY_MINOR_ROADS,
  CITY_PINS,
  CITY_STREETS,
  CITY_VIEW_BOX,
  CITY_VIEW_HEIGHT,
  CITY_VIEW_WIDTH,
  CITY_WATER,
  CITY_WATERWAY,
} from "./city-map-data";

/**
 * Harta orașului, desenată și înclinată.
 *
 * Geometria vine din chiar dalele vectoriale ale hărții noastre, coborâte într-un
 * fișier de contururi cu `pnpm map:city`: e Brașovul adevărat, cu străzile, apele,
 * pădurea și clădirile lui, fără nicio cerere de rețea și fără bibliotecă de hărți.
 *
 * Planul stă culcat sub un unghi, iar semnele se ridică perpendicular pe el. De
 * aceea fiecare semn își poartă umbra pe pământ și se vede că stă *deasupra*
 * orașului, nu lipit peste poza lui. Semnele sunt elemente adevărate, nu desen:
 * se pot ținti cu mouse-ul, cu degetul și cu tastatura, iar fiecare duce la
 * categoria lui pe hartă.
 */

/** Cât de culcat stă planul. Mai mult și străzile din fund se string într-o dungă. */
const TILT = 44;

/** Cât se mișcă planul după cursor. Atât cât să pară viu, nu cât să fugă. */
const SWAY = 3.5;

/**
 * Cât „urcă" acoperișul față de amprenta clădirii, în unități de desen. Banda
 * dintre cele două e peretele. Nu e o extrudare adevărată, ci trucul vechi al
 * hărților axonometrice, și e de ajuns ca orașul să capete volum sub un unghi.
 */
const ROOF_RISE = 5;

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
  "insects",
  "accessibility",
  "rodents",
  "wildlife",
];

/** Semnele cu puls: cele mai noi sesizări, ca pe hartă. Câteva, nu toate. */
const PULSING = new Set([2, 9, 17]);

export function CityMap({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 85, damping: 20, mass: 0.7 };
  const swayZ = useSpring(useTransform(pointerX, [-1, 1], [-SWAY, SWAY]), spring);
  const swayX = useSpring(useTransform(pointerY, [-1, 1], [SWAY, -SWAY]), spring);
  const driftX = useSpring(useTransform(pointerX, [-1, 1], [26, -26]), spring);
  const driftY = useSpring(useTransform(pointerY, [-1, 1], [14, -14]), spring);
  const rotateX = useTransform(swayX, (value) => `${TILT + (reduce ? 0 : value)}deg`);
  const rotateZ = useTransform(swayZ, (value) => `${-8 + (reduce ? 0 : value)}deg`);

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
    setHovered(null);
  }, [pointerX, pointerY]);

  return (
    <div
      onPointerMove={follow}
      onPointerLeave={release}
      className={cn(
        "relative h-full overflow-hidden [perspective-origin:50%_28%] [perspective:1600px]",
        className,
      )}
    >
      <motion.div
        style={{ rotateX, rotateZ, x: reduce ? 0 : driftX, y: reduce ? 0 : driftY }}
        className="absolute -inset-x-[28%] -top-[58%] -bottom-[18%] [transform-style:preserve-3d]"
      >
        <svg
          viewBox={CITY_VIEW_BOX}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label="Harta Brașovului"
          className="absolute inset-0 size-full"
        >
          <rect
            x="0"
            y="0"
            width={CITY_VIEW_WIDTH}
            height={CITY_VIEW_HEIGHT}
            fill="var(--map-canvas)"
          />
          <path d={CITY_GREEN} fill="var(--map-green)" fillRule="evenodd" />
          <path d={CITY_WATER} fill="var(--map-water)" fillRule="evenodd" />
          <path
            d={CITY_WATERWAY}
            fill="none"
            stroke="var(--map-water)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d={CITY_STREETS}
            fill="none"
            stroke="var(--map-street)"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={CITY_MINOR_ROADS}
            fill="none"
            stroke="var(--map-road)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={CITY_MAJOR_ROADS}
            fill="none"
            stroke="var(--map-major)"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Peretele, apoi acoperișul ridicat peste el: banda dintre ele e înălțimea. */}
          <path d={CITY_BUILDINGS} fill="var(--map-building-wall)" fillRule="evenodd" />
          <g transform={`translate(0 ${-ROOF_RISE})`}>
            <path
              d={CITY_BUILDINGS}
              fill="var(--map-building)"
              stroke="var(--map-building-edge)"
              strokeWidth="0.5"
              fillRule="evenodd"
            />
          </g>
        </svg>

        {CITY_PINS.map(([x, y], index) => {
          const category = PIN_CATEGORIES[index % PIN_CATEGORIES.length];
          const color = categoryColor[category];
          const left = (x / CITY_VIEW_WIDTH) * 100;
          const top = (y / CITY_VIEW_HEIGHT) * 100;
          const open = hovered === index;

          return (
            <Link
              key={`${x}-${y}`}
              href={`/harta?categorie=${category}`}
              aria-label={`${categoryLabel(category)} pe hartă`}
              onPointerEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              onBlur={() => setHovered(null)}
              style={
                {
                  left: `${left}%`,
                  top: `${top}%`,
                  "--pin-delay": `${index * 48}ms`,
                  "--pin-tilt": `${TILT}deg`,
                  zIndex: open ? 40 : 10 + Math.round(top / 3),
                } as React.CSSProperties
              }
              className={cn(
                "city-pin group absolute block [transform-style:preserve-3d] focus-visible:outline-none",
                hovered !== null && !open && "opacity-55",
              )}
            >
              {/* Umbra rămâne culcată pe plan: ea e ce spune că semnul stă deasupra lui. */}
              <span
                aria-hidden="true"
                className="city-pin-shadow absolute top-0 left-0 block h-[9px] w-[26px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-black/50 blur-[3px]"
              />

              <span className="city-pin-body block origin-bottom">
                {PULSING.has(index) && !reduce && (
                  <span
                    aria-hidden="true"
                    className="city-pin-pulse absolute top-[21px] left-1/2 block size-11 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                )}

                {/* Eticheta se ridică din semn, nu plutește lângă el. */}
                <span
                  className={cn(
                    "border-border bg-popover text-popover-foreground pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 block w-max max-w-[12rem] -translate-x-1/2 rounded-lg border px-3 py-1.5 text-center text-xs leading-tight font-semibold shadow-xl transition duration-200",
                    open ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
                  )}
                >
                  {categoryLabel(category)}
                </span>

                <span
                  className="city-pin-head relative block size-[42px] rounded-full border-[3px] transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: color, borderColor: "var(--map-pin-ring)" }}
                >
                  <Image
                    src={reportIconUrl(category)}
                    alt=""
                    width={30}
                    height={30}
                    className="absolute top-1/2 left-1/2 size-[30px] -translate-x-1/2 -translate-y-1/2"
                  />
                  {/* Lumina vine de sus-stânga, ca peste tot în pagină. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_26%,rgb(255_255_255/0.45),transparent_58%)]"
                  />
                </span>

                {/* Piciorul: un triunghi în culoarea inelului, sub disc. */}
                <span
                  aria-hidden="true"
                  className="absolute top-[37px] left-1/2 block size-0 -translate-x-1/2 border-x-[7px] border-t-[13px] border-x-transparent"
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
