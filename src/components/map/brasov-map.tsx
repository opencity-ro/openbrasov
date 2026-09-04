"use client";

import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

import { t } from "@/lib/messages";
import { cn } from "@/lib/utils";

import { MapControls } from "./controls/map-controls";
import { applyThreeDLayers, enterThreeD, exitThreeD } from "./map-3d";
import { BRASOV_BOUNDS, BRASOV_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL, MIN_ZOOM } from "./map-config";
import { MapProvider } from "./map-context";
import { applyMapTheme, type MapThemeName, PALETTES } from "./map-theme";

type BrasovMapProps = {
  className?: string;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BrasovMap({ className }: BrasovMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [is3d, setIs3d] = useState(false);

  const { resolvedTheme } = useTheme();
  const theme: MapThemeName = resolvedTheme === "dark" ? "dark" : "light";

  /** Stilul brut de la OpenFreeMap, păstrat ca să îl re-colorăm fără să îl re-descărcăm. */
  const baseStyleRef = useRef<StyleSpecification | null>(null);
  const appliedThemeRef = useRef<MapThemeName | null>(null);

  /**
   * Harta se creează o singură dată, dar `resolvedTheme` se lămurește abia după
   * hidratare. Ținem tema într-un ref ca efectul de montare să o citească la zi,
   * fără să depindă de ea și să reconstruiască harta la fiecare comutare.
   */
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let instance: MapLibreMap | undefined;

    void (async () => {
      // Importăm doar în browser; folosim exporturile denumite (nu există `default`).
      const [maplibregl, baseStyle] = await Promise.all([
        import("maplibre-gl"),
        fetch(MAP_STYLE_URL).then((response) => response.json() as Promise<StyleSpecification>),
      ]);
      if (cancelled) return;

      baseStyleRef.current = baseStyle;
      appliedThemeRef.current = themeRef.current;

      instance = new maplibregl.Map({
        container,
        style: applyMapTheme(baseStyle, PALETTES[themeRef.current]),
        center: BRASOV_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        maxBounds: BRASOV_BOUNDS,
        // Harta pornește plată; înclinarea se deschide odată cu modul 3D.
        maxPitch: 0,
        attributionControl: false,
      });

      instance.once("load", () => {
        if (!cancelled) setMap(instance ?? null);
      });
    })();

    return () => {
      cancelled = true;
      setMap(null);
      instance?.remove();
    };
  }, []);

  // Schimbarea temei re-colorează stilul existent. `diff: true` păstrează camera,
  // sursele și, cu ele, relieful încărcat.
  useEffect(() => {
    const baseStyle = baseStyleRef.current;
    if (!map || !baseStyle || appliedThemeRef.current === theme) return;

    appliedThemeRef.current = theme;
    map.setStyle(applyMapTheme(baseStyle, PALETTES[theme], { buildings3d: is3d }), { diff: true });

    if (is3d) {
      map.once("styledata", () => applyThreeDLayers(map, theme));
    }
  }, [map, theme, is3d]);

  const toggle3d = useCallback(() => {
    if (!map) return;

    const animate = !prefersReducedMotion();
    const next = !is3d;
    setIs3d(next);

    if (next) enterThreeD(map, theme, animate);
    else exitThreeD(map, animate);
  }, [map, theme, is3d]);

  return (
    <div className={cn("bg-muted relative", className)}>
      {/* .maplibregl-map forțează position: relative, deci întindem containerul cu h-full, nu cu inset-0. */}
      <div ref={containerRef} data-testid="map-canvas" className="h-full w-full" />

      <MapProvider value={map}>
        <MapControls is3d={is3d} canToggle3d={Boolean(map)} onToggle3d={toggle3d} />
      </MapProvider>

      {!map && (
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
