import { describe, expect, it, vi } from "vitest";

import { pinImageId, renderPinImages } from "./report-pins";

const reports = [
  { category: "pothole", status: "open" },
  { category: "pothole", status: "open" },
  { category: "sidewalk", status: "resolved" },
  { category: "traffic_light", status: "resolved" },
] as const;

describe("identitatea pinului", () => {
  it("dă aceeași identitate aceleiași perechi categorie–stare", () => {
    expect(pinImageId("pothole", "open")).toBe(pinImageId("pothole", "open"));
    expect(pinImageId("pothole", "open")).not.toBe(pinImageId("pothole", "resolved"));
  });

  it("adună sub o singură identitate toate sesizările rezolvate", () => {
    expect(pinImageId("sidewalk", "resolved")).toBe(pinImageId("traffic_light", "resolved"));
  });
});

/**
 * Desenul se face pe pânză, iar înregistrarea unei imagini schimbă stilul hărții,
 * ceea ce anunță evenimentul care a cerut înregistrarea. O dată asta a umplut
 * stiva: fiecare trecere redesena tot, deci fiecare trecere pornea alta.
 */
describe("desenarea pinurilor", () => {
  it("nu redesenează nimic dacă totul e deja înregistrat", async () => {
    const registered = vi.fn(() => true);

    await expect(renderPinImages([...reports], 2, registered)).resolves.toEqual([]);
    // Fără o pânză atinsă nu există nici eveniment de stil, deci nici buclă.
    expect(registered).toHaveBeenCalled();
  });

  it("cere desenul o singură dată pentru fiecare identitate distinctă", async () => {
    const asked: string[] = [];
    await renderPinImages([...reports], 1, (id) => {
      asked.push(id);
      return true;
    });

    // Patru sesizări, dar numai două desene: o groapă deschisă și o bifă.
    expect(new Set(asked).size).toBe(2);
  });
});
