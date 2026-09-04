import { describe, expect, it } from "vitest";

import {
  isReliefTileAllowed,
  RELIEF_MAX_ZOOM,
  RELIEF_MIN_ZOOM,
  reliefTileWindow,
} from "./relief-tiles";

/** Dala care conține Piața Sfatului, la fiecare zoom permis. */
function brasovTile(zoom: number) {
  const { minX, maxX, minY, maxY } = reliefTileWindow(zoom);
  return { x: Math.round((minX + maxX) / 2), y: Math.round((minY + maxY) / 2) };
}

describe("isReliefTileAllowed", () => {
  it("acceptă dalele din zona Brașovului", () => {
    for (let zoom = RELIEF_MIN_ZOOM; zoom <= RELIEF_MAX_ZOOM; zoom += 1) {
      const { x, y } = brasovTile(zoom);
      expect(isReliefTileAllowed(zoom, x, y)).toBe(true);
    }
  });

  it("refuză dalele din afara zonei, ca ruta să nu fie un proxy deschis", () => {
    const { x, y } = brasovTile(12);
    expect(isReliefTileAllowed(12, x + 50, y)).toBe(false);
    expect(isReliefTileAllowed(12, x, y - 50)).toBe(false);
  });

  it("refuză zoom-urile din afara intervalului", () => {
    const { x, y } = brasovTile(12);
    expect(isReliefTileAllowed(RELIEF_MIN_ZOOM - 1, x, y)).toBe(false);
    expect(isReliefTileAllowed(RELIEF_MAX_ZOOM + 1, x, y)).toBe(false);
  });

  it("refuză valorile care nu sunt numere întregi", () => {
    expect(isReliefTileAllowed(Number.NaN, 0, 0)).toBe(false);
    expect(isReliefTileAllowed(12, 1.5, 2)).toBe(false);
  });
});
