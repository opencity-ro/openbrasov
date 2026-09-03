import { describe, expect, it } from "vitest";

import { BRASOV_BOUNDS, BRASOV_CENTER, DEFAULT_ZOOM, MAP_STYLE_URL } from "./map-config";

describe("map config", () => {
  it("centres on Brașov inside the allowed bounds", () => {
    const [lng, lat] = BRASOV_CENTER;
    const [[west, south], [east, north]] = BRASOV_BOUNDS;
    expect(lng).toBeGreaterThan(west);
    expect(lng).toBeLessThan(east);
    expect(lat).toBeGreaterThan(south);
    expect(lat).toBeLessThan(north);
  });

  it("uses OpenFreeMap tiles and a city-level zoom", () => {
    expect(MAP_STYLE_URL).toMatch(/^https:\/\/tiles\.openfreemap\.org\/styles\//);
    expect(DEFAULT_ZOOM).toBe(13);
  });
});
