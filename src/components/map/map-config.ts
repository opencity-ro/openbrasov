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

/** Relieful trece prin ruta noastră, care adaugă CORS-ul lipsă de la sursă. */
export const RELIEF_TILE_URL = "/api/relief/{z}/{x}/{y}";

/** Camera în modul 3D: destul cât să se vadă volumele, nu cât să se piardă orașul. */
export const MAX_PITCH = 68;
export const PITCHED_VIEW = { pitch: 58, bearing: -18, zoom: 15.4 } as const;
export const FLAT_VIEW = { pitch: 0, bearing: 0 } as const;

/** Durata trecerii 2D ↔ 3D. Ieșirea e mai scurtă decât intrarea, ca să pară promptă. */
export const PITCH_ENTER_MS = 1600;
export const PITCH_EXIT_MS = 1000;

/** Înălțarea clădirilor pornește după ce camera s-a mișcat destul cât să se vadă. */
export const BUILDING_RISE_DELAY_MS = 350;
export const BUILDING_RISE_MS = 900;
