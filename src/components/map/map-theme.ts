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
};

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
  label(
    (p) => ({ "text-color": p.labelMuted, "text-halo-color": p.labelHalo }),
    /^(poi_|airport$|highway-name-)/,
  ),
  label((p) => ({ "text-color": p.label, "text-halo-color": p.labelHalo }), /^label_/),
];

/** Straturile ridicate în 3D, ascunse cât timp harta e plată. */
export const BUILDING_3D_LAYER = "building-3d";

function paintPatchFor(
  layerId: string,
  layerType: LayerType,
  palette: MapPalette,
): PaintPatch | undefined {
  const rule = LAYER_RULES.find(
    (candidate) => candidate.type === layerType && candidate.test.test(layerId),
  );
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
      const patch = paintPatchFor(layer.id, layer.type, palette);
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
