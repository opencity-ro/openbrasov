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
 * ramei, deci un cap mai lat decât înalt face punctul să pară descentrat oriunde
 * l-ai pune.
 *
 * Toate coordonatele sunt întregi sau jumătăți, iar centrul cercurilor cade pe
 * (16, 14). La 34 sau 48 de puncte, un centru la 13,8 ar fi căzut în mijlocul
 * unui pixel, iar netezirea ar fi subțiat inelul într-o parte și l-ar fi îngroșat
 * în cealaltă — exact ce se vede ca „nu e centrat" la mărime mică.
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
        d="M11 2H21A7 7 0 0 1 28 9V19A7 7 0 0 1 21 26L17.1 28.9A1.1 1.1 0 0 1 14.9 28.9L11 26A7 7 0 0 1 4 19V9A7 7 0 0 1 11 2ZM9.4 14a6.6 6.6 0 1 0 13.2 0a6.6 6.6 0 1 0-13.2 0"
        className="fill-primary"
      />
      <path d="M10.8 14a5.2 5.2 0 1 0 10.4 0a5.2 5.2 0 1 0-10.4 0" fill="var(--brand-orange)" />
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
