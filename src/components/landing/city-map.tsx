"use client";

import {
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

import { reportIconUrl } from "@/components/map/report-icons";
import {
  PIN_DISC_RADIUS,
  PIN_HEAD_CENTRE,
  PIN_ICON_SIZE,
  PIN_OUTLINE,
  PIN_SVG_PATH,
  PIN_WIDTH,
  PIN_HEIGHT,
  PIN_TIP_Y,
} from "@/components/map/report-pins";
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
const TILT = 40;

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

/**
 * Cât din lățime ține textul eroului. Semnele care ar cădea acolo nu se desenează:
 * un pin sub un titlu nu se poate apăsa, nu se poate citi și murdărește litera.
 */
const TEXT_COLUMN = 54;

/** Cât de mare se desenează pinul în pagină, față de cutia lui de pe hartă. */
const PIN_SCALE = 0.96;

/** Semnele cu puls: cele mai noi sesizări, ca pe hartă. Câteva, nu toate. */
const PULSING = new Set([2, 9, 17]);

/**
 * Camera, când o conduce altcineva decât cursorul: derularea paginii. Valorile
 * sunt de mișcare, deci harta urmează fără să redeseneze React la fiecare cadru.
 */
export type CityCamera = {
  zoom: MotionValue<number>;
  panX: MotionValue<number>;
  panY: MotionValue<number>;
  tilt: MotionValue<number>;
  spin: MotionValue<number>;
};

export function CityMap({
  className,
  camera,
  clearTextColumn = false,
}: {
  className?: string;
  camera?: CityCamera;
  /** Lasă coloana din stânga goală, pentru paginile care pun text peste hartă. */
  clearTextColumn?: boolean;
}) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 85, damping: 20, mass: 0.7 };
  const swayZ = useSpring(useTransform(pointerX, [-1, 1], [-SWAY, SWAY]), spring);
  const swayX = useSpring(useTransform(pointerY, [-1, 1], [SWAY, -SWAY]), spring);
  const driftX = useSpring(useTransform(pointerX, [-1, 1], [26, -26]), spring);
  const driftY = useSpring(useTransform(pointerY, [-1, 1], [14, -14]), spring);
  const ownRotateX = useTransform(swayX, (value) => `${TILT + (reduce ? 0 : value)}deg`);
  const ownRotateZ = useTransform(swayZ, (value) => `${-8 + (reduce ? 0 : value)}deg`);
  const camRotateX = useTransform(camera?.tilt ?? swayX, (value) => `${value}deg`);
  const camRotateZ = useTransform(camera?.spin ?? swayZ, (value) => `${value}deg`);
  const rotateX = camera ? camRotateX : ownRotateX;
  const rotateZ = camera ? camRotateZ : ownRotateZ;

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
      {/*
       * Două straturi, nu unul: rotirea în plan stă afară, înclinarea stă înăuntru.
       * Dacă ambele ar sta pe același element, ordinea în care le compune motorul
       * de animație ar fi `rotateX` apoi `rotateZ`, iar contra-rotația semnului
       * n-ar mai anula înclinarea — semnele ar rămâne turtite pe asfalt. Separate,
       * inversa semnului cade exact peste înclinare și el se ridică drept.
       */}
      <motion.div
        style={
          {
            rotateZ,
            "--plane-z": rotateZ,
            x: camera ? camera.panX : reduce ? 0 : driftX,
            y: camera ? camera.panY : reduce ? 0 : driftY,
            scale: camera ? camera.zoom : 1,
          } as never
        }
        className="absolute inset-0 [transform-style:preserve-3d]"
      >
        <motion.div
          style={{ rotateX }}
          className="absolute -inset-x-[12%] -top-[42%] -bottom-[6%] [transform-style:preserve-3d]"
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
            const plainLeft = (x / CITY_VIEW_WIDTH) * 100;
            if (clearTextColumn && plainLeft < TEXT_COLUMN) return null;
            const category = PIN_CATEGORIES[index % PIN_CATEGORIES.length];
            const color = categoryColor[category];
            const left = (x / CITY_VIEW_WIDTH) * 100;
            const top = (y / CITY_VIEW_HEIGHT) * 100;
            const open = hovered === index;
            const dimmed = hovered !== null && !open;

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
                className="city-pin group absolute block [transform-style:preserve-3d] focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "city-pin-shadow absolute top-0 left-0 block h-[22px] w-[54px] rounded-[50%] blur-[9px] transition-opacity duration-200",
                    dimmed && "opacity-25",
                  )}
                  style={{ background: "var(--map-pin-glow)", transform: "translate(-50%, -50%)" }}
                />
                {/*
                 * Umbra, în două straturi culcate pe asfalt: una lată și moale,
                 * care spune cât de sus stă semnul, și un miez strâns chiar sub
                 * vârf, care îl lipește de locul pe care îl arată. Amândouă sunt
                 * decalate spre dreapta-jos, fiindcă lumina vine din stânga-sus,
                 * ca peste tot în pagină. Pe tema deschisă ele sunt singurul lucru
                 * care spune că semnul nu e lipit pe hartă.
                 */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "city-pin-shadow absolute top-0 left-0 block h-[13px] w-[38px] rounded-[50%] blur-[6px] transition-opacity duration-200",
                    dimmed && "opacity-25",
                  )}
                  style={{
                    background: "var(--map-pin-shadow)",
                    transform: "translate(-44%, -46%)",
                  }}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "city-pin-shadow absolute top-0 left-0 block h-[6px] w-[15px] rounded-[50%] blur-[2px] transition-opacity duration-200",
                    dimmed && "opacity-25",
                  )}
                  style={{
                    background: "var(--map-pin-shadow-core)",
                    transform: "translate(-46%, -48%)",
                  }}
                />

                <span
                  className="city-pin-body relative block"
                  style={{
                    width: PIN_WIDTH * PIN_SCALE,
                    height: PIN_HEIGHT * PIN_SCALE,
                    transformOrigin: `50% ${(PIN_TIP_Y / PIN_HEIGHT) * 100}%`,
                  }}
                >
                  {PULSING.has(index) && !reduce && (
                    <span
                      aria-hidden="true"
                      className="city-pin-pulse absolute rounded-full"
                      style={{
                        backgroundColor: color,
                        width: PIN_DISC_RADIUS * 2 * PIN_SCALE,
                        height: PIN_DISC_RADIUS * 2 * PIN_SCALE,
                        left: `${(PIN_HEAD_CENTRE.x / PIN_WIDTH) * 100}%`,
                        top: `${(PIN_HEAD_CENTRE.y / PIN_HEIGHT) * 100}%`,
                      }}
                    />
                  )}

                  {/* Eticheta se ridică din semn, nu plutește lângă el. */}
                  <span
                    className={cn(
                      "border-border bg-popover text-popover-foreground pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 block w-max max-w-[12rem] -translate-x-1/2 rounded-lg border px-3 py-1.5 text-center text-xs leading-tight font-semibold shadow-xl transition duration-200",
                      open ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0",
                    )}
                  >
                    {categoryLabel(category)}
                  </span>

                  {/*
                   * Pinul întreg, cu aceeași cale ca pe hartă: corp alb conturat,
                   * disc colorat, icoana categoriei. Nu e o reinterpretare, e exact
                   * forma pe care o vezi când deschizi harta.
                   */}
                  <span
                    className={cn(
                      "city-pin-head relative block size-full origin-bottom drop-shadow-[0_10px_16px_rgb(0_0_0/0.45)] group-hover:scale-110",
                      dimmed && "opacity-45",
                    )}
                  >
                    <svg
                      viewBox={`0 0 ${PIN_WIDTH} ${PIN_HEIGHT}`}
                      className="absolute inset-0 size-full"
                      aria-hidden="true"
                    >
                      <path d={PIN_SVG_PATH} fill="#ffffff" stroke={PIN_OUTLINE} strokeWidth="1" />
                      <circle
                        cx={PIN_HEAD_CENTRE.x}
                        cy={PIN_HEAD_CENTRE.y}
                        r={PIN_DISC_RADIUS}
                        fill={color}
                      />
                    </svg>
                    <Image
                      src={reportIconUrl(category)}
                      alt=""
                      width={Math.round(PIN_ICON_SIZE)}
                      height={Math.round(PIN_ICON_SIZE)}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${(PIN_HEAD_CENTRE.x / PIN_WIDTH) * 100}%`,
                        top: `${(PIN_HEAD_CENTRE.y / PIN_HEIGHT) * 100}%`,
                        width: PIN_ICON_SIZE * PIN_SCALE,
                        height: PIN_ICON_SIZE * PIN_SCALE,
                      }}
                    />
                  </span>
                </span>
              </Link>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
