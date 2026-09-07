import "server-only";

import { VectorTile } from "@mapbox/vector-tile";
import { PbfReader } from "pbf";

import { LANDMARK_FAR_M, type Candidate } from "./landmarks";

/**
 * Reperele din jurul unui punct, citite din chiar dalele hărții pe care le
 * servim oricum vizitatorului.
 *
 * Sunt aceleași locuri pe care omul le vede scrise pe ecran — stadionul,
 * parcul, școala — deci adresa spune exact ce se vede. Nu e niciun serviciu în
 * plus de care să depindem: dala e una singură, mică, iar rețeaua de livrare o
 * ține deja pregătită fiindcă harta a cerut-o cu o clipă înainte.
 *
 * Am încercat mai întâi un serviciu public de interogare a hărții. Răspundea în
 * zece secunde într-un cartier plin, refuza cererile prea dese, iar la un moment
 * dat n-a mai răspuns deloc — iar atunci fiecare sesizare fără stradă ar fi rămas
 * cu un cod în loc de adresă.
 */

const TILEJSON_URL = "https://tiles.openfreemap.org/planet";

/** Ultimul nivel la care dalele mai există. Sub el, punctele de interes lipsesc. */
const ZOOM = 14;

/**
 * Straturile din care poate ieși un reper. Vin toate în aceeași dală, deja
 * descărcată, deci citirea lor nu costă nimic în plus.
 *
 * Drumurile intră la urmă și numai ca ultimă soluție: în oraș strada se află
 * altfel, dar pe un deal „lângă Aleea Dealul Spirii" e tot ce se poate spune, și
 * e mai mult decât un cod.
 */
const LAYERS = ["poi", "mountain_peak", "park", "water_name", "waterway", "transportation_name"];

const EARTH_RADIUS_M = 6_371_000;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Adresa dalelor își poartă data în ea și se schimbă la fiecare actualizare a
 * hărții, deci se citește din descrierea sursei. O ținem minte cât trăiește
 * procesul: e același răspuns pentru toată lumea.
 */
let tileUrl: Promise<string | null> | null = null;

function readTileUrl(): Promise<string | null> {
  tileUrl ??= fetch(TILEJSON_URL, { signal: AbortSignal.timeout(6000) })
    .then((response) => (response.ok ? response.json() : null))
    .then((body: { tiles?: string[] } | null) => body?.tiles?.[0] ?? null)
    .catch(() => null);
  return tileUrl;
}

const tileX = (longitude: number) => Math.floor(((longitude + 180) / 360) * 2 ** ZOOM);

function tileY(latitude: number): number {
  const sin = Math.sin(toRadians(latitude));
  return Math.floor((0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 2 ** ZOOM);
}

function metresBetween(lat: number, lng: number, otherLat: number, otherLng: number): number {
  const north = toRadians(otherLat - lat) * EARTH_RADIUS_M;
  const east = toRadians(otherLng - lng) * EARTH_RADIUS_M * Math.cos(toRadians(lat));
  return Math.hypot(north, east);
}

/**
 * Dalele de care avem nevoie: cea în care cade punctul și, dacă punctul stă
 * aproape de margine, vecinele care mai pot ține repere în rază.
 *
 * O dală acoperă vreo doi kilometri pe aici, deci de obicei e una singură. Dar o
 * sesizare chiar pe margine ar fi rămas fără stadionul de dincolo de linie, iar
 * linia aia nu există pentru nimeni în afară de hartă.
 */
function tilesAround(latitude: number, longitude: number): Array<[number, number]> {
  const metresPerDegreeLng = (EARTH_RADIUS_M * Math.PI * Math.cos(toRadians(latitude))) / 180;
  const reachLng = LANDMARK_FAR_M / metresPerDegreeLng;
  const reachLat = LANDMARK_FAR_M / ((EARTH_RADIUS_M * Math.PI) / 180);

  const x = tileX(longitude);
  const y = tileY(latitude);
  const tiles = new Set<string>();

  for (const cornerLng of [longitude - reachLng, longitude, longitude + reachLng]) {
    for (const cornerLat of [latitude - reachLat, latitude, latitude + reachLat]) {
      tiles.add(`${tileX(cornerLng)},${tileY(cornerLat)}`);
    }
  }
  tiles.add(`${x},${y}`);

  return [...tiles].map((key) => key.split(",").map(Number) as [number, number]);
}

async function readTile(url: string, x: number, y: number): Promise<VectorTile | null> {
  try {
    const response = await fetch(
      url.replace("{z}", String(ZOOM)).replace("{x}", String(x)).replace("{y}", String(y)),
      { signal: AbortSignal.timeout(6000) },
    );
    if (!response.ok) return null;
    return new VectorTile(new PbfReader(new Uint8Array(await response.arrayBuffer())));
  } catch {
    return null;
  }
}

/** Un punct de interes poate fi desenat ca punct, ca linie sau ca suprafață. */
function firstPosition(coordinates: unknown): [number, number] | null {
  let current = coordinates;
  while (Array.isArray(current) && Array.isArray(current[0])) current = current[0];
  return Array.isArray(current) && typeof current[0] === "number" && typeof current[1] === "number"
    ? [current[0], current[1]]
    : null;
}

/**
 * Reperele numite din jurul punctului. O listă goală înseamnă că nu e nimic de
 * care să te agăți — un răspuns la fel de bun ca oricare altul.
 *
 * Nicio defecțiune de aici nu lasă sesizarea fără adresă: dacă dala nu vine,
 * lista e goală și adresa cade pe codul locului.
 */
export async function landmarksAround(latitude: number, longitude: number): Promise<Candidate[]> {
  const url = await readTileUrl();
  if (!url) return [];

  const tiles = await Promise.all(
    tilesAround(latitude, longitude).map(async ([x, y]) => ({
      x,
      y,
      tile: await readTile(url, x, y),
    })),
  );

  const found: Candidate[] = [];
  for (const { x, y, tile } of tiles) {
    for (const layerName of LAYERS) {
      const layer = tile?.layers[layerName];
      if (!layer) continue;

      for (let index = 0; index < layer.length; index++) {
        const feature = layer.feature(index).toGeoJSON(x, y, ZOOM);
        const name = feature.properties?.name;
        if (typeof name !== "string" || !name.trim()) continue;

        const position = firstPosition(
          (feature.geometry as { coordinates?: unknown }).coordinates ?? null,
        );
        if (!position) continue;

        const distance = metresBetween(latitude, longitude, position[1], position[0]);
        if (distance > LANDMARK_FAR_M) continue;

        // `subclass` e eticheta din hartă — `stadium`, `park`, `bakery`. `class` e
        // gruparea lor, folosită doar când eticheta lipsește.
        const kind = feature.properties?.subclass ?? feature.properties?.class;
        found.push({ name: name.trim(), kind: typeof kind === "string" ? kind : "", distance });
      }
    }
  }

  return found;
}
