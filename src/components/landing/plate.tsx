import { cn } from "@/lib/utils";

/**
 * Planșa: cadrul de specimen din jurul hărții.
 *
 * Patru colțare și o legendă monospațiată, ca în fișele tehnice de unde vine tot
 * limbajul paginii. Nu e un card: n-are fundal, n-are umbră și nu închide nimic.
 * Marchează doar o zonă și o numește, exact ce face un cadru pe o planșă.
 *
 * Colțarele sunt desenate cu margini pe patru pătrate goale, nu cu un chenar
 * întreg: un chenar ar fi făcut din hartă o poză înrămată, iar colțarele o lasă
 * să continue dincolo de ele.
 */

type PlateProps = {
  children?: React.ReactNode;
  /** Eticheta din stânga sus, în voce tehnică. */
  label?: string;
  /** Legenda din dreapta jos. */
  caption?: string;
  className?: string;
};

const TICK = "border-foreground/35 pointer-events-none absolute size-5";

export function Plate({ children, label, caption, className }: PlateProps) {
  return (
    <div className={cn("relative", className)}>
      {children}

      <span aria-hidden="true" className={cn(TICK, "top-0 left-0 border-t border-l")} />
      <span aria-hidden="true" className={cn(TICK, "top-0 right-0 border-t border-r")} />
      <span aria-hidden="true" className={cn(TICK, "bottom-0 left-0 border-b border-l")} />
      <span aria-hidden="true" className={cn(TICK, "right-0 bottom-0 border-r border-b")} />

      {label && (
        <span className="text-muted-foreground pointer-events-none absolute top-2.5 left-8 font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
          {label}
        </span>
      )}
      {caption && (
        <span className="text-muted-foreground pointer-events-none absolute right-8 bottom-2.5 font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
          {caption}
        </span>
      )}
    </div>
  );
}

/**
 * Cuvântul marcat: un traseu de marker verde pe sub literă, nu un fundal plin.
 *
 * Culoarea mărcii nu are voie să devină fundal de bloc, dar peste un singur cuvânt
 * dintr-un titlu e chiar treaba ei — arată unde se uită ochiul, o dată pe pagină.
 */
export function Marked({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span
        aria-hidden="true"
        className="bg-primary/70 absolute inset-x-[-0.1em] bottom-[0.2em] block h-[0.3em] -rotate-[0.5deg]"
      />
      <span className="relative">{children}</span>
    </span>
  );
}
