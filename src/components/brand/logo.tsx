import { cn } from "@/lib/utils";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

/**
 * Semnul: o bulă de mesaj cu vârful în jos, cu punctul locului în mijloc.
 * Spune amândouă lucrurile pe care le facem, cineva ia cuvântul despre un loc
 * anume, și nu e picătura de hartă pe care o are toată lumea.
 *
 * Punctul e portocaliu, nu gol: aduce a doua culoare a mărcii în semn și pune
 * acolo singurul contrast tare din el. Inelul dintre punct și bulă rămâne
 * decupat, deci lasă pagina să treacă prin el și semnul stă la fel de bine pe
 * orice fundal.
 *
 * Punctul nu stă în centrul capului, ci al siluetei întregi: coada trage greutatea
 * în jos, iar un punct centrat doar pe cap se citește urcat, mai ales pe fundal
 * închis, unde inelul decupat se pierde în pagină.
 *
 * Coada iese cât toată latura de jos dintre colțuri, ca să curgă din corp în loc
 * să pară un ciob lipit dedesubt.
 */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      role="img"
      aria-label="Open Brașov"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.4 2.4H21.6A7 7 0 0 1 28.6 9.4V17.8A7 7 0 0 1 21.6 24.8H21.5L17.1 28.5A1.1 1.1 0 0 1 14.9 28.5L10.5 24.8H10.4A7 7 0 0 1 3.4 17.8V9.4A7 7 0 0 1 10.4 2.4ZM10 14.1a6 6 0 1 0 12 0a6 6 0 1 0-12 0"
        className="fill-primary"
      />
      <path d="M11.5 14.1a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0-9 0" fill="var(--brand-orange)" />
    </svg>
  );
}

/**
 * Semnul plus numele. Umplu antetul de 64 de puncte cât se poate fără să-l
 * înalțe: la 34 de puncte semnul lasă 15 de aer deasupra și dedesubt, adică tot
 * atât cât lasă butoanele de pe cealaltă parte, deci bara rămâne echilibrată.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={34} />
      <span className="text-[1.3125rem] leading-none font-bold tracking-[-0.025em]">
        Open Brașov
      </span>
    </span>
  );
}
