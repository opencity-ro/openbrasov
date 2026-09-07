import { describe, expect, it } from "vitest";

import { distanceToGeometry } from "./distance";

/** Piața Sfatului. Un grad de latitudine e ~111 km peste tot pe glob. */
const LAT = 45.6427;
const LNG = 25.5887;

/** Cât înseamnă un metru în grade, la latitudinea Brașovului. */
const METRE_LAT = 1 / 111_195;
const METRE_LNG = METRE_LAT / Math.cos((LAT * Math.PI) / 180);

const near = (value: number | null, expected: number, tolerance = 1.5) => {
  expect(value).not.toBeNull();
  expect(Math.abs((value as number) - expected)).toBeLessThan(tolerance);
};

describe("distanța până la forma găsită", () => {
  it("nu spune nimic când forma lipsește", () => {
    expect(distanceToGeometry(LAT, LNG, null)).toBeNull();
    expect(distanceToGeometry(LAT, LNG, undefined)).toBeNull();
  });

  it("măsoară până la un punct, pe latitudine", () => {
    const geometry = { type: "Point", coordinates: [LNG, LAT + 100 * METRE_LAT] } as const;
    near(distanceToGeometry(LAT, LNG, geometry), 100);
  });

  it("strânge longitudinea cu latitudinea", () => {
    // Un grad de longitudine e cu ~30% mai scurt aici decât unul de latitudine.
    // O socoteală care nu ține cont ar da 100 în loc de 70.
    const geometry = { type: "Point", coordinates: [LNG + 100 * METRE_LAT, LAT] } as const;
    near(distanceToGeometry(LAT, LNG, geometry), 100 * Math.cos((LAT * Math.PI) / 180), 2);
  });

  /**
   * Coordonatele unei străzi arată mijlocul ei. O sesizare de la capătul unei
   * străzi de un kilometru e pe stradă, deși e departe de mijlocul ei — de asta
   * măsurăm până la linie, nu până la un punct.
   */
  it("măsoară până la linia străzii, nu până la mijlocul ei", () => {
    const street = {
      type: "LineString",
      coordinates: [
        [LNG - 500 * METRE_LNG, LAT],
        [LNG + 500 * METRE_LNG, LAT],
      ],
    } as const;
    near(distanceToGeometry(LAT + 10 * METRE_LAT, LNG + 480 * METRE_LNG, street), 10);
  });

  it("se oprește la capătul segmentului, nu pe prelungirea lui", () => {
    const street = {
      type: "LineString",
      coordinates: [
        [LNG, LAT],
        [LNG + 100 * METRE_LNG, LAT],
      ],
    } as const;
    // Punctul e la 200 m dincolo de capăt: distanța e până la capăt, nu până la linie.
    near(distanceToGeometry(LAT, LNG + 300 * METRE_LNG, street), 200, 2);
  });

  it("ia cea mai apropiată dintre mai multe linii", () => {
    const geometry = {
      type: "MultiLineString",
      coordinates: [
        [
          [LNG, LAT + 300 * METRE_LAT],
          [LNG + 100 * METRE_LNG, LAT + 300 * METRE_LAT],
        ],
        [
          [LNG, LAT + 20 * METRE_LAT],
          [LNG + 100 * METRE_LNG, LAT + 20 * METRE_LAT],
        ],
      ],
    } as const;
    near(distanceToGeometry(LAT, LNG + 50 * METRE_LNG, geometry), 20);
  });

  /** Într-o curte sau într-o pădure ești la fața locului, nu lângă ea. */
  it("dă zero pentru un punct dinăuntrul unei suprafețe", () => {
    const square = {
      type: "Polygon",
      coordinates: [
        [
          [LNG - 50 * METRE_LNG, LAT - 50 * METRE_LAT],
          [LNG + 50 * METRE_LNG, LAT - 50 * METRE_LAT],
          [LNG + 50 * METRE_LNG, LAT + 50 * METRE_LAT],
          [LNG - 50 * METRE_LNG, LAT + 50 * METRE_LAT],
          [LNG - 50 * METRE_LNG, LAT - 50 * METRE_LAT],
        ],
      ],
    } as const;
    expect(distanceToGeometry(LAT, LNG, square)).toBe(0);
  });

  it("măsoară până la marginea suprafeței când ești pe dinafară", () => {
    const square = {
      type: "Polygon",
      coordinates: [
        [
          [LNG - 50 * METRE_LNG, LAT - 50 * METRE_LAT],
          [LNG + 50 * METRE_LNG, LAT - 50 * METRE_LAT],
          [LNG + 50 * METRE_LNG, LAT + 50 * METRE_LAT],
          [LNG - 50 * METRE_LNG, LAT + 50 * METRE_LAT],
          [LNG - 50 * METRE_LNG, LAT - 50 * METRE_LAT],
        ],
      ],
    } as const;
    near(distanceToGeometry(LAT + 130 * METRE_LAT, LNG, square), 80, 2);
  });

  it("ia cea mai apropiată dintre mai multe suprafețe", () => {
    const box = (offsetMetres: number) => [
      [
        [LNG - 10 * METRE_LNG, LAT + (offsetMetres - 10) * METRE_LAT],
        [LNG + 10 * METRE_LNG, LAT + (offsetMetres - 10) * METRE_LAT],
        [LNG + 10 * METRE_LNG, LAT + (offsetMetres + 10) * METRE_LAT],
        [LNG - 10 * METRE_LNG, LAT + (offsetMetres + 10) * METRE_LAT],
        [LNG - 10 * METRE_LNG, LAT + (offsetMetres - 10) * METRE_LAT],
      ],
    ];
    const geometry = {
      type: "MultiPolygon",
      coordinates: [box(500), box(60)],
    } as const;
    near(distanceToGeometry(LAT, LNG, geometry), 50, 2);
  });

  it("nu se împiedică de o formă pe care nu o cunoaște", () => {
    expect(
      distanceToGeometry(LAT, LNG, { type: "GeometryCollection" } as never as null),
    ).toBeNull();
  });
});
