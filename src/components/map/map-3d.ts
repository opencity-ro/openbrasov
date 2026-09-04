import type { Map as MapLibreMap, SkySpecification } from "maplibre-gl";

import {
  BUILDING_RISE_DELAY_MS,
  BUILDING_RISE_MS,
  FLAT_VIEW,
  MAX_PITCH,
  PITCH_ENTER_MS,
  PITCH_EXIT_MS,
  PITCHED_VIEW,
  RELIEF_TILE_URL,
} from "./map-config";
import { BUILDING_3D_LAYER, type MapThemeName } from "./map-theme";
import { RELIEF_MAX_ZOOM, RELIEF_MIN_ZOOM } from "@/lib/map/relief-tiles";

export const RELIEF_SOURCE_ID = "brasov-relief";

/** Ieșire exponențială: pornește repede, se așază lin. Curba camerelor de hartă. */
export function easeOutExpo(progress: number): number {
  return progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
}

/**
 * Cerul și ceața. În lumină, un albastru care se stinge spre orizont; noaptea,
 * un albastru-verde închis, ca linia munților să nu taie brusc în negru.
 */
export function skyFor(theme: MapThemeName): SkySpecification {
  return theme === "dark"
    ? {
        "sky-color": "#0a1119",
        "sky-horizon-blend": 0.55,
        "horizon-color": "#16232b",
        "horizon-fog-blend": 0.6,
        "fog-color": "#0e1512",
        "fog-ground-blend": 0.7,
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.9, 12, 0.4, 16, 0],
      }
    : {
        "sky-color": "#a5c8e6",
        "sky-horizon-blend": 0.5,
        "horizon-color": "#dde8f1",
        "horizon-fog-blend": 0.55,
        "fog-color": "#eef1ec",
        "fog-ground-blend": 0.72,
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.85, 12, 0.35, 16, 0],
      };
}

/**
 * Clădirile cresc din pământ pe măsură ce camera se apropie. Interpolarea pe zoom
 * face creșterea gratuită: o calculează GPU-ul, nu un `requestAnimationFrame`.
 */
const BUILDING_HEIGHT = [
  "interpolate",
  ["linear"],
  ["zoom"],
  14.4,
  0,
  15.6,
  ["get", "render_height"],
];

const BUILDING_BASE = [
  "interpolate",
  ["linear"],
  ["zoom"],
  14.4,
  0,
  15.6,
  ["get", "render_min_height"],
];

function hasBuildingLayer(map: MapLibreMap): boolean {
  return Boolean(map.getLayer(BUILDING_3D_LAYER));
}

function addReliefSource(map: MapLibreMap): void {
  if (map.getSource(RELIEF_SOURCE_ID)) return;

  map.addSource(RELIEF_SOURCE_ID, {
    type: "raster-dem",
    tiles: [RELIEF_TILE_URL],
    tileSize: 256,
    encoding: "terrarium",
    minzoom: RELIEF_MIN_ZOOM,
    maxzoom: RELIEF_MAX_ZOOM,
    attribution: "Relief: Terrain Tiles (AWS Open Data)",
  });
}

/**
 * Aplică starea 3D pe stilul curent. Se cheamă și după schimbarea temei, pentru că
 * un stil nou vine cu straturile resetate.
 */
export function applyThreeDLayers(map: MapLibreMap, theme: MapThemeName): void {
  addReliefSource(map);
  map.setSky(skyFor(theme));
  map.setTerrain({ source: RELIEF_SOURCE_ID, exaggeration: 1.2 });

  if (!hasBuildingLayer(map)) return;

  map.setLayoutProperty(BUILDING_3D_LAYER, "visibility", "visible");
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-vertical-gradient", true);
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-height", BUILDING_HEIGHT);
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-base", BUILDING_BASE);
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity-transition", {
    duration: BUILDING_RISE_MS,
    delay: BUILDING_RISE_DELAY_MS,
  });
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity", 0.92);
}

export function removeThreeDLayers(map: MapLibreMap): void {
  map.setTerrain(null);
  // MapLibre nu are „scoate cerul"; îi stingem atmosfera, iar pe harta plată
  // orizontul oricum nu se mai desenează.
  map.setSky({ "atmosphere-blend": 0 });

  if (!hasBuildingLayer(map)) return;
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity", 0);
  map.setLayoutProperty(BUILDING_3D_LAYER, "visibility", "none");
}

/**
 * Intrarea în 3D: relieful și cerul apar întâi, apoi camera se ridică. Ordinea
 * contează — dacă înclini înainte să existe teren, orizontul sare vizibil.
 */
export function enterThreeD(map: MapLibreMap, theme: MapThemeName, animate: boolean): void {
  map.setMaxPitch(MAX_PITCH);
  applyThreeDLayers(map, theme);

  map.easeTo({
    pitch: PITCHED_VIEW.pitch,
    bearing: PITCHED_VIEW.bearing,
    zoom: Math.max(map.getZoom(), PITCHED_VIEW.zoom),
    duration: animate ? PITCH_ENTER_MS : 0,
    easing: easeOutExpo,
  });
}

/** Ieșirea: camera coboară prima, straturile pleacă după ce nu se mai văd. */
export function exitThreeD(map: MapLibreMap, animate: boolean): () => void {
  if (hasBuildingLayer(map)) {
    map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity-transition", {
      duration: PITCH_EXIT_MS * 0.6,
      delay: 0,
    });
    map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity", 0);
  }

  map.easeTo({ ...FLAT_VIEW, duration: animate ? PITCH_EXIT_MS : 0, easing: easeOutExpo });

  const timer = setTimeout(
    () => {
      removeThreeDLayers(map);
      map.setMaxPitch(0);
    },
    animate ? PITCH_EXIT_MS : 0,
  );

  return () => clearTimeout(timer);
}
