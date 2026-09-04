import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import type { StyleSpecification } from "maplibre-gl";
import { describe, expect, it } from "vitest";

import { buildMapStyle, MAP_MODES } from "./map-modes";
import { BUILDING_3D_LAYER, PALETTES } from "./map-theme";

/**
 * Un extras din stilul OpenFreeMap Liberty, cu câte un strat din fiecare fel pe
 * care îl atingem. Stilul întreg are 111 straturi și nu are ce căuta în repo;
 * ce contează aici sunt formele, nu numărul lor.
 */
function styleFixture(): StyleSpecification {
  const source = "openmaptiles";

  return {
    version: 8,
    glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
    sources: {
      [source]: { type: "vector", url: "https://example.test/planet" },
      ne2_shaded: {
        type: "raster",
        tiles: ["https://example.test/{z}/{x}/{y}.png"],
        tileSize: 256,
      },
    },
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#f8f4f0" } },
      {
        id: "natural_earth",
        type: "raster",
        source: "ne2_shaded",
        paint: { "raster-opacity": 0.5 },
      },
      { id: "water", type: "fill", source, "source-layer": "water" },
      { id: "park", type: "fill", source, "source-layer": "park" },
      { id: "landcover_wood", type: "fill", source, "source-layer": "landcover" },
      { id: "road_motorway_casing", type: "line", source, "source-layer": "transportation" },
      { id: "road_motorway", type: "line", source, "source-layer": "transportation" },
      { id: "road_minor", type: "line", source, "source-layer": "transportation" },
      { id: "road_major_rail", type: "line", source, "source-layer": "transportation" },
      { id: "boundary_2", type: "line", source, "source-layer": "boundary" },
      { id: "waterway_river", type: "line", source, "source-layer": "waterway" },
      {
        id: "waterway_line_label",
        type: "symbol",
        source,
        "source-layer": "waterway",
        layout: { "text-field": ["get", "name"] },
      },
      {
        id: "highway-name-minor",
        type: "symbol",
        source,
        "source-layer": "transportation_name",
        layout: { "text-field": ["get", "name"] },
      },
      {
        id: "poi_r1",
        type: "symbol",
        source,
        "source-layer": "poi",
        layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Italic"] },
      },
      {
        id: "label_city",
        type: "symbol",
        source,
        "source-layer": "place",
        layout: { "text-field": ["get", "name"] },
      },
      {
        id: "label_town",
        type: "symbol",
        source,
        "source-layer": "place",
        layout: { "text-field": ["get", "name"] },
      },
      {
        id: "label_village",
        type: "symbol",
        source,
        "source-layer": "place",
        layout: { "text-field": ["get", "name"] },
      },
      {
        id: "label_other",
        type: "symbol",
        source,
        "source-layer": "place",
        layout: { "text-field": ["get", "name"] },
      },
      {
        id: BUILDING_3D_LAYER,
        type: "fill-extrusion",
        source,
        "source-layer": "building",
        paint: { "fill-extrusion-height": ["get", "render_height"] },
      },
    ],
  } as StyleSpecification;
}

/**
 * Stilul a fost spart de două ori: o dată cu o proprietate de linie pusă pe o
 * etichetă, o dată cu o expresie de zoom imbricată într-o înmulțire. De fiecare
 * dată harta refuza să pornească. Validatorul oficial prinde ambele clase.
 */
describe("stilul livrat hărții", () => {
  const cases = MAP_MODES.flatMap((mode) =>
    (["light", "dark"] as const).flatMap((theme) =>
      [false, true].map((buildings3d) => ({ mode, theme, buildings3d })),
    ),
  );

  it.each(cases)(
    "rămâne valid: $mode / $theme / 3D=$buildings3d",
    ({ mode, theme, buildings3d }) => {
      const style = buildMapStyle(styleFixture(), { mode, palette: PALETTES[theme], buildings3d });
      const errors = validateStyleMin(style as never);

      expect(errors.map((error) => `${error.message}`)).toEqual([]);
    },
  );
});
