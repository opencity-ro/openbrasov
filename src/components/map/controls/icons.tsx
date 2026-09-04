import { cn } from "@/lib/utils";

/**
 * Iconițele controalelor sunt desenate aici, nu luate din bibliotecă: pe o hartă
 * trebuie să fie mai subțiri și mai mici decât setul folosit în restul aplicației,
 * altfel arată ca niște butoane de formular puse peste oraș.
 */
type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-[17px]", className)} aria-hidden="true">
      {children}
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path {...stroke} d="M12 5.5v13M5.5 12h13" />
    </Svg>
  );
}

export function MinusIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path {...stroke} d="M5.5 12h13" />
    </Svg>
  );
}

/** Săgeata de navigație, cu vârful spre nord-est. Plină cât timp poziția e urmărită. */
export function LocateArrowIcon({ className, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <Svg className={className}>
      <path
        {...stroke}
        fill={filled ? "currentColor" : "none"}
        d="M20.4 3.6 4.2 10.1c-.8.3-.7 1.4.1 1.6l6.4 1.6 1.6 6.4c.2.8 1.3.9 1.6.1L20.4 3.6Z"
      />
    </Svg>
  );
}

/** Harta pliată în trei foi — semnul obișnuit pentru „schimbă stratul". */
export function LayersIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path {...stroke} d="M9 4.2 3.6 6.6v13.2L9 17.4l6 2.4 5.4-2.4V4.2L15 6.6 9 4.2Z" />
      <path {...stroke} d="M9 4.2v13.2M15 6.6v13.2" />
    </Svg>
  );
}

/**
 * Busola: cadran cu reperele cardinale și acul cu vârful spre nord. Doar acul se
 * rotește, litera rămâne dreaptă — altfel nu mai poți citi încotro e nordul.
 */
export function CompassIcon({ className, bearing = 0 }: IconProps & { bearing?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-[22px]", className)} aria-hidden="true">
      <circle cx="12" cy="12" r="11.2" className="fill-foreground/[0.07]" />
      <g style={{ transform: `rotate(${-bearing}deg)`, transformOrigin: "12px 12px" }}>
        <path d="M12 0.9 14.4 6.4h-4.8L12 0.9Z" className="fill-destructive" />
        <path d="M12 23.1 9.6 17.6h4.8L12 23.1Z" className="fill-muted-foreground/45" />
      </g>
      <text
        x="12"
        y="15.2"
        textAnchor="middle"
        className="fill-foreground text-[10px] font-semibold"
        style={{ fontFamily: "inherit" }}
      >
        N
      </text>
    </svg>
  );
}
