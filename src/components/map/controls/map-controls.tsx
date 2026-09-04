"use client";

import { CompassButton } from "./compass-button";
import { LocateButton } from "./locate-button";
import { MapAttribution } from "./map-attribution";
import { MapControlGroup } from "./map-control-surface";
import { PitchButton } from "./pitch-button";
import { ScaleBar } from "./scale-bar";
import { ZoomButtons } from "./zoom-buttons";

/**
 * Toate controalele hărții, într-un singur strat. Overlay-ul lasă gesturile să
 * treacă pe sub el; doar grupurile de butoane primesc înapoi evenimentele.
 */
export function MapControls({
  ready,
  is3d,
  onToggle3d,
}: {
  ready: boolean;
  is3d: boolean;
  onToggle3d: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-end">
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <MapControlGroup>
            <LocateButton />
            <PitchButton active={is3d} disabled={!ready} onToggle={onToggle3d} />
          </MapControlGroup>
          <CompassButton />
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="pointer-events-auto flex flex-col gap-1">
          <ScaleBar />
          <MapAttribution />
        </div>

        {/* Pe telefon zoom-ul se face cu două degete; butoanele ar fura din hartă. */}
        <ZoomButtons className="pointer-events-auto hidden sm:flex" />
      </div>
    </div>
  );
}
