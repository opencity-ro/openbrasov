import { BRASOV_BOUNDS } from "@/components/map/map-config";

/**
 * Dalele de relief (Terrain Tiles, AWS Open Data) sunt gratuite, dar se servesc
 * fără antet CORS, deci WebGL nu le poate citi direct. Le trecem printr-o rută
 * proprie, care adaugă CORS-ul și le lasă în cache la CDN.
 */
export const RELIEF_TILE_ORIGIN = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium";

/** Sub 8 nu are sens relieful, peste 13 datele sursă devin repetitive. */
export const RELIEF_MIN_ZOOM = 8;
export const RELIEF_MAX_ZOOM = 13;

function lngToTileX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * 2 ** zoom;
}

function latToTileY(lat: number, zoom: number): number {
  const radians = (lat * Math.PI) / 180;
  const mercator = Math.log(Math.tan(radians) + 1 / Math.cos(radians));
  return ((1 - mercator / Math.PI) / 2) * 2 ** zoom;
}

/**
 * Fereastra de dale care acoperă zona metropolitană, cu o dală marjă de fiecare
 * parte. Fără ea, ruta ar fi un proxy deschis către întreaga planetă.
 */
export function reliefTileWindow(zoom: number) {
  const [[west, south], [east, north]] = BRASOV_BOUNDS;

  return {
    minX: Math.floor(lngToTileX(west, zoom)) - 1,
    maxX: Math.floor(lngToTileX(east, zoom)) + 1,
    minY: Math.floor(latToTileY(north, zoom)) - 1,
    maxY: Math.floor(latToTileY(south, zoom)) + 1,
  };
}

export function isReliefTileAllowed(zoom: number, x: number, y: number): boolean {
  if (!Number.isInteger(zoom) || !Number.isInteger(x) || !Number.isInteger(y)) return false;
  if (zoom < RELIEF_MIN_ZOOM || zoom > RELIEF_MAX_ZOOM) return false;

  const { minX, maxX, minY, maxY } = reliefTileWindow(zoom);
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}
