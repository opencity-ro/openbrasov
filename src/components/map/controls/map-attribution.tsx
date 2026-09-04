import { cn } from "@/lib/utils";

const SOURCES = [
  { label: "OpenFreeMap", href: "https://openfreemap.org/" },
  { label: "OpenMapTiles", href: "https://www.openmaptiles.org/" },
  { label: "OpenStreetMap", href: "https://www.openstreetmap.org/copyright" },
];

/**
 * Atribuirea e obligatorie, deci nu o ascundem după un buton „i". O ținem mică
 * și așezată, dar mereu pe ecran.
 */
export function MapAttribution({ className }: { className?: string }) {
  return (
    <p className={cn("text-foreground/55 text-[10px] leading-tight", className)}>
      {SOURCES.map((source, index) => (
        <span key={source.href}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          <a
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground focus-visible:ring-ring/50 rounded-sm underline-offset-2 transition-colors outline-none hover:underline focus-visible:ring-2"
          >
            {source.label}
          </a>
        </span>
      ))}
    </p>
  );
}
