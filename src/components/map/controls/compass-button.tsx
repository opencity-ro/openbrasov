"use client";

import { t } from "@/lib/messages";
import { cn } from "@/lib/utils";

import { useMapInstance, useMapView } from "../map-context";
import { CompassIcon } from "./icons";
import { MapButton, mapSurfaceClass } from "./map-control-surface";

/**
 * Apare doar când harta e rotită sau înclinată — un buton care nu are ce reseta
 * e zgomot. Dispariția e mai scurtă decât apariția, ca să pară promptă.
 */
export function CompassButton() {
  const map = useMapInstance();
  const view = useMapView(map);
  const isOriented = !view || (Math.abs(view.bearing) < 0.5 && view.pitch < 0.5);

  return (
    <div
      className={cn(
        mapSurfaceClass,
        "transition-all duration-200 ease-out",
        isOriented
          ? "pointer-events-none scale-90 opacity-0 duration-150"
          : "scale-100 opacity-100",
      )}
      aria-hidden={isOriented}
    >
      <MapButton
        label={t.map.resetNorth}
        tabIndex={isOriented ? -1 : undefined}
        // Doar orientarea revine la nord; înclinarea rămâne, ca să nu ieși din relief.
        onClick={() => map?.easeTo({ bearing: 0, duration: 450 })}
      >
        <CompassIcon bearing={view?.bearing ?? 0} />
      </MapButton>
    </div>
  );
}
