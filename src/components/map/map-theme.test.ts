import type { StyleSpecification } from "maplibre-gl";
import { describe, expect, it } from "vitest";

import { applyMapTheme, BUILDING_3D_LAYER, DARK_PALETTE, LIGHT_PALETTE } from "./map-theme";

/** Un extras din stilul Liberty, cu straturile care ne dau cele mai multe bătăi de cap. */
function styleFixture(): StyleSpecification {
  return {
    version: 8,
    sources: {},
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#f8f4f0" } },
      { id: "water", type: "fill", source: "s", paint: { "fill-color": "rgb(158,189,255)" } },
      { id: "park", type: "fill", source: "s", paint: { "fill-color": "#d8e8c8" } },
      { id: "road_motorway_casing", type: "line", source: "s", paint: { "line-color": "#e9ac77" } },
      { id: "road_motorway", type: "line", source: "s", paint: { "line-color": "#fc8" } },
      { id: "road_minor", type: "line", source: "s", paint: { "line-color": "#fff" } },
      { id: "road_major_rail", type: "line", source: "s", paint: { "line-color": "#bbb" } },
      { id: "label_city", type: "symbol", source: "s", paint: { "text-color": "#000" } },
      {
        id: BUILDING_3D_LAYER,
        type: "fill-extrusion",
        source: "s",
        paint: { "fill-extrusion-color": "hsl(35,8%,85%)" },
      },
      { id: "road_one_way_arrow", type: "symbol", source: "s", layout: { "icon-size": 1 } },
      // Etichete al căror nume seamănă cu al unei linii — capcana care a stricat stilul.
      { id: "waterway_line_label", type: "symbol", source: "s", paint: { "text-color": "#999" } },
      { id: "highway-name-minor", type: "symbol", source: "s", paint: { "text-color": "#765" } },
    ],
  } as StyleSpecification;
}

const PAINT_PREFIX_BY_TYPE: Record<string, string> = {
  background: "background-",
  fill: "fill-",
  line: "line-",
  symbol: "text-",
  raster: "raster-",
  "fill-extrusion": "fill-extrusion-",
};

function layer(style: StyleSpecification, id: string) {
  const found = style.layers.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`Stratul ${id} lipsește din stil`);
  return found as { paint?: Record<string, unknown>; layout?: Record<string, unknown> };
}

describe("applyMapTheme", () => {
  it("recolorează fundalul, apa și verdeața din paletă", () => {
    const themed = applyMapTheme(styleFixture(), LIGHT_PALETTE);

    expect(layer(themed, "background").paint?.["background-color"]).toBe(LIGHT_PALETTE.background);
    expect(layer(themed, "water").paint?.["fill-color"]).toBe(LIGHT_PALETTE.water);
    expect(layer(themed, "park").paint?.["fill-color"]).toBe(LIGHT_PALETTE.park);
  });

  it("separă conturul drumului de umplutura lui", () => {
    const themed = applyMapTheme(styleFixture(), LIGHT_PALETTE);

    expect(layer(themed, "road_motorway_casing").paint?.["line-color"]).toBe(
      LIGHT_PALETTE.motorwayCasing,
    );
    expect(layer(themed, "road_motorway").paint?.["line-color"]).toBe(LIGHT_PALETTE.motorway);
    expect(layer(themed, "road_minor").paint?.["line-color"]).toBe(LIGHT_PALETTE.minor);
  });

  it("tratează șinele ca șine, nu ca drumuri", () => {
    const themed = applyMapTheme(styleFixture(), DARK_PALETTE);

    expect(layer(themed, "road_major_rail").paint?.["line-color"]).toBe(DARK_PALETTE.rail);
  });

  it("dă etichetelor culoarea și halo-ul temei", () => {
    const themed = applyMapTheme(styleFixture(), DARK_PALETTE);

    expect(layer(themed, "label_city").paint?.["text-color"]).toBe(DARK_PALETTE.label);
    expect(layer(themed, "label_city").paint?.["text-halo-color"]).toBe(DARK_PALETTE.labelHalo);
  });

  it("pornește cu clădirile 3D ascunse", () => {
    const themed = applyMapTheme(styleFixture(), LIGHT_PALETTE);

    expect(layer(themed, BUILDING_3D_LAYER).layout?.visibility).toBe("none");
    expect(layer(themed, BUILDING_3D_LAYER).paint?.["fill-extrusion-color"]).toBe(
      LIGHT_PALETTE.building3d,
    );
  });

  it("păstrează clădirile ridicate când modul 3D e pornit", () => {
    const themed = applyMapTheme(styleFixture(), DARK_PALETTE, { buildings3d: true });

    expect(layer(themed, BUILDING_3D_LAYER).layout?.visibility).toBe("visible");
  });

  it("tratează ca etichete straturile care doar sună a linie", () => {
    const themed = applyMapTheme(styleFixture(), LIGHT_PALETTE);

    expect(layer(themed, "waterway_line_label").paint?.["text-color"]).toBe(
      LIGHT_PALETTE.waterLabel,
    );
    expect(layer(themed, "waterway_line_label").paint?.["line-color"]).toBeUndefined();
    expect(layer(themed, "highway-name-minor").paint?.["text-color"]).toBe(
      LIGHT_PALETTE.labelMuted,
    );
    expect(layer(themed, "highway-name-minor").paint?.["line-color"]).toBeUndefined();
  });

  it("nu scrie niciodată o proprietate străină de tipul stratului", () => {
    const themed = applyMapTheme(styleFixture(), DARK_PALETTE, { buildings3d: true });

    for (const styleLayer of themed.layers) {
      const allowed = PAINT_PREFIX_BY_TYPE[styleLayer.type];
      const paint = ("paint" in styleLayer ? styleLayer.paint : undefined) ?? {};

      for (const property of Object.keys(paint)) {
        expect(property.startsWith(allowed), `${styleLayer.id} → ${property}`).toBe(true);
      }
    }
  });

  it("lasă neatinse straturile fără regulă și nu modifică stilul primit", () => {
    const original = styleFixture();
    const themed = applyMapTheme(original, LIGHT_PALETTE);

    expect(layer(themed, "road_one_way_arrow").paint).toBeUndefined();
    expect(layer(original, "background").paint?.["background-color"]).toBe("#f8f4f0");
  });
});
