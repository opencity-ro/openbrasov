import type { LayerSpecification, StyleSpecification } from "maplibre-gl";

import { applyMapTheme, BUILDING_3D_LAYER, type MapPalette } from "./map-theme";

export const MAP_MODES = ["standard", "hybrid", "satellite"] as const;
export type MapMode = (typeof MAP_MODES)[number];

export const IMAGERY_SOURCE_ID = "imagery";

const IMAGERY_TILE_URL =
  "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

/** O dală reală peste Brașov, folosită ca previzualizare în selectorul de mod. */
export const IMAGERY_PREVIEW_URL =
  "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/14/5852/9356";

export const IMAGERY_ATTRIBUTION = {
  label: "Esri, Maxar, Earthstar Geographics",
  href: "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9",
};

/**
 * Peste imagini păstrăm doar ce ajută orientarea: drumurile, granițele și
 * etichetele. Restul stilului ar acoperi exact ce ai venit să vezi.
 */
const KEEP_OVER_IMAGERY =
  /^(label_|water_name_|waterway_line_label$|highway-name-|highway-shield|road_shield|airport$|boundary_|poi_)/;

const ROADS_OVER_IMAGERY = /^(road_|bridge_)(?!.*_casing)(?!.*rail)(?!.*one_way)(?!.*area_pattern)/;

/** Alb translucid peste imagini: se citește pe câmp și pe acoperiș deopotrivă. */
const IMAGERY_ROAD_COLOR = "rgba(255, 255, 255, 0.62)";
const IMAGERY_LABEL_COLOR = "#ffffff";
const IMAGERY_LABEL_HALO = "rgba(0, 0, 0, 0.72)";

/** Fundalul de sub imagini: fără el, dalele încă neîncărcate lasă găuri albe. */
function imageryBase(palette: MapPalette): LayerSpecification[] {
  return [
    { id: "background", type: "background", paint: { "background-color": palette.background } },
    { id: "imagery", type: "raster", source: IMAGERY_SOURCE_ID, paint: { "raster-opacity": 1 } },
  ];
}

function withImagerySource(style: StyleSpecification): StyleSpecification["sources"] {
  return {
    ...style.sources,
    [IMAGERY_SOURCE_ID]: {
      type: "raster",
      tiles: [IMAGERY_TILE_URL],
      tileSize: 256,
      maxzoom: 19,
      attribution: IMAGERY_ATTRIBUTION.label,
    },
  };
}

function overImagery(layer: LayerSpecification): LayerSpecification {
  if (layer.type === "symbol") {
    return {
      ...layer,
      paint: {
        ...layer.paint,
        "text-color": IMAGERY_LABEL_COLOR,
        "text-halo-color": IMAGERY_LABEL_HALO,
        "text-halo-width": 1.2,
      },
    };
  }

  if (layer.type === "line") {
    return { ...layer, paint: { ...layer.paint, "line-color": IMAGERY_ROAD_COLOR } };
  }

  return layer;
}

type BuildOptions = {
  mode: MapMode;
  palette: MapPalette;
  buildings3d?: boolean;
};

/**
 * Stilul livrat hărții. Cele trei moduri pornesc din același stil de bază, ca
 * schimbarea între ele să fie un `setStyle` cu diferență, nu o reîncărcare.
 */
export function buildMapStyle(
  base: StyleSpecification,
  { mode, palette, buildings3d = false }: BuildOptions,
): StyleSpecification {
  const themed = applyMapTheme(base, palette, { buildings3d });

  if (mode === "standard") return themed;

  const overlays = themed.layers.filter((layer) => {
    if (layer.id === BUILDING_3D_LAYER) return mode === "hybrid" && buildings3d;
    if (mode === "satellite") return false;
    return KEEP_OVER_IMAGERY.test(layer.id) || ROADS_OVER_IMAGERY.test(layer.id);
  });

  return {
    ...themed,
    sources: withImagerySource(themed),
    layers: [...imageryBase(palette), ...overlays.map(overImagery)],
  };
}
