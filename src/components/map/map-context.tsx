"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { createContext, useCallback, useContext, useRef, useSyncExternalStore } from "react";

const MapContext = createContext<MapLibreMap | null>(null);

export const MapProvider = MapContext.Provider;

/** `null` cât timp harta încă se încarcă; controalele se dezactivează singure. */
export function useMapInstance(): MapLibreMap | null {
  return useContext(MapContext);
}

export type MapView = {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  bearing: number;
  pitch: number;
};

function readView(map: MapLibreMap): MapView {
  return {
    zoom: map.getZoom(),
    minZoom: map.getMinZoom(),
    maxZoom: map.getMaxZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
}

/**
 * Camera hărții e o stare din afara React-ului, deci o citim prin
 * `useSyncExternalStore`. Ținem ultimul instantaneu în cache: fără el, fiecare
 * citire ar întoarce un obiect nou și React ar re-randa la nesfârșit.
 */
export function useMapView(map: MapLibreMap | null): MapView | null {
  const cache = useRef<{ map: MapLibreMap | null; view: MapView | null }>({
    map: null,
    view: null,
  });

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!map) return () => {};

      const handle = () => {
        cache.current = { map: null, view: null };
        onChange();
      };

      // `move` acoperă zoom, rotire și înclinare; `resize` schimbă doar pânza.
      map.on("move", handle);
      map.on("resize", handle);
      return () => {
        map.off("move", handle);
        map.off("resize", handle);
      };
    },
    [map],
  );

  const getSnapshot = useCallback(() => {
    if (!map) return null;
    if (cache.current.map !== map || !cache.current.view) {
      cache.current = { map, view: readView(map) };
    }
    return cache.current.view;
  }, [map]);

  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
