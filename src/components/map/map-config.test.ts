import { describe, expect, it } from "vitest";

import { BRASOV_BOUNDS, BRASOV_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL, MIN_ZOOM } from "./map-config";

describe("map config", () => {
  it("centrează pe Brașov, în interiorul zonei metropolitane", () => {
    const [lng, lat] = BRASOV_CENTER;
    const [[west, south], [east, north]] = BRASOV_BOUNDS;
    expect(lng).toBeGreaterThan(west);
    expect(lng).toBeLessThan(east);
    expect(lat).toBeGreaterThan(south);
    expect(lat).toBeLessThan(north);
  });

  it("folosește dalele OpenFreeMap și pornește pe orașul întreg", () => {
    expect(MAP_STYLE_URL).toMatch(/^https:\/\/tiles\.openfreemap\.org\/styles\//);
    expect(DEFAULT_ZOOM).toBe(12);
  });

  it("lasă navigarea liberă până la nivelul continentului", () => {
    expect(MIN_ZOOM).toBeLessThanOrEqual(4);
  });
});
