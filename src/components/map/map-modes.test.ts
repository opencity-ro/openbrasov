import type { StyleSpecification } from "maplibre-gl";
import { describe, expect, it } from "vitest";

import { buildMapStyle, IMAGERY_SOURCE_ID } from "./map-modes";
import { BUILDING_3D_LAYER, LIGHT_PALETTE } from "./map-theme";

function styleFixture(): StyleSpecification {
  return {
    version: 8,
    sources: { openmaptiles: { type: "vector", url: "https://example.test/planet" } },
    layers: [
      { id: "background", type: "background", paint: { "background-color": "#fff" } },
      { id: "water", type: "fill", source: "s", paint: { "fill-color": "#00f" } },
      { id: "park", type: "fill", source: "s", paint: { "fill-color": "#0f0" } },
      { id: "road_motorway_casing", type: "line", source: "s", paint: { "line-color": "#e9ac77" } },
      { id: "road_motorway", type: "line", source: "s", paint: { "line-color": "#fc8" } },
      { id: "road_major_rail", type: "line", source: "s", paint: { "line-color": "#bbb" } },
      { id: "label_city", type: "symbol", source: "s", paint: { "text-color": "#000" } },
      {
        id: BUILDING_3D_LAYER,
        type: "fill-extrusion",
        source: "s",
        paint: { "fill-extrusion-color": "#ddd" },
      },
    ],
  } as StyleSpecification;
}

const ids = (style: StyleSpecification) => style.layers.map((layer) => layer.id);

describe("buildMapStyle", () => {
  it("lasă modul standard cu toate straturile stilului", () => {
    const style = buildMapStyle(styleFixture(), { mode: "standard", palette: LIGHT_PALETTE });

    expect(ids(style)).toEqual(ids(styleFixture()));
    expect(style.sources[IMAGERY_SOURCE_ID]).toBeUndefined();
  });

  it("dă la satelit doar imaginile, fără nimic desenat peste", () => {
    const style = buildMapStyle(styleFixture(), { mode: "satellite", palette: LIGHT_PALETTE });

    expect(ids(style)).toEqual(["background", "imagery"]);
    expect(style.sources[IMAGERY_SOURCE_ID]).toBeDefined();
  });

  it("păstrează la hibrid doar drumurile și etichetele, peste imagini", () => {
    const style = buildMapStyle(styleFixture(), { mode: "hybrid", palette: LIGHT_PALETTE });
    const layerIds = ids(style);

    expect(layerIds.slice(0, 2)).toEqual(["background", "imagery"]);
    expect(layerIds).toContain("road_motorway");
    expect(layerIds).toContain("label_city");
    // Umpluturile ar acoperi exact imaginile pentru care ai comutat.

    expect(layerIds).not.toContain("water");
    expect(layerIds).not.toContain("park");
    // Contururile de drum nu au ce contura peste fotografie.
    expect(layerIds).not.toContain("road_motorway_casing");
  });

  it("scrie drumurile și etichetele în alb peste imagini", () => {
    const style = buildMapStyle(styleFixture(), { mode: "hybrid", palette: LIGHT_PALETTE });
    const road = style.layers.find((layer) => layer.id === "road_motorway");
    const label = style.layers.find((layer) => layer.id === "label_city");

    expect((road as { paint: Record<string, unknown> }).paint["line-color"]).toContain("255");
    expect((label as { paint: Record<string, unknown> }).paint["text-color"]).toBe("#ffffff");
  });

  it("ridică clădirile peste imagini doar în hibrid, nu și la satelit", () => {
    const hybrid = buildMapStyle(styleFixture(), {
      mode: "hybrid",
      palette: LIGHT_PALETTE,
      buildings3d: true,
    });
    const satellite = buildMapStyle(styleFixture(), {
      mode: "satellite",
      palette: LIGHT_PALETTE,
      buildings3d: true,
    });

    expect(ids(hybrid)).toContain(BUILDING_3D_LAYER);
    expect(ids(satellite)).not.toContain(BUILDING_3D_LAYER);
  });
});
