/** [lng, lat] — zona Pieței Sfatului. */
export const BRASOV_CENTER: [number, number] = [25.5887, 45.6427];

/** Zona metropolitană: Codlea/Ghimbav (V) → Săcele (E), Râșnov (S) → Bod (N). */
export const BRASOV_BOUNDS: [[number, number], [number, number]] = [
  [25.35, 45.5],
  [25.85, 45.78],
];

export const DEFAULT_ZOOM = 13;
export const MIN_ZOOM = 10;

export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** Textul de atribuire pe care îl livrează stilul OpenFreeMap; folosit în teste. */
export const MAP_ATTRIBUTION = "OpenFreeMap";
