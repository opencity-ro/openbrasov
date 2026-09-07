"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { useMemo } from "react";

import { useMapInstance, useMapView } from "../map-context";
import { formatScaleDistance, niceScaleDistance, SCALE_MAX_WIDTH } from "../map-scale";

type Scale = { label: string; width: number };

/**
 * Măsurăm pe orizontală, la mijlocul hărții: la latitudinea Brașovului diferența
 * față de marginea de sus a ecranului e sub un pixel, dar codul rămâne simplu.
 */
function measure(map: MapLibreMap): Scale | null {
  const { height } = map.getCanvas().getBoundingClientRect();
  const left = map.unproject([0, height / 2]);
  const right = map.unproject([SCALE_MAX_WIDTH, height / 2]);
  const spanMeters = left.distanceTo(right);
  const rounded = niceScaleDistance(spanMeters);

  if (rounded <= 0 || spanMeters <= 0) return null;

  return {
    label: formatScaleDistance(rounded),
    width: Math.round((rounded / spanMeters) * SCALE_MAX_WIDTH),
  };
}

export function ScaleBar() {
  const map = useMapInstance();
  const view = useMapView(map);
  const scale = useMemo(() => (map && view ? measure(map) : null), [map, view]);

  if (!scale) return null;

  return (
    <div
      className="text-foreground/70 flex flex-col gap-0.5 text-[11px] font-medium"
      aria-hidden="true"
    >
      <span className="leading-none">{scale.label}</span>
      {/* Capetele verticale spun unde începe și unde se termină măsura. */}
      <span
        className="border-foreground/45 h-[5px] border-r border-b border-l transition-[width] duration-150 ease-out"
        style={{ width: scale.width }}
      />
    </div>
  );
}
