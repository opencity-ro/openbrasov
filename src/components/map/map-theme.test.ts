import type { StyleSpecification } from "maplibre-gl";
import { describe, expect, it } from "vitest";

import {
  applyMapTheme,
  BUILDING_3D_LAYER,
  DARK_PALETTE,
  HOUSE_NUMBER_LAYER,
  LIGHT_PALETTE,
  lowestPoiSortKey,
  REPORT_SORT_KEY,
} from "./map-theme";

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
  it("ziua lasă vopseaua stilului de bază neatinsă", () => {
    const themed = applyMapTheme(styleFixture(), LIGHT_PALETTE);

    // Drumurile galbene, apa albastră, gri-ul etichetelor: exact harta oficială.
    expect(layer(themed, "road_motorway").paint?.["line-color"]).toBe("#fc8");
    expect(layer(themed, "water").paint?.["fill-color"]).toBe("rgb(158,189,255)");
    expect(layer(themed, "label_city").paint?.["text-color"]).toBe("#000");
    expect(layer(themed, "waterway_line_label").paint?.["text-color"]).toBe("#999");
  });

  it("noaptea recolorează fundalul, apa și verdeața din paletă", () => {
    const themed = applyMapTheme(styleFixture(), DARK_PALETTE);

    expect(layer(themed, "background").paint?.["background-color"]).toBe(DARK_PALETTE.background);
    expect(layer(themed, "water").paint?.["fill-color"]).toBe(DARK_PALETTE.water);
    expect(layer(themed, "park").paint?.["fill-color"]).toBe(DARK_PALETTE.park);
  });

  it("separă conturul drumului de umplutura lui", () => {
    const themed = applyMapTheme(styleFixture(), DARK_PALETTE);

    expect(layer(themed, "road_motorway_casing").paint?.["line-color"]).toBe(
      DARK_PALETTE.motorwayCasing,
    );
    expect(layer(themed, "road_motorway").paint?.["line-color"]).toBe(DARK_PALETTE.motorway);
    expect(layer(themed, "road_minor").paint?.["line-color"]).toBe(DARK_PALETTE.minor);
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
    const themed = applyMapTheme(styleFixture(), DARK_PALETTE);

    expect(layer(themed, BUILDING_3D_LAYER).layout?.visibility).toBe("none");
    expect(layer(themed, BUILDING_3D_LAYER).paint?.["fill-extrusion-color"]).toBe(
      DARK_PALETTE.building3d,
    );
  });

  it("păstrează clădirile ridicate când modul 3D e pornit", () => {
    const themed = applyMapTheme(styleFixture(), DARK_PALETTE, { buildings3d: true });

    expect(layer(themed, BUILDING_3D_LAYER).layout?.visibility).toBe("visible");
  });

  it("tratează ca etichete straturile care doar sună a linie", () => {
    const themed = applyMapTheme(styleFixture(), DARK_PALETTE);

    expect(layer(themed, "waterway_line_label").paint?.["text-color"]).toBe(
      DARK_PALETTE.waterLabel,
    );
    expect(layer(themed, "waterway_line_label").paint?.["line-color"]).toBeUndefined();
    expect(layer(themed, "highway-name-minor").paint?.["text-color"]).toBe(DARK_PALETTE.labelMuted);
    expect(layer(themed, "highway-name-minor").paint?.["line-color"]).toBeUndefined();
  });

  it("păstrează tăietura fontului cerută de stil: italicul rămâne italic", () => {
    const base = styleFixture();
    const withFonts = {
      ...base,
      layers: [
        ...base.layers,
        {
          id: "poi_r1",
          type: "symbol",
          source: "s",
          layout: { "text-font": ["Noto Sans Italic"] },
        },
        { id: "shield", type: "symbol", source: "s", layout: { "text-font": ["Noto Sans Bold"] } },
      ],
    } as StyleSpecification;
    const themed = applyMapTheme(withFonts, LIGHT_PALETTE);

    expect(layer(themed, "poi_r1").layout?.["text-font"]).toEqual(["Inter Italic"]);
    expect(layer(themed, "shield").layout?.["text-font"]).toEqual(["Inter Bold"]);
    expect(layer(themed, "label_city").layout?.["text-font"]).toEqual(["Inter Bold"]);
  });

  it("ține conturul clădirilor la orice apropiere, ca pe OSM", () => {
    const base = styleFixture();
    const withBuilding = {
      ...base,
      layers: [
        ...base.layers,
        { id: "building", type: "fill", source: "s", minzoom: 13, maxzoom: 14, paint: {} },
      ],
    } as StyleSpecification;
    const themed = applyMapTheme(withBuilding, LIGHT_PALETTE);

    expect(themed.layers.find((candidate) => candidate.id === "building")?.maxzoom).toBe(24);
  });

  it("lasă punctele de interes la zoom-urile stilului oficial", () => {
    const base = styleFixture();
    const withPoi = {
      ...base,
      layers: [
        ...base.layers,
        { id: "poi_r1", type: "symbol", source: "s", minzoom: 15 },
        { id: "poi_r20", type: "symbol", source: "s", minzoom: 17 },
      ],
    } as StyleSpecification;
    const themed = applyMapTheme(withPoi, LIGHT_PALETTE);

    // Coborâte, magazinele mici umpleau harta la depărtare.
    expect(themed.layers.find((candidate) => candidate.id === "poi_r1")?.minzoom).toBe(15);
    expect(themed.layers.find((candidate) => candidate.id === "poi_r20")?.minzoom).toBe(17);
  });

  it("ține sesizările deasupra oricărui punct de interes", () => {
    // Harta există pentru sesizări: o groapă raportată nu poate pierde locul
    // în fața unei farmacii, oricât de important ar fi tipul acesteia.
    expect(REPORT_SORT_KEY).toBeLessThan(lowestPoiSortKey());
  });

  it("dă numelor de localitate trei trepte, în raportul de pe referință", () => {
    const base = styleFixture();
    const withPlaces = {
      ...base,
      layers: [
        ...base.layers,
        { id: "label_town", type: "symbol", source: "s" },
        { id: "label_village", type: "symbol", source: "s" },
      ],
    } as StyleSpecification;
    const themed = applyMapTheme(withPlaces, LIGHT_PALETTE);

    /**
     * Mărimea la zoom 12. Perechile încep după `["interpolate", curbă, ["zoom"]]`,
     * deci cheile stau pe pozițiile impare de acolo încolo — căutarea directă a
     * valorii 12 ar nimeri mărimea de la zoom 10, care se întâmplă să fie tot 12.
     */
    const sizeAtZoom12 = (id: string) => {
      const stops = layer(themed, id).layout?.["text-size"] as unknown[];
      for (let index = 3; index < stops.length; index += 2) {
        if (stops[index] === 12) return stops[index + 1];
      }
      throw new Error(`${id} nu are o treaptă la zoom 12`);
    };

    const city = sizeAtZoom12("label_city") as unknown[];
    // Orașul mare ia prima ramură, orașele mici pe a doua.
    const bigCity = city[2] as number;
    const smallCity = city[3] as number;
    const town = sizeAtZoom12("label_town") as number;
    const village = sizeAtZoom12("label_village") as number;

    expect(bigCity).toBe(28);
    expect(town).toBe(19);
    expect(village).toBe(16);
    // Un oraș mic se scrie ca un oraș obișnuit, nu ca reședința de județ.
    expect(smallCity).toBe(town);
  });

  it("dă punctelor de interes patru poziții de încercat, nu una", () => {
    const base = styleFixture();
    const withPoi = {
      ...base,
      layers: [
        ...base.layers,
        {
          id: "poi_r1",
          type: "symbol",
          source: "s",
          layout: { "text-anchor": "top", "text-offset": [0, 0.6] },
        },
      ],
    } as StyleSpecification;
    const themed = applyMapTheme(withPoi, LIGHT_PALETTE);
    const layout = layer(themed, "poi_r1").layout!;

    expect(layout["text-variable-anchor"]).toEqual(["top", "bottom", "left", "right"]);
    expect(layout["text-optional"]).toBe(true);
    // Specificația refuză ancora fixă alături de cea variabilă, iar stilul de
    // bază o pune pe toate straturile: trebuie scoasă, nu doar suprascrisă.
    expect("text-anchor" in layout).toBe(false);
    // Decalajul pe axe pleacă și el: pe o singură axă, celelalte direcții ar
    // primi distanța zero, adică numele peste iconiță.
    expect("text-offset" in layout).toBe(false);
    expect(layout["text-radial-offset"]).toBe(0.9);
  });

  it("așază întâi ce arată stilul oficial mai devreme", () => {
    const base = styleFixture();
    const withPoi = {
      ...base,
      layers: [...base.layers, { id: "poi_r1", type: "symbol", source: "s" }],
    } as StyleSpecification;
    const themed = applyMapTheme(withPoi, LIGHT_PALETTE);
    const sortKey = layer(themed, "poi_r1").layout!["symbol-sort-key"] as unknown[];

    expect(sortKey[0]).toBe("match");
    expect(sortKey[1]).toEqual(["get", "subclass"]);
    // Spitalul bate farmacia, farmacia bate banca de gunoi.
    const priorityOf = (subclass: string) => {
      for (let index = 2; index < sortKey.length - 1; index += 2) {
        if ((sortKey[index] as string[]).includes(subclass)) return sortKey[index + 1] as number;
      }
      return sortKey.at(-1) as number;
    };

    expect(priorityOf("hospital")).toBeLessThan(priorityOf("bank"));
    expect(priorityOf("bank")).toBeLessThan(priorityOf("waste_basket"));
    // Un tip fără regulă la ei cade pe pragul implicit.
    expect(priorityOf("supermarket")).toBe(17);
  });

  it("adaugă numerele de casă pe sursa vectorială a stilului", () => {
    const withSource = {
      ...styleFixture(),
      sources: { openmaptiles: { type: "vector", url: "https://example.test/planet" } },
    } as StyleSpecification;
    const themed = applyMapTheme(withSource, DARK_PALETTE);
    const numbers = layer(themed, HOUSE_NUMBER_LAYER) as unknown as {
      source: string;
      minzoom: number;
      paint: Record<string, unknown>;
    };

    expect(numbers.source).toBe("openmaptiles");
    expect(numbers.minzoom).toBe(16);
    expect(numbers.paint["text-color"]).toBe(DARK_PALETTE.labelMuted);
  });

  it("nu adaugă numere de casă unui stil fără sursă vectorială", () => {
    const themed = applyMapTheme(styleFixture(), LIGHT_PALETTE);

    expect(themed.layers.some((candidate) => candidate.id === HOUSE_NUMBER_LAYER)).toBe(false);
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

  it("nu inventează culori pentru straturile fără regulă și nu modifică stilul primit", () => {
    const original = styleFixture();
    const themed = applyMapTheme(original, LIGHT_PALETTE);

    // Eticheta asta nu are regulă: primește doar fontul, nu și vopsea.
    expect(layer(themed, "road_one_way_arrow").paint).toBeUndefined();
    expect(layer(themed, "road_one_way_arrow").layout?.["text-font"]).toEqual(["Inter Regular"]);
    expect(layer(original, "background").paint?.["background-color"]).toBe("#f8f4f0");
  });
});
