import {
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
import { categoryColor, type ReportCategory } from "@/lib/reports/categories";
import { cn } from "@/lib/utils";

/**
 * Harta orașului, desenată.
 *
 * Geometria vine din chiar dalele vectoriale ale hărții noastre, coborâte într-un
 * fișier de contururi cu `pnpm map:city`. E Brașovul adevărat, cu Tâmpa, cu Oltul
 * și cu rețeaua lui de străzi, dar nu costă nicio cerere de rețea și niciun
 * kiloboctet de bibliotecă de hărți: pagina de pornire se deschide cu el deja pe ecran.
 *
 * Semnele stau pe vârfuri de stradă adevărate, nu împrăștiate pe pânză, iar
 * culorile lor sunt cele din aplicație, deci ce vezi aici e ce găsești pe hartă.
 */

/** Categoriile din care își iau semnele culoarea, alese ca să acopere paleta. */
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

/** Capul semnului și cât coboară vârful sub el, în unități de desen. */
const PIN_RADIUS = 10.4;
const PIN_DROP = 17.5;

/** Picătura: cerc plin sus, laturi care se strâng spre vârf. */
const pinPath = (x: number, y: number) =>
  `M${x} ${y}` +
  `C${x - 3.4} ${y - PIN_DROP * 0.55} ${x - PIN_RADIUS} ${y - PIN_DROP * 0.78} ${x - PIN_RADIUS} ${y - PIN_DROP}` +
  `a${PIN_RADIUS} ${PIN_RADIUS} 0 1 1 ${PIN_RADIUS * 2} 0` +
  `c0 ${PIN_DROP * 0.22} ${-(PIN_RADIUS - 3.4)} ${PIN_DROP * 0.23} ${-PIN_RADIUS} ${PIN_DROP}Z`;

export function CityMap({ className }: { className?: string }) {
  return (
    <svg
      viewBox={CITY_VIEW_BOX}
      width={CITY_VIEW_WIDTH}
      height={CITY_VIEW_HEIGHT}
      role="img"
      aria-label="Harta Brașovului cu sesizări"
      className={cn("city-map h-full w-full", className)}
    >
      <rect
        x="0"
        y="0"
        width={CITY_VIEW_WIDTH * 2}
        height={CITY_VIEW_HEIGHT * 2}
        fill="var(--map-canvas)"
      />
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

      {CITY_PINS.map(([x, y], index) => {
        const color = categoryColor[PIN_CATEGORIES[index % PIN_CATEGORIES.length]];
        return (
          <g
            key={`${x}-${y}`}
            className="city-map-pin"
            style={{ "--pin-delay": `${index * 70}ms` } as React.CSSProperties}
          >
            {PULSING.has(index) && (
              <circle
                className="city-map-pulse"
                cx={x}
                cy={y - PIN_DROP}
                r={PIN_RADIUS}
                fill={color}
              />
            )}
            {/* Marginea și inima semnului sunt aceeași formă, a doua micșorată din
                centrul capului: așa inelul rămâne egal pe tot conturul, și pe cap,
                și pe picior. */}
            <path d={pinPath(x, y)} fill="var(--map-pin-ring)" />
            <path
              d={pinPath(x, y)}
              fill={color}
              transform={`translate(${x} ${y}) scale(0.78) translate(${-x} ${-y})`}
            />
          </g>
        );
      })}
    </svg>
  );
}
