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

/** Cât ținem cadrul cel mult, în cadre; peste asta lăsăm harta în pace. */
const HOLD_MAX_FRAMES = 240;

/**
 * Cadrele din față pe care nu ne bazăm. Chiar după `setTerrain`, sursa de
 * elevație nu are încă nimic de cerut înregistrat, așa că `isSourceLoaded`
 * răspunde „da" — nu pentru că dalele au sosit, ci pentru că nu s-a cerut nimic.
 * Abia după ce MapLibre a redesenat o dată apar cererile. Așa se năștea saltul
 * „o singură dată pe poziție": a doua oară dalele erau deja în memorie.
 */
const HOLD_WARMUP_FRAMES = 3;

function sameView(map: MapLibreMap, view: View): boolean {
  const center = map.getCenter();
  return (
    Math.abs(map.getZoom() - view.zoom) < 1e-4 &&
    Math.abs(center.lng - view.center[0]) < 1e-7 &&
    Math.abs(center.lat - view.center[1]) < 1e-7
  );
}

/**
 * Ține cadrul pe loc până când camera nu mai fuge singură.
 *
 * Pământul ridicat urcă spre cameră, iar MapLibre recalculează centrul și
 * zoom-ul după altitudinea de sub centru — pe mai multe redesenări, pe măsură ce
 * sosesc dale. Repunem cadrul la fiecare cadru și ne oprim abia când sursa e
 * completă și două cadre la rând nu au avut nimic de corectat.
 *
 * Renunțăm la eroare pe sursă (în afara României nu există relief), la expirare,
 * și în clipa în care omul pune mâna pe hartă — atunci comanda e a lui.
 * Întoarce `false` doar când relieful nu a venit deloc.
 */
function holdView(
  map: MapLibreMap,
  session: Session,
  view: View,
  { needRelief, abandoned = () => false }: { needRelief: boolean; abandoned?: () => boolean },
): Promise<boolean> {
  return new Promise((resolve) => {
    let steady = 0;
    let frames = 0;
    let failed = false;
    let done = false;

    const onError = (event: { sourceId?: string }) => {
      if (event.sourceId === RELIEF_SOURCE_ID) failed = true;
    };
    map.on("error", onError);

    const finish = (withRelief: boolean) => {
      if (done) return;
      done = true;
      map.off("error", onError);
      resolve(withRelief);
    };
    session.detach.push(() => finish(true));

    const check = () => {
      if (!isCurrent(map, session) || abandoned()) return finish(true);
      if (failed) return finish(false);

      frames += 1;
      const ready = !needRelief || (frames > HOLD_WARMUP_FRAMES && isReliefLoaded(map));

      steady = ready && sameView(map, view) ? steady + 1 : 0;
      if (steady < 2) map.jumpTo(view);

      if (steady >= 2) return finish(true);
      if (frames >= HOLD_MAX_FRAMES) return finish(!needRelief);
      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
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
    // Înclinarea cere dale noi; ținem cadrul până se liniștește și după ele.
    void holdView(map, session, view, { needRelief: false, abandoned: () => touched }).then(() =>
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

  // Terenul se ridică pe harta încă plată, iar cadrul rămâne fixat cât curg
  // datele — și cât camera își ia altitudinea din ele, înainte de înclinare.
  map.setTerrain({ source: RELIEF_SOURCE_ID, exaggeration: 1 });
  map.jumpTo(view);

  const withRelief = await holdView(map, session, view, { needRelief: true });
  if (!isCurrent(map, session)) return withRelief;
  if (!withRelief) map.setTerrain(null);

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
    void holdView(map, session, view, { needRelief: false });
  });
}
