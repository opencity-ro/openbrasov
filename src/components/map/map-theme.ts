import type { StyleSpecification } from "maplibre-gl";

/**
 * Paleta hărții, pe roluri, nu pe straturi. Stilul Liberty are 111 de straturi;
 * le grupăm după ce reprezintă, ca schimbarea unei culori să nu ceară 20 de edituri.
 */
export type MapPalette = {
  background: string;
  water: string;
  waterway: string;
  park: string;
  wood: string;
  grass: string;
  wetland: string;
  sand: string;
  ice: string;
  residential: string;
  institutional: string;
  pitch: string;
  aeroway: string;
  building: string;
  buildingOutline: string;
  building3d: string;
  motorway: string;
  motorwayCasing: string;
  major: string;
  majorCasing: string;
  minor: string;
  minorCasing: string;
  path: string;
  rail: string;
  boundary: string;
  label: string;
  labelHalo: string;
  labelMuted: string;
  waterLabel: string;
  parkLabel: string;
  /** Opacitatea reliefului Natural Earth, vizibil doar sub zoom 7. */
  reliefOpacity: number;
};

/**
 * Ziua: ton cald și dens, tras spre verdele mărcii — uscat cald, apă potolită,
 * verdeață citibilă, drumuri albe cu contur discret.
 */
export const LIGHT_PALETTE: MapPalette = {
  background: "#f4f1eb",
  water: "#a7cbe0",
  waterway: "#93bcd6",
  park: "#dce8ce",
  wood: "#d3e1c2",
  grass: "#dfeacf",
  wetland: "#cfddcb",
  sand: "#efe6ce",
  ice: "#e8eef2",
  residential: "#ede9e1",
  institutional: "#e9e5dc",
  pitch: "#d8e4c8",
  aeroway: "#e7e3da",
  building: "#e6e1d7",
  buildingOutline: "#d9d3c6",
  building3d: "#e9e4da",
  motorway: "#fbe3be",
  motorwayCasing: "#e9c88e",
  major: "#ffffff",
  majorCasing: "#e0d9cb",
  minor: "#fbfaf7",
  minorCasing: "#e5dfd3",
  path: "#d9d2c4",
  rail: "#d2cbbe",
  boundary: "#c4bcad",
  label: "#3d4a43",
  labelHalo: "rgba(255, 255, 255, 0.92)",
  labelMuted: "#6b7a70",
  waterLabel: "#5c87a5",
  parkLabel: "#4f6b49",
  reliefOpacity: 0.35,
};

/**
 * Noaptea: ardezie albastru-cenușie, nu negru. Drumurile stau mai deschise decât
 * terenul, altfel orașul dispare; verdeața rămâne saturată ca să se citească
 * dealurile, iar apa păstrează destul albastru cât să rămână apă.
 */
export const DARK_PALETTE: MapPalette = {
  background: "#2b3038",
  water: "#1e2a36",
  waterway: "#2a3d4d",
  park: "#274a3a",
  wood: "#234433",
  grass: "#2a4d3c",
  wetland: "#283f3a",
  sand: "#3a3a33",
  ice: "#333e46",
  residential: "#2f343d",
  institutional: "#333842",
  pitch: "#2c4a3b",
  aeroway: "#31363f",
  building: "#363c46",
  buildingOutline: "#414854",
  building3d: "#3b414c",
  motorway: "#5a6270",
  motorwayCasing: "#6a7381",
  major: "#4c5460",
  majorCasing: "#5a626e",
  minor: "#414954",
  minorCasing: "#4b535f",
  path: "#454d58",
  rail: "#3a414b",
  boundary: "#4a525e",
  label: "#dbe1e9",
  labelHalo: "rgba(26, 30, 36, 0.85)",
  labelMuted: "#9aa4b2",
  waterLabel: "#7fa8c4",
  parkLabel: "#7cc4a0",
  reliefOpacity: 0.15,
};

export const PALETTES = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const;

export type MapThemeName = keyof typeof PALETTES;

type PaintPatch = Record<string, unknown>;

type LayerType = StyleSpecification["layers"][number]["type"];

type LayerRule = {
  /** Prima regulă care se potrivește câștigă, deci ordinea contează. */
  test: RegExp;
  /**
   * Tipul de strat pe care se aplică. Numele nu spune tipul: `waterway_line_label`
   * și `highway-name-minor` sunt etichete, nu linii, iar o proprietate de linie pe
   * un strat `symbol` face stilul invalid și harta nu mai pornește.
   */
  type: LayerType;
  paint: (palette: MapPalette) => PaintPatch;
  /** Mărimea și fontul stau în `layout`, nu în `paint`. */
  layout?: () => Record<string, unknown>;
  /**
   * Zoom-ul peste care stratul dispare. Numele orașului nu mai ajută pe nimeni
   * odată ce ești pe strada lui — acolo contează cartierul, nu localitatea.
   */
  maxzoom?: number;
};

/**
 * Culoarea etichetei spune categoria dintr-o privire, înainte să apuci să
 * citești numele. Aceleași tonuri în ambele teme: sunt destul de saturate cât să
 * țină contrastul și pe hârtie, și pe ardezie.
 */
const POI_COLORS: Array<[string[], string]> = [
  [["restaurant", "fast_food", "cafe", "bar", "pub", "ice_cream", "bakery"], "#e8842a"],
  [
    ["shop", "supermarket", "grocery", "clothing_store", "mall", "alcohol_shop", "car", "bicycle"],
    "#dda32c",
  ],
  [["lodging"], "#a267d4"],
  [["hospital", "pharmacy", "doctors", "dentist", "veterinary"], "#e0526a"],
  [["school", "college", "library", "kindergarten"], "#4a90d9"],
  [["bus", "rail", "airport", "ferry_terminal", "subway"], "#3f83f8"],
  [
    ["park", "garden", "playground", "pitch", "stadium", "golf", "swimming", "dog_park", "zoo"],
    "#2f9e68",
  ],
  [["attraction", "museum", "art_gallery", "cinema", "theatre", "monument", "castle"], "#c9569f"],
  [["town_hall", "police", "fire_station", "post", "bank", "embassy"], "#7d8aa0"],
];

function poiTextColor(fallback: string): unknown {
  return [
    "match",
    ["get", "class"],
    ...POI_COLORS.flatMap(([classes, color]) => [classes, color]),
    fallback,
  ];
}

/**
 * Glifele sunt generate de noi din Inter și servite de pe domeniul propriu
 * (`pnpm map:glyphs`). Stilul de bază cere fonturi Noto de la furnizorul de dale;
 * le înlocuim pe toate, altfel etichetele ar cere fișiere care la noi nu există.
 */
export const GLYPHS_URL = "/map-fonts/{fontstack}/{range}.pbf";

const FONT_REGULAR = "Inter Regular";
const FONT_BOLD = "Inter Bold";

/** Fără italice: îngreunează citirea la mărimile mici de pe hartă. */
const LABEL_REGULAR = { "text-font": [FONT_REGULAR] };
const LABEL_BOLD = { "text-font": [FONT_BOLD] };

/** Păstrăm doar distincția care contează pe hartă: normal sau îngroșat. */
function mappedFontStack(current: unknown): string[] {
  const requested = Array.isArray(current) ? current.join(" ") : "";
  return [/bold|black|heavy/i.test(requested) ? FONT_BOLD : FONT_REGULAR];
}

/**
 * Numele localității crește cu importanța ei, nu doar cu zoom-ul.
 *
 * Pragurile sunt luate din dala reală de peste Brașov, nu ghicite: acolo Brașovul
 * are `rank` 7, iar Săcele și Codlea — orașe și ele — au 11. Satele stau la 11-14,
 * cartierele la 15-17. Cu numai patru trepte între orașul mare și cele mici, curba
 * trebuie să fie abruptă exact în intervalul acela, altfel toate ies la fel.
 */
function placeTextSize(base: [number, number][], byRank = true): unknown {
  // Zoom-ul trebuie să rămână expresia cea mai de sus — MapLibre nu îl acceptă
  // imbricat — deci factorul de importanță intră în fiecare rezultat, nu în afară.
  const scaled = (size: number): unknown =>
    byRank
      ? [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "rank"], 12],
          1,
          size * 1.6,
          7,
          size * 1.35,
          11,
          size * 0.82,
          16,
          size * 0.68,
        ]
      : size;

  return [
    "interpolate",
    ["exponential", 1.2],
    ["zoom"],
    ...base.flatMap(([zoom, size]) => [zoom, scaled(size)]),
  ];
}

const line = (paint: LayerRule["paint"], test: RegExp): LayerRule => ({
  test,
  type: "line",
  paint,
});
const fill = (paint: LayerRule["paint"], test: RegExp): LayerRule => ({
  test,
  type: "fill",
  paint,
});
const label = (paint: LayerRule["paint"], test: RegExp): LayerRule => ({
  test,
  type: "symbol",
  paint,
});

/**
 * Regulile merg de la particular la general: contururile („casing") înaintea
 * umpluturilor, altfel `road_motorway_casing` ar fi prins de regula de motorway.
 */
const LAYER_RULES: LayerRule[] = [
  {
    test: /^background$/,
    type: "background",
    paint: (p) => ({ "background-color": p.background }),
  },
  {
    test: /^natural_earth$/,
    type: "raster",
    paint: (p) => ({ "raster-opacity": p.reliefOpacity }),
  },

  // Apă și cursuri de apă
  fill((p) => ({ "fill-color": p.water }), /^water$/),
  line((p) => ({ "line-color": p.waterway }), /^waterway_/),

  // Verdeață și teren
  fill(
    (p) => ({ "fill-color": p.park, "fill-opacity": 1, "fill-outline-color": p.park }),
    /^park$/,
  ),
  line((p) => ({ "line-color": p.wood }), /^park_outline$/),
  fill((p) => ({ "fill-color": p.wood, "fill-opacity": 1 }), /^landcover_wood$/),
  fill((p) => ({ "fill-color": p.grass, "fill-opacity": 1 }), /^landcover_grass$/),
  fill((p) => ({ "fill-color": p.wetland }), /^landcover_wetland$/),
  fill((p) => ({ "fill-color": p.sand }), /^landcover_sand$/),
  fill((p) => ({ "fill-color": p.ice }), /^landcover_ice$/),
  fill((p) => ({ "fill-color": p.residential }), /^landuse_residential$/),
  fill((p) => ({ "fill-color": p.pitch }), /^landuse_(pitch|track)$/),
  fill((p) => ({ "fill-color": p.institutional }), /^landuse_(cemetery|hospital|school)$/),
  fill((p) => ({ "fill-color": p.aeroway }), /^aeroway_fill$/),
  line((p) => ({ "line-color": p.minorCasing }), /^aeroway_(runway|taxiway)$/),

  // Clădiri
  fill(
    (p) => ({ "fill-color": p.building, "fill-outline-color": p.buildingOutline }),
    /^building$/,
  ),
  {
    test: /^building-3d$/,
    type: "fill-extrusion",
    paint: (p) => ({ "fill-extrusion-color": p.building3d }),
  },

  // Șine — înaintea drumurilor, altfel `road_major_rail` cade pe regula de drum
  line((p) => ({ "line-color": p.rail }), /rail(_hatching)?$/),

  // Contururile drumurilor
  line((p) => ({ "line-color": p.motorwayCasing }), /motorway(_link)?_casing$/),
  line((p) => ({ "line-color": p.majorCasing }), /(trunk_primary|secondary_tertiary)_casing$/),
  line((p) => ({ "line-color": p.path }), /path_pedestrian_casing$/),
  line((p) => ({ "line-color": p.minorCasing }), /_casing$/),

  // Umplutura drumurilor
  line((p) => ({ "line-color": p.motorway }), /motorway(_link)?$/),
  line((p) => ({ "line-color": p.major }), /(trunk_primary|secondary_tertiary)$/),
  line((p) => ({ "line-color": p.path }), /path_pedestrian$/),
  line((p) => ({ "line-color": p.minor }), /(link|minor|street|service_track)$/),
  fill((p) => ({ "fill-color": p.minor }), /^road_area_pattern$/),

  // Granițe
  line((p) => ({ "line-color": p.boundary }), /^boundary_/),

  // Etichete
  label(
    (p) => ({ "text-color": p.waterLabel, "text-halo-color": p.labelHalo }),
    /^(water_name_|waterway_line_label$)/,
  ),
  {
    test: /^(poi_|airport$)/,
    type: "symbol",
    paint: (p) => ({
      "text-color": poiTextColor(p.labelMuted),
      "text-halo-color": p.labelHalo,
      "text-halo-width": 1.1,
    }),
    layout: () => ({ ...LABEL_REGULAR, "text-size": 11.5 }),
  },
  {
    test: /^highway-name-/,
    type: "symbol",
    paint: (p) => ({ "text-color": p.labelMuted, "text-halo-color": p.labelHalo }),
    layout: () => LABEL_REGULAR,
  },
  {
    test: /^label_city/,
    type: "symbol",
    maxzoom: 16,
    paint: (p) => ({
      "text-color": p.label,
      "text-halo-color": p.labelHalo,
      "text-halo-width": 1.6,
      "text-halo-blur": 0.4,
    }),
    layout: () => ({
      ...LABEL_BOLD,
      "text-size": placeTextSize([
        [4, 10],
        [7, 13],
        [11, 17],
        [14, 19],
      ]),
      "text-letter-spacing": 0.01,
      "text-padding": 6,
    }),
  },
  {
    test: /^label_town$/,
    type: "symbol",
    maxzoom: 16,
    paint: (p) => ({
      "text-color": p.label,
      "text-halo-color": p.labelHalo,
      "text-halo-width": 1.5,
      "text-halo-blur": 0.4,
    }),
    layout: () => ({
      ...LABEL_BOLD,
      "text-size": placeTextSize([
        [7, 11],
        [11, 14],
        [15, 16],
      ]),
      "text-padding": 5,
    }),
  },
  {
    test: /^label_village$/,
    type: "symbol",
    maxzoom: 17,
    paint: (p) => ({ "text-color": p.labelMuted, "text-halo-color": p.labelHalo }),
    layout: () => ({
      ...LABEL_REGULAR,
      "text-size": placeTextSize(
        [
          [9, 9.5],
          [13, 11.5],
          [16, 12.5],
        ],
        false,
      ),
    }),
  },
  {
    test: /^label_other$/,
    type: "symbol",
    paint: (p) => ({ "text-color": p.labelMuted, "text-halo-color": p.labelHalo }),
    layout: () => ({
      ...LABEL_REGULAR,
      "text-size": placeTextSize(
        [
          [8, 9],
          [13, 10.5],
        ],
        false,
      ),
      "text-transform": "uppercase",
      "text-letter-spacing": 0.06,
    }),
  },
  label((p) => ({ "text-color": p.label, "text-halo-color": p.labelHalo }), /^label_/),
];

/** Straturile ridicate în 3D, ascunse cât timp harta e plată. */
export const BUILDING_3D_LAYER = "building-3d";

function ruleFor(layerId: string, layerType: LayerType): LayerRule | undefined {
  return LAYER_RULES.find(
    (candidate) => candidate.type === layerType && candidate.test.test(layerId),
  );
}

type ThemeOptions = {
  /** Modul 3D e pornit; la schimbarea temei clădirile trebuie să rămână ridicate. */
  buildings3d?: boolean;
};

/**
 * Întoarce o copie a stilului cu paleta noastră aplicată. Nu mutăm stilul primit:
 * îl ținem în cache și îl re-colorăm la fiecare schimbare de temă.
 */
export function applyMapTheme(
  style: StyleSpecification,
  palette: MapPalette,
  { buildings3d = false }: ThemeOptions = {},
): StyleSpecification {
  return {
    ...style,
    glyphs: GLYPHS_URL,
    layers: style.layers.map((layer) => {
      const rule = ruleFor(layer.id, layer.type);
      const isLabel = layer.type === "symbol";
      if (!rule && !isLabel) return layer;

      const currentLayout: Record<string, unknown> | undefined =
        "layout" in layer ? layer.layout : undefined;
      const layout = {
        ...currentLayout,
        ...(isLabel ? { "text-font": mappedFontStack(currentLayout?.["text-font"]) } : {}),
        ...rule?.layout?.(),
        ...(layer.id === BUILDING_3D_LAYER
          ? { visibility: (buildings3d ? "visible" : "none") as "visible" | "none" }
          : {}),
      };

      return {
        ...layer,
        ...(Object.keys(layout).length > 0 ? { layout } : {}),
        ...(rule?.maxzoom !== undefined ? { maxzoom: rule.maxzoom } : {}),
        ...(rule || "paint" in layer
          ? {
              paint: {
                ...("paint" in layer ? layer.paint : undefined),
                ...(rule ? rule.paint(palette) : {}),
              },
            }
          : {}),
      } as (typeof style.layers)[number];
    }),
  };
}
