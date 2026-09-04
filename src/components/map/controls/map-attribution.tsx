import { cn } from "@/lib/utils";

import { IMAGERY_ATTRIBUTION, type MapMode } from "../map-modes";

const BASE_SOURCES = [
  { label: "OpenFreeMap", href: "https://openfreemap.org/" },
  { label: "OpenMapTiles", href: "https://www.openmaptiles.org/" },
  { label: "OpenStreetMap", href: "https://www.openstreetmap.org/copyright" },
];

/**
 * Atribuirea e obligatorie, deci nu o ascundem după un buton „i". O ținem mică
 * și așezată, dar mereu pe ecran, și adăugăm sursa imaginilor când sunt pornite.
 */
export function MapAttribution({ mode, className }: { mode: MapMode; className?: string }) {
  const sources = mode === "standard" ? BASE_SOURCES : [...BASE_SOURCES, IMAGERY_ATTRIBUTION];

  return (
    <p className={cn("text-foreground/55 text-[10px] leading-tight", className)}>
      {sources.map((source, index) => (
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
