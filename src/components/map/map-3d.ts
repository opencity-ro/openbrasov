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

/** Cât așteptăm datele de elevație înainte să continuăm fără ele. */
const RELIEF_SETTLE_TIMEOUT_MS = 3000;

/**
 * O comutare 3D lasă în urmă cronometre și ascultători care se termină după ce
 * s-a apăsat din nou. Fără o sesiune care le anulează, apăsarea a doua prinde
 * curățenia celei dintâi: terenul dispare în plină ridicare a camerei, cadrul e
 * fixat pe un instantaneu de la mijlocul animației și harta intră în clădiri.
 */
type Session = { timers: number[]; detach: (() => void)[] };

const sessions = new WeakMap<MapLibreMap, Session>();

function startSession(map: MapLibreMap): Session {
  const previous = sessions.get(map);
  if (previous) {
    previous.timers.forEach(window.clearTimeout);
    previous.detach.forEach((stop) => stop());
  }

  const session: Session = { timers: [], detach: [] };
  sessions.set(map, session);
  return session;
}

function isCurrent(map: MapLibreMap, session: Session): boolean {
  return sessions.get(map) === session;
}

function later(map: MapLibreMap, session: Session, delay: number, run: () => void): void {
  session.timers.push(
    window.setTimeout(() => {
      if (isCurrent(map, session)) run();
    }, delay),
  );
}

type View = { center: [number, number]; zoom: number; bearing: number };

function readView(map: MapLibreMap): View {
  const { lng, lat } = map.getCenter();
  return { center: [lng, lat], zoom: map.getZoom(), bearing: map.getBearing() };
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

function showBuildings(map: MapLibreMap): void {
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

function isReliefLoaded(map: MapLibreMap): boolean {
  return Boolean(map.getSource(RELIEF_SOURCE_ID)) && map.isSourceLoaded(RELIEF_SOURCE_ID);
}

/** Cadrele peste care renunțăm să mai așteptăm așezarea camerei. */
const STABILISE_MAX_FRAMES = 40;

function sameView(map: MapLibreMap, view: View): boolean {
  const center = map.getCenter();
  return (
    Math.abs(map.getZoom() - view.zoom) < 1e-4 &&
    Math.abs(center.lng - view.center[0]) < 1e-7 &&
    Math.abs(center.lat - view.center[1]) < 1e-7
  );
}

/**
 * Așteaptă până camera nu mai fuge singură.
 *
 * Nu e destul ca dalele de elevație să fi sosit: MapLibre își recalculează
 * centrul și zoom-ul din altitudinea terenului, iar recalculul acela se întinde
 * pe mai multe redesenări, pe măsură ce sosesc dale noi. Verificăm la fiecare
 * cadru dacă unde s-a oprit e unde am cerut, și repunem cadrul dacă nu — până
 * când două cadre la rând nu mai au nimic de corectat.
 */
function stabiliseView(
  map: MapLibreMap,
  session: Session,
  view: View,
  abandoned: () => boolean = () => false,
): Promise<void> {
  return new Promise((resolve) => {
    let steady = 0;
    let frames = 0;

    const check = () => {
      if (!isCurrent(map, session) || abandoned()) return resolve();

      steady = sameView(map, view) ? steady + 1 : 0;
      if (steady < 2) map.jumpTo(view);

      frames += 1;
      if (steady >= 2 || frames >= STABILISE_MAX_FRAMES) return resolve();
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
}

/**
 * Ține cadrul fixat cât curg datele de elevație. Pământul ridicat urcă spre
 * cameră, iar MapLibre recalculează centrul și zoom-ul după noua altitudine —
 * care se află abia când sosesc dalele. Ne oprim când sursa e completă, la
 * eroare, la expirare, sau imediat ce omul pune mâna pe hartă: atunci comanda
 * e a lui, nu a noastră.
 */
function settleRelief(map: MapLibreMap, session: Session, view: View): Promise<boolean> {
  if (isReliefLoaded(map)) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;

    const finish = (withRelief: boolean) => {
      if (settled) return;
      settled = true;
      map.off("sourcedata", onSourceData);
      map.off("error", onError);
      map.off("movestart", onUserMove);
      window.clearTimeout(timer);
      resolve(withRelief);
    };

    session.detach.push(() => finish(false));

    const onSourceData = (event: { sourceId?: string }) => {
      if (event.sourceId !== RELIEF_SOURCE_ID) return;
      map.jumpTo(view);
      if (isReliefLoaded(map)) finish(true);
    };

    const onError = (event: { sourceId?: string }) => {
      if (event.sourceId === RELIEF_SOURCE_ID) finish(false);
    };

    const onUserMove = (event: { originalEvent?: unknown }) => {
      if (event.originalEvent) finish(true);
    };

    const timer = window.setTimeout(() => finish(false), RELIEF_SETTLE_TIMEOUT_MS);

    map.on("sourcedata", onSourceData);
    map.on("error", onError);
    map.on("movestart", onUserMove);
  });
}

/**
 * Reașază relieful pe un stil proaspăt — după schimbarea temei sau a modului,
 * când straturile vin resetate. Exagerarea rămâne 1: peste ea, MapLibre pierde
 * centrul și zoom-ul la rotire.
 */
export function applyThreeDLayers(map: MapLibreMap, theme: MapThemeName): void {
  const view = readView(map);
  addReliefSource(map);
  map.setSky(skyFor(theme));
  map.setTerrain({ source: RELIEF_SOURCE_ID, exaggeration: 1 });
  map.jumpTo(view);
  showBuildings(map);
}

export function removeThreeDLayers(map: MapLibreMap): void {
  const view = readView(map);
  map.setTerrain(null);
  map.jumpTo(view);
  // MapLibre nu are „scoate cerul"; îi stingem atmosfera, iar pe harta plată
  // orizontul oricum nu se mai desenează.
  map.setSky({ "atmosphere-blend": 0 });

  if (!hasBuildingLayer(map)) return;
  map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity", 0);
  map.setLayoutProperty(BUILDING_3D_LAYER, "visibility", "none");
}

/**
 * Intrarea în relief. Ordinea e toată ideea: straturile se așază pe harta încă
 * plată, elevația se lasă să se așeze cu cadrul fixat, și abia apoi se ridică
 * înclinarea. Nimic altceva nu se mișcă — nici centrul, nici zoom-ul, nici
 * orientarea.
 *
 * Întoarce `false` dacă elevația nu a venit: clădirile rămân ridicate, munții nu.
 */
/**
 * Înclină camera și, la capăt, pune înapoi exact centrul, zoom-ul și orientarea
 * de la început.
 *
 * Fără reașezarea asta, fiecare comutare lăsa în urmă o mică abatere: cu teren
 * activ, MapLibre recalculează zoom-ul și centrul din altitudinea terenului la
 * sfârșitul fiecărei mișcări, ca să țină camera la aceeași înălțime deasupra
 * pământului. Abaterea se aduna de la o apăsare la alta, iar la a treia camera
 * ajungea în clădiri. Renunțăm dacă omul apucă harta între timp — atunci cadrul
 * pe care l-am reține nu mai e cel pe care îl vrea el.
 */
function tiltTo(map: MapLibreMap, session: Session, view: View, pitch: number, duration: number) {
  let touched = false;
  const onUserMove = (event: { originalEvent?: unknown }) => {
    if (event.originalEvent) touched = true;
  };

  map.on("movestart", onUserMove);
  session.detach.push(() => map.off("movestart", onUserMove));

  map.easeTo({ pitch, duration, easing: easeOutExpo });

  map.once("moveend", () => {
    if (!isCurrent(map, session) || touched) {
      map.off("movestart", onUserMove);
      return;
    }
    // Terenul poate încă să sosească; ținem cadrul până se liniștește.
    void stabiliseView(map, session, view, () => touched).then(() =>
      map.off("movestart", onUserMove),
    );
  });
}

export async function enterThreeD(
  map: MapLibreMap,
  theme: MapThemeName,
  animate: boolean,
): Promise<boolean> {
  const session = startSession(map);
  const view = readView(map);

  map.setMaxPitch(MAX_PITCH);
  map.setSky(skyFor(theme));
  showBuildings(map);
  addReliefSource(map);

  // Terenul se ridică pe harta încă plată, iar cadrul rămâne fixat cât curg datele.
  map.setTerrain({ source: RELIEF_SOURCE_ID, exaggeration: 1 });
  map.jumpTo(view);

  const withRelief = await settleRelief(map, session, view);
  if (!isCurrent(map, session)) return withRelief;

  if (!withRelief) {
    map.setTerrain(null);
  }

  // Lăsăm camera să-și ia altitudinea din teren înainte să pornim înclinarea.
  await stabiliseView(map, session, view);
  if (!isCurrent(map, session)) return withRelief;

  map.jumpTo(view);
  tiltTo(map, session, view, PITCHED_ANGLE, animate ? PITCH_ENTER_MS : 0);

  return withRelief;
}

/** Ieșirea: camera coboară prima, straturile pleacă după ce nu se mai văd. */
export function exitThreeD(map: MapLibreMap, animate: boolean): void {
  const session = startSession(map);
  const view = readView(map);

  if (hasBuildingLayer(map)) {
    map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity-transition", {
      duration: Math.round(PITCH_EXIT_MS * 0.6),
      delay: 0,
    });
    map.setPaintProperty(BUILDING_3D_LAYER, "fill-extrusion-opacity", 0);
  }

  tiltTo(map, session, view, 0, animate ? PITCH_EXIT_MS : 0);

  later(map, session, animate ? PITCH_EXIT_MS : 0, () => {
    removeThreeDLayers(map);
    map.setMaxPitch(0);
    // Scoaterea terenului readuce solul la nivelul mării și mută iar camera.
    void stabiliseView(map, session, view);
  });
}
