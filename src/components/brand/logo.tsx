import { cn } from "@/lib/utils";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

/**
 * Semnul: o bulă de mesaj cu vârful în jos, cu punctul locului decupat în mijloc.
 * Spune amândouă lucrurile pe care le facem — cineva ia cuvântul, despre un loc
 * anume — și nu e picătura de hartă pe care o are toată lumea.
 *
 * Un singur contur, o singură culoare, fără interior desenat: la 16 puncte în
 * tabul browserului rămâne limpede, iar pe orice fundal se inversează singur.
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
        d="M10.4 2.4H21.6A7 7 0 0 1 28.6 9.4V17.8A7 7 0 0 1 21.6 24.8H21.5L17.1 28.5A1.1 1.1 0 0 1 14.9 28.5L10.5 24.8H10.4A7 7 0 0 1 3.4 17.8V9.4A7 7 0 0 1 10.4 2.4ZM10.8 13.6a5.2 5.2 0 1 0 10.4 0a5.2 5.2 0 1 0-10.4 0"
        className="fill-primary"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={26} />
      <span className="text-[1.0625rem] font-bold tracking-[-0.02em]">Open Brașov</span>
    </span>
  );
}
