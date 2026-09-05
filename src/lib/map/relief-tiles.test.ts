import { describe, expect, it } from "vitest";

import {
  isReliefTileAllowed,
  RELIEF_MAX_ZOOM,
  RELIEF_MIN_ZOOM,
  reliefTileWindow,
} from "./relief-tiles";

/** Dala din mijlocul zonei permise, la fiecare zoom. */
function insideTile(zoom: number) {
  const { minX, maxX, minY, maxY } = reliefTileWindow(zoom);
  return { x: Math.round((minX + maxX) / 2), y: Math.round((minY + maxY) / 2) };
}

describe("isReliefTileAllowed", () => {
  it("acceptă dalele din zona acoperită", () => {
    for (let zoom = RELIEF_MIN_ZOOM; zoom <= RELIEF_MAX_ZOOM; zoom += 1) {
      const { x, y } = insideTile(zoom);
      expect(isReliefTileAllowed(zoom, x, y)).toBe(true);
    }
  });

  it("refuză dalele de pe alte continente, ca ruta să nu fie un proxy deschis", () => {
    const { minX, maxX, minY, maxY } = reliefTileWindow(12);

    // Alpii, la vest de fereastră, și nordul Scandinaviei, deasupra ei.
    expect(isReliefTileAllowed(12, minX - 1, minY)).toBe(false);
    expect(isReliefTileAllowed(12, maxX + 1, minY)).toBe(false);
    expect(isReliefTileAllowed(12, minX, minY - 1)).toBe(false);
    expect(isReliefTileAllowed(12, minX, maxY + 1)).toBe(false);
  });

  it("refuză zoom-urile din afara intervalului", () => {
    const { x, y } = insideTile(12);
    expect(isReliefTileAllowed(RELIEF_MIN_ZOOM - 1, x, y)).toBe(false);
    expect(isReliefTileAllowed(RELIEF_MAX_ZOOM + 1, x, y)).toBe(false);
  });

  it("refuză valorile care nu sunt numere întregi", () => {
    expect(isReliefTileAllowed(Number.NaN, 0, 0)).toBe(false);
    expect(isReliefTileAllowed(12, 1.5, 2)).toBe(false);
  });
});
