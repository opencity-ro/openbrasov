"use client";

import { useEffect, useRef, useState } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

import { t } from "@/lib/messages";
import { cn } from "@/lib/utils";

import { BRASOV_BOUNDS, BRASOV_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL, MIN_ZOOM } from "./map-config";

type BrasovMapProps = {
  className?: string;
};

export function BrasovMap({ className }: BrasovMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let map: import("maplibre-gl").Map | undefined;

    void (async () => {
      // Importăm doar în browser; folosim exporturile denumite (nu există `default`).
      const maplibregl = await import("maplibre-gl");
      if (cancelled) return;

      const instance = new maplibregl.Map({
        container,
        style: MAP_STYLE_URL,
        center: BRASOV_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxBounds: BRASOV_BOUNDS,
        attributionControl: false,
      });

      map = instance;

      // Stilul OpenFreeMap conține deja atribuirea cerută; nu o dublăm prin customAttribution.
      instance.addControl(new maplibregl.AttributionControl({ compact: false }), "bottom-right");
      instance.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      instance.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
        }),
        "bottom-right",
      );

      instance.once("load", () => {
        if (!cancelled) setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* .maplibregl-map forțează position: relative, deci întindem containerul cu h-full, nu cu inset-0. */}
      <div ref={containerRef} data-testid="map-canvas" className="h-full w-full" />
      {!ready && (
        <p
          role="status"
          className="text-muted-foreground absolute inset-0 flex items-center justify-center text-sm"
        >
          {t.map.loading}
        </p>
      )}
    </div>
  );
}
