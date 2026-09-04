"use client";

import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import "maplibre-gl/dist/maplibre-gl.css";

import { t } from "@/lib/messages";
import { cn } from "@/lib/utils";

import { MapControls } from "./controls/map-controls";
import { applyThreeDLayers, enterThreeD, exitThreeD } from "./map-3d";
import { BRASOV_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL, MIN_ZOOM } from "./map-config";
import { MapProvider } from "./map-context";
import { buildMapStyle, type MapMode } from "./map-modes";
import { type MapThemeName, PALETTES } from "./map-theme";

type BrasovMapProps = {
  className?: string;
};

/** Serverul de dale, de fonturi și de sprite-uri; deschidem conexiunea din timp. */
const TILE_ORIGIN = "https://tiles.openfreemap.org";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BrasovMap({ className }: BrasovMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);
  const [mode, setMode] = useState<MapMode>("standard");
  const [is3d, setIs3d] = useState(false);

  const { resolvedTheme } = useTheme();
  const theme: MapThemeName = resolvedTheme === "dark" ? "dark" : "light";

  /** Stilul brut de la OpenFreeMap, păstrat ca să îl recompunem fără să îl re-descărcăm. */
  const baseStyleRef = useRef<StyleSpecification | null>(null);
  const appliedRef = useRef<{ theme: MapThemeName; mode: MapMode } | null>(null);

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
      // Biblioteca și stilul se cer în paralel: sunt independente și amândouă
      // trebuie să fie gata înainte de primul cadru.
      const [maplibregl, baseStyle] = await Promise.all([
        import("maplibre-gl"),
        fetch(MAP_STYLE_URL).then((response) => response.json() as Promise<StyleSpecification>),
      ]);
      if (cancelled) return;

      baseStyleRef.current = baseStyle;
      appliedRef.current = { theme: themeRef.current, mode: "standard" };

      instance = new maplibregl.Map({
        container,
        style: buildMapStyle(baseStyle, { mode: "standard", palette: PALETTES[themeRef.current] }),
        center: BRASOV_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: MIN_ZOOM,
        // Harta pornește plată; înclinarea se deschide odată cu relieful.
        maxPitch: 0,
        attributionControl: false,
        // Implicit 300ms; mai scurt, etichetele apar odată cu dalele, nu după ele.
        fadeDuration: 120,
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

  // Tema și modul recompun stilul din același stil de bază. `diff: true` păstrează
  // camera și sursele deja încărcate, inclusiv relieful.
  useEffect(() => {
    const baseStyle = baseStyleRef.current;
    const applied = appliedRef.current;
    if (!map || !baseStyle) return;
    if (applied && applied.theme === theme && applied.mode === mode) return;

    appliedRef.current = { theme, mode };
    map.setStyle(buildMapStyle(baseStyle, { mode, palette: PALETTES[theme], buildings3d: is3d }), {
      diff: true,
    });

    if (is3d) {
      map.once("styledata", () => applyThreeDLayers(map, theme));
    }
  }, [map, theme, mode, is3d]);

  const toggle3d = useCallback(() => {
    if (!map) return;

    const animate = !prefersReducedMotion();
    const next = !is3d;
    setIs3d(next);

    if (!next) {
      exitThreeD(map, animate);
      return;
    }

    void enterThreeD(map, theme, animate).then((withRelief) => {
      if (!withRelief) toast.info(t.map.reliefUnavailable);
    });
  }, [map, theme, is3d]);

  return (
    <div className={cn("bg-muted relative", className)}>
      <link rel="preconnect" href={TILE_ORIGIN} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={TILE_ORIGIN} />

      {/* .maplibregl-map forțează position: relative, deci întindem containerul cu h-full, nu cu inset-0. */}
      <div ref={containerRef} data-testid="map-canvas" className="h-full w-full" />

      <MapProvider value={map}>
        <MapControls
          ready={Boolean(map)}
          mode={mode}
          onSelectMode={setMode}
          is3d={is3d}
          onToggle3d={toggle3d}
        />
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
