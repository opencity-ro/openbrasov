import type { Map as MapLibreMap, SkySpecification } from "maplibre-gl";

import { RELIEF_MAX_ZOOM, RELIEF_MIN_ZOOM } from "@/lib/map/relief-tiles";

import {
  BUILDING_RISE_DELAY_MS,
  BUILDING_RISE_MS,
  MAX_PITCH,
  PITCH_ENTER_MS,
  PITCH_EXIT_MS,
  PITCHED_ANGLE,
  RELIEF_TILE_URL,
} from "./map-config";
import { BUILDING_3D_LAYER, type MapThemeName } from "./map-theme";

export const RELIEF_SOURCE_ID = "relief";

/**
 * Terenul ridicat schimbă altitudinea punctului din centru, iar MapLibre reașază
 * camera după ea — de aici saltul la pornirea reliefului. Reținem cadrul înainte
 * și îl punem la loc după, ca omul să rămână exact unde se uita.
 */
function keepingTheView(map: MapLibreMap, change: () => void): void {
  const center = map.getCenter();
  const zoom = map.getZoom();
  const bearing = map.getBearing();

  change();

  map.jumpTo({ center, zoom, bearing });
}

/** Ieșire exponențială: pornește repede, se așază lin. Curba camerelor de hartă. */
export function easeOutExpo(progress: number): number {
  return progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
}

/**
 * Cerul și ceața. Ceața stă departe, spre orizont: trasă prea aproape, spală
 * orașul și se vede ca o pâclă peste tot.
 */
export function skyFor(theme: MapThemeName): SkySpecification {
  return theme === "dark"
    ? {
        "sky-color": "#151a22",
        "sky-horizon-blend": 0.6,
        "horizon-color": "#2b3038",
        "horizon-fog-blend": 0.5,
        "fog-color": "#2b3038",
        "fog-ground-blend": 0.92,
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.6, 11, 0.25, 14, 0],
      }
    : {
        "sky-color": "#a5c8e6",
        "sky-horizon-blend": 0.55,
        "horizon-color": "#dde8f1",
        "horizon-fog-blend": 0.5,
        "fog-color": "#eef1ec",
        "fog-ground-blend": 0.92,
        "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.6, 11, 0.25, 14, 0],
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
  14,
  0,
  15.2,
  ["get", "render_height"],
];

const BUILDING_BASE = [
  "interpolate",
  ["linear"],
  ["zoom"],
  14,
  0,
  15.2,
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
    attribution: "Terrain Tiles (AWS Open Data)",
  });
}

/**
 * Aplică starea de relief pe stilul curent. Se cheamă și după schimbarea temei
 * sau a modului, pentru că un stil nou vine cu straturile resetate.
 *
 * Exagerarea rămâne 1: peste ea, MapLibre pierde centrul și zoom-ul la rotire.
 */
export function applyThreeDLayers(map: MapLibreMap, theme: MapThemeName): void {
  addReliefSource(map);
  map.setSky(skyFor(theme));
  keepingTheView(map, () => map.setTerrain({ source: RELIEF_SOURCE_ID, exaggeration: 1 }));

  if (!hasBuildingLayer(map)) return;

  map.setLayoutProperty(BUILDING_3D_LAYER, "visibility", "visible");
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-vertical-gradient", true);
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-height", BUILDING_HEIGHT);
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-base", BUILDING_BASE);
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity-transition", {
    duration: BUILDING_RISE_MS,
    delay: BUILDING_RISE_DELAY_MS,
  });
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity", 0.94);
}

export function removeThreeDLayers(map: MapLibreMap): void {
  keepingTheView(map, () => map.setTerrain(null));
  // MapLibre nu are „scoate cerul"; îi stingem atmosfera, iar pe harta plată
  // orizontul oricum nu se mai desenează.
  map.setSky({ "atmosphere-blend": 0 });

  if (!hasBuildingLayer(map)) return;
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity", 0);
  map.setLayoutProperty(BUILDING_3D_LAYER, "visibility", "none");
}

/**
 * Intrarea în relief: straturile se așază pe harta încă plată, apoi camera se
 * ridică. Nimic altceva nu se mișcă — nici centrul, nici zoom-ul, nici orientarea.
 */
export function enterThreeD(map: MapLibreMap, theme: MapThemeName, animate: boolean): void {
  map.setMaxPitch(MAX_PITCH);
  applyThreeDLayers(map, theme);

  map.easeTo({
    pitch: PITCHED_ANGLE,
    duration: animate ? PITCH_ENTER_MS : 0,
    easing: easeOutExpo,
  });
}

/** Ieșirea: camera coboară prima, straturile pleacă după ce nu se mai văd. */
export function exitThreeD(map: MapLibreMap, animate: boolean): void {
  if (hasBuildingLayer(map)) {
    map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity-transition", {
      duration: Math.round(PITCH_EXIT_MS * 0.6),
      delay: 0,
    });
    map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity", 0);
  }

  map.easeTo({ pitch: 0, duration: animate ? PITCH_EXIT_MS : 0, easing: easeOutExpo });

  map.once("moveend", () => {
    removeThreeDLayers(map);
    map.setMaxPitch(0);
  });
}
