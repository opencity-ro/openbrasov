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
 * Ton cald, dens, apropiat de Apple Maps, dar tras spre verdele mărcii:
 * uscat cald, apă potolită, verdeață citibilă, drumuri albe cu contur discret.
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
 * Noaptea: uscat verde-negru pe linia lui `--background`, drumuri mai deschise
 * decât terenul (altfel orașul dispare), apă cu un rest de albastru ca să rămână apă.
 */
export const DARK_PALETTE: MapPalette = {
  background: "#0e1512",
  water: "#0d2130",
  waterway: "#12303f",
  park: "#14211a",
  wood: "#15241b",
  grass: "#16241b",
  wetland: "#14201c",
  sand: "#1e2119",
  ice: "#1b2427",
  residential: "#121a16",
  institutional: "#141c18",
  pitch: "#17251c",
  aeroway: "#161d19",
  building: "#1a231d",
  buildingOutline: "#232e27",
  building3d: "#1e2822",
  motorway: "#34433a",
  motorwayCasing: "#435347",
  major: "#2a362e",
  majorCasing: "#37453b",
  minor: "#212b25",
  minorCasing: "#2b3730",
  path: "#2a342d",
  rail: "#253028",
  boundary: "#3a4841",
  label: "#cbd8ce",
  labelHalo: "rgba(10, 16, 13, 0.78)",
  labelMuted: "#8fa396",
  waterLabel: "#7fa6be",
  parkLabel: "#86a98a",
  reliefOpacity: 0.12,
};

export const PALETTES = { light: LIGHT_PALETTE, dark: DARK_PALETTE } as const;

export type MapThemeName = keyof typeof PALETTES;

type PaintPatch = Record<string, unknown>;

type LayerRule = {
  /** Prima regulă care se potrivește câștigă, deci ordinea contează. */
  test: RegExp;
  paint: (palette: MapPalette) => PaintPatch;
};

/**
 * Regulile merg de la particular la general: contururile („casing") înaintea
 * umpluturilor, altfel `road_motorway_casing` ar fi prins de regula de motorway.
 */
const LAYER_RULES: LayerRule[] = [
  { test: /^background$/, paint: (p) => ({ "background-color": p.background }) },
  { test: /^natural_earth$/, paint: (p) => ({ "raster-opacity": p.reliefOpacity }) },

  // Apă și cursuri de apă
  { test: /^water$/, paint: (p) => ({ "fill-color": p.water }) },
  { test: /^waterway_/, paint: (p) => ({ "line-color": p.waterway }) },

  // Verdeață și teren
  {
    test: /^park$/,
    paint: (p) => ({ "fill-color": p.park, "fill-opacity": 1, "fill-outline-color": p.park }),
  },
  { test: /^park_outline$/, paint: (p) => ({ "line-color": p.wood }) },
  { test: /^landcover_wood$/, paint: (p) => ({ "fill-color": p.wood, "fill-opacity": 1 }) },
  { test: /^landcover_grass$/, paint: (p) => ({ "fill-color": p.grass, "fill-opacity": 1 }) },
  { test: /^landcover_wetland$/, paint: (p) => ({ "fill-color": p.wetland }) },
  { test: /^landcover_sand$/, paint: (p) => ({ "fill-color": p.sand }) },
  { test: /^landcover_ice$/, paint: (p) => ({ "fill-color": p.ice }) },
  { test: /^landuse_residential$/, paint: (p) => ({ "fill-color": p.residential }) },
  { test: /^landuse_(pitch|track)$/, paint: (p) => ({ "fill-color": p.pitch }) },
  {
    test: /^landuse_(cemetery|hospital|school)$/,
    paint: (p) => ({ "fill-color": p.institutional }),
  },
  { test: /^aeroway_fill$/, paint: (p) => ({ "fill-color": p.aeroway }) },
  { test: /^aeroway_(runway|taxiway)$/, paint: (p) => ({ "line-color": p.minorCasing }) },

  // Clădiri
  {
    test: /^building$/,
    paint: (p) => ({ "fill-color": p.building, "fill-outline-color": p.buildingOutline }),
  },
  { test: /^building-3d$/, paint: (p) => ({ "fill-extrusion-color": p.building3d }) },

  // Șine — înaintea drumurilor, altfel `road_major_rail` cade pe regula de drum
  { test: /rail(_hatching)?$/, paint: (p) => ({ "line-color": p.rail }) },

  // Contururile drumurilor
  { test: /motorway(_link)?_casing$/, paint: (p) => ({ "line-color": p.motorwayCasing }) },
  {
    test: /(trunk_primary|secondary_tertiary)_casing$/,
    paint: (p) => ({ "line-color": p.majorCasing }),
  },
  { test: /path_pedestrian_casing$/, paint: (p) => ({ "line-color": p.path }) },
  { test: /_casing$/, paint: (p) => ({ "line-color": p.minorCasing }) },

  // Umplutura drumurilor
  { test: /motorway(_link)?$/, paint: (p) => ({ "line-color": p.motorway }) },
  { test: /(trunk_primary|secondary_tertiary)$/, paint: (p) => ({ "line-color": p.major }) },
  { test: /path_pedestrian$/, paint: (p) => ({ "line-color": p.path }) },
  { test: /(link|minor|street|service_track)$/, paint: (p) => ({ "line-color": p.minor }) },
  { test: /^road_area_pattern$/, paint: (p) => ({ "fill-color": p.minor }) },

  // Granițe
  { test: /^boundary_/, paint: (p) => ({ "line-color": p.boundary }) },

  // Etichete
  {
    test: /^water_name_/,
    paint: (p) => ({ "text-color": p.waterLabel, "text-halo-color": p.labelHalo }),
  },
  {
    test: /^waterway_line_label$/,
    paint: (p) => ({ "text-color": p.waterLabel, "text-halo-color": p.labelHalo }),
  },
  {
    test: /^(poi_|airport$)/,
    paint: (p) => ({ "text-color": p.labelMuted, "text-halo-color": p.labelHalo }),
  },
  {
    test: /^highway-name-/,
    paint: (p) => ({ "text-color": p.labelMuted, "text-halo-color": p.labelHalo }),
  },
  {
    test: /^label_/,
    paint: (p) => ({ "text-color": p.label, "text-halo-color": p.labelHalo }),
  },
];

/** Straturile ridicate în 3D, ascunse cât timp harta e plată. */
export const BUILDING_3D_LAYER = "building-3d";

function paintPatchFor(layerId: string, palette: MapPalette): PaintPatch | undefined {
  const rule = LAYER_RULES.find((candidate) => candidate.test.test(layerId));
  return rule?.paint(palette);
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
    layers: style.layers.map((layer) => {
      const patch = paintPatchFor(layer.id, palette);
      if (!patch) return layer;

      const layout =
        layer.id === BUILDING_3D_LAYER
          ? {
              ...("layout" in layer ? layer.layout : undefined),
              visibility: (buildings3d ? "visible" : "none") as "visible" | "none",
            }
          : "layout" in layer
            ? layer.layout
            : undefined;

      return {
        ...layer,
        ...(layout ? { layout } : {}),
        paint: { ...("paint" in layer ? layer.paint : undefined), ...patch },
      } as (typeof style.layers)[number];
    }),
  };
}
