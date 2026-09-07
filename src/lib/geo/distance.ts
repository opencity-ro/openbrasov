/**
 * Cât de departe e un punct de forma găsită de serviciul de geocodare.
 *
 * Serviciul întoarce mereu cel mai apropiat lucru cu adresă, oricât de departe
 * ar fi el: pentru o sesizare din mijlocul pădurii de pe Tâmpa a scris „Strada
 * Panselelor, nr. 23", o casă aflată la o sută șaptezeci și cinci de metri.
 * Numai coordonatele răspunsului nu ajung ca să prinzi asta — pentru o stradă
 * ele arată mijlocul ei, care poate fi la un kilometru de capătul pe care stai —
 * deci măsurăm față de forma întreagă: linia străzii, conturul clădirii.
 */

type Position = readonly number[];
type Path = readonly Position[];
type Rings = readonly Path[];

export type Geometry =
  | { type: "Point"; coordinates: Position }
  | { type: "LineString"; coordinates: Path }
  | { type: "MultiLineString"; coordinates: readonly Path[] }
  | { type: "Polygon"; coordinates: Rings }
  | { type: "MultiPolygon"; coordinates: readonly Rings[] };

const EARTH_RADIUS_M = 6_371_000;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Coordonatele, aduse pe un plan cu metrul ca unitate, în jurul punctului nostru.
 *
 * La scara unui oraș greșeala e sub un metru, iar restul socotelii devine
 * geometrie de liceu în loc de trigonometrie sferică. Longitudinea se strânge cu
 * cosinusul latitudinii: la Brașov, un grad de longitudine e cu vreo treizeci la
 * sută mai scurt decât unul de latitudine.
 */
type Flat = [x: number, y: number];

function flatten(latitude: number, longitude: number, around: number): Flat {
  return [
    toRadians(longitude) * EARTH_RADIUS_M * Math.cos(toRadians(around)),
    toRadians(latitude) * EARTH_RADIUS_M,
  ];
}

/** Punctele din GeoJSON vin ca [longitudine, latitudine], în ordinea asta. */
const flattenPair = ([longitude, latitude]: Position, around: number): Flat =>
  flatten(latitude, longitude, around);

function toSegment(point: Flat, start: Flat, end: Flat): number {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lengthSquared = dx * dx + dy * dy;

  // Un segment de lungime zero e un punct: cădem pe distanța până la el.
  const along =
    lengthSquared === 0
      ? 0
      : Math.min(
          1,
          Math.max(0, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / lengthSquared),
        );

  return Math.hypot(point[0] - (start[0] + along * dx), point[1] - (start[1] + along * dy));
}

function toPath(point: Flat, path: Path, around: number): number {
  if (path.length === 0) return Infinity;
  const points = path.map((pair) => flattenPair(pair, around));
  if (points.length === 1) return Math.hypot(point[0] - points[0][0], point[1] - points[0][1]);

  let closest = Infinity;
  for (let i = 0; i + 1 < points.length; i++) {
    closest = Math.min(closest, toSegment(point, points[i], points[i + 1]));
  }
  return closest;
}

/** Raza care pornește din punct traversează conturul de un număr impar de ori. */
function inside(point: Flat, ring: Path, around: number): boolean {
  const points = ring.map((pair) => flattenPair(pair, around));
  let within = false;
  for (let i = 0, previous = points.length - 1; i < points.length; previous = i++) {
    const [x, y] = points[i];
    const [previousX, previousY] = points[previous];
    const crosses = y > point[1] !== previousY > point[1];
    if (crosses && point[0] < ((previousX - x) * (point[1] - y)) / (previousY - y) + x) {
      within = !within;
    }
  }
  return within;
}

const toPolygon = (point: Flat, rings: Rings, around: number): number =>
  rings.length > 0 && inside(point, rings[0], around) ? 0 : toPath(point, rings[0] ?? [], around);

/**
 * Distanța în metri de la punct până la formă, sau `null` dacă forma lipsește
 * ori vine într-un fel pe care nu-l cunoaștem. Un punct dinăuntrul unei
 * suprafețe — o pădure, o curte — e la distanța zero.
 */
export function distanceToGeometry(
  latitude: number,
  longitude: number,
  geometry: Geometry | null | undefined,
): number | null {
  if (!geometry) return null;
  const point = flatten(latitude, longitude, latitude);

  switch (geometry.type) {
    case "Point":
      return toPath(point, [geometry.coordinates], latitude);
    case "LineString":
      return toPath(point, geometry.coordinates, latitude);
    case "MultiLineString":
      return Math.min(...geometry.coordinates.map((line) => toPath(point, line, latitude)));
    case "Polygon":
      return toPolygon(point, geometry.coordinates, latitude);
    case "MultiPolygon":
      return Math.min(...geometry.coordinates.map((rings) => toPolygon(point, rings, latitude)));
    default:
      return null;
  }
}
