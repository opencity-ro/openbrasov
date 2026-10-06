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
 * Capul e pătrat, nu dreptunghiular, iar punctul stă fix în mijlocul lui: așa
 * rama verde iese egală pe toate patru laturile. Pe fundal închis inelul decupat
 * dispare în pagină și singurul lucru care spune unde e centrul rămâne grosimea
 * ramei — cu un cap mai lat decât înalt, punctul se citea descentrat oriunde
 * l-am fi pus.
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
        d="M11 1.8H21A7 7 0 0 1 28 8.8V18.8A7 7 0 0 1 21 25.8L17.1 29.3A1.1 1.1 0 0 1 14.9 29.3L11 25.8A7 7 0 0 1 4 18.8V8.8A7 7 0 0 1 11 1.8ZM9.5 13.8a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0-13 0"
        className="fill-primary"
      />
      <path d="M10.8 13.8a5.2 5.2 0 1 0 10.4 0a5.2 5.2 0 1 0-10.4 0" fill="var(--brand-orange)" />
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
