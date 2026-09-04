"use client";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";
import { cn } from "@/lib/utils";

import { FLAT_VIEW } from "../map-config";
import { useMapInstance, useMapView } from "../map-context";
import { mapSurfaceClass } from "./map-control-surface";

/** Un ac de busolă: vârful spre nord colorat, coada stinsă. Se rotește cu harta. */
function CompassNeedle({ bearing }: { bearing: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px]"
      style={{ transform: `rotate(${-bearing}deg)` }}
      aria-hidden="true"
    >
      <path d="M12 3.5 16 20 12 16.4 8 20Z" className="fill-destructive" />
      <path d="M12 16.4 16 20 12 3.5 8 20Z" className="fill-muted-foreground/45" />
    </svg>
  );
}

/**
 * Apare doar când harta e rotită sau înclinată — un buton care nu are ce reseta
 * e zgomot. Ieșirea e mai scurtă decât intrarea, ca dispariția să pară promptă.
 */
export function CompassButton() {
  const map = useMapInstance();
  const view = useMapView(map);
  const isOriented = !view || (Math.abs(view.bearing) < 0.5 && view.pitch < 0.5);

  return (
    <div
      className={cn(
        "transition-all duration-200 ease-out",
        isOriented
          ? "pointer-events-none scale-90 opacity-0 duration-150"
          : "scale-100 opacity-100",
      )}
      aria-hidden={isOriented}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xl"
        className={mapSurfaceClass}
        aria-label={t.map.resetNorth}
        title={t.map.resetNorth}
        tabIndex={isOriented ? -1 : undefined}
        onClick={() => map?.easeTo({ ...FLAT_VIEW, duration: 500 })}
      >
        <CompassNeedle bearing={view?.bearing ?? 0} />
      </Button>
    </div>
  );
}
