"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { t } from "@/lib/messages";
import { cn } from "@/lib/utils";

import { IMAGERY_PREVIEW_URL, MAP_MODES, type MapMode } from "../map-modes";
import { LayersIcon } from "./icons";
import { MapButton } from "./map-control-surface";

const LABELS: Record<MapMode, string> = {
  standard: t.map.modeStandard,
  hybrid: t.map.modeHybrid,
  satellite: t.map.modeSatellite,
};

/**
 * Previzualizarea arată exact ce primești: pentru imagini e o dală reală de peste
 * Brașov, iar pentru harta desenată o miniatură făcută din culorile stilului.
 */
function Preview({ mode }: { mode: MapMode }) {
  if (mode === "standard") {
    return (
      <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
        <rect width="64" height="64" className="fill-muted" />
        <path d="M0 40c12-3 20 4 34 2s22-8 30-6v28H0Z" className="fill-primary/20" />
        <path
          d="M-2 22c14 0 18 10 30 10s20-12 38-8"
          fill="none"
          className="stroke-background"
          strokeWidth="5"
        />
        <path d="M20 64V34" fill="none" className="stroke-background" strokeWidth="3.5" />
      </svg>
    );
  }

  return (
    <div
      className="size-full bg-cover bg-center"
      style={{ backgroundImage: `url(${IMAGERY_PREVIEW_URL})` }}
      aria-hidden="true"
    >
      {mode === "hybrid" && (
        <svg viewBox="0 0 64 64" className="size-full" aria-hidden="true">
          <path
            d="M-2 22c14 0 18 10 30 10s20-12 38-8"
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="3"
          />
          <path d="M20 64V34" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.2" />
        </svg>
      )}
    </div>
  );
}

export function ModeSwitcher({
  mode,
  onSelect,
  disabled,
}: {
  mode: MapMode;
  onSelect: (mode: MapMode) => void;
  disabled: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <MapButton label={t.map.layers} disabled={disabled} active={mode !== "standard"}>
          <LayersIcon />
        </MapButton>
      </PopoverTrigger>
      <PopoverContent side="left" align="start" sideOffset={10} className="w-auto p-2">
        <div className="flex gap-2" role="radiogroup" aria-label={t.map.layers}>
          {MAP_MODES.map((candidate) => {
            const selected = candidate === mode;

            return (
              <button
                key={candidate}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(candidate)}
                className="focus-visible:ring-ring/60 group flex w-[76px] flex-col items-center gap-1.5 rounded-md p-1 outline-none focus-visible:ring-2"
              >
                <span
                  className={cn(
                    "size-[60px] overflow-hidden rounded-[9px] transition-shadow duration-150",
                    selected
                      ? "ring-primary ring-2 ring-offset-2 ring-offset-[var(--popover)]"
                      : "ring-border/60 group-hover:ring-border ring-1",
                  )}
                >
                  <Preview mode={candidate} />
                </span>
                <span
                  className={cn(
                    "text-[11px] leading-none font-medium",
                    selected ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {LABELS[candidate]}
                </span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
