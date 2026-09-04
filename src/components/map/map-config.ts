/** [lng, lat] — zona Pieței Sfatului. */
export const BRASOV_CENTER: [number, number] = [25.5887, 45.6427];

/**
 * Zona metropolitană: Codlea/Ghimbav (V) → Săcele (E), Râșnov (S) → Bod (N).
 * E punctul de plecare al hărții, nu o limită: navigarea rămâne liberă în lume.
 */
export const BRASOV_BOUNDS: [[number, number], [number, number]] = [
  [25.35, 45.5],
  [25.85, 45.78],
];

/** Deschidem pe orașul întreg, cu zona metropolitană în cadru. */
export const DEFAULT_ZOOM = 12;
export const MIN_ZOOM = 3;

export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** Textul de atribuire pe care îl livrează stilul OpenFreeMap; folosit în teste. */
export const MAP_ATTRIBUTION = "OpenFreeMap";

/** Relieful trece prin ruta noastră, care adaugă CORS-ul lipsă de la sursă. */
export const RELIEF_TILE_URL = "/api/relief/{z}/{x}/{y}";

/**
 * Camera în relief: schimbăm doar înclinarea. Orice atingere a centrului, a
 * zoom-ului sau a orientării mută harta de sub degetul omului.
 */
export const MAX_PITCH = 68;
export const PITCHED_ANGLE = 55;

/** Durata trecerii plat ↔ relief. Ieșirea e mai scurtă, ca să pară promptă. */
export const PITCH_ENTER_MS = 1200;
export const PITCH_EXIT_MS = 750;

/** Cât ține apariția clădirilor după ce camera a pornit. */
export const BUILDING_RISE_DELAY_MS = 200;
export const BUILDING_RISE_MS = 700;
