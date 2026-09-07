import { describe, expect, it } from "vitest";

import { pickLandmark, type Candidate } from "./landmarks";

/** Ce se află în jurul sesizării de pe aleea dintre blocuri, din Astra. */
const AROUND_THE_ALLEY: Candidate[] = [
  { name: "Karma", kind: "hairdresser", distance: 42 },
  { name: "Stadion ICIM", kind: "stadium", distance: 68 },
  { name: "Loc de joacă Urban Carpaților", kind: "playground", distance: 92 },
  { name: "La Doi Pași", kind: "convenience", distance: 98 },
  { name: "Parcul Henri Berthelot", kind: "park", distance: 105 },
];

describe("alegerea reperului", () => {
  /**
   * Coaforul e cel mai aproape, dar nimeni nu spune „lângă coafor" când are un
   * stadion la șaptezeci de metri.
   */
  it("preferă locul după care se orientează lumea, nu pe cel mai apropiat", () => {
    expect(pickLandmark(AROUND_THE_ALLEY)?.name).toBe("Stadion ICIM");
  });

  it("între două locuri la fel de cunoscute, îl ia pe cel mai apropiat", () => {
    const candidates: Candidate[] = [
      { name: "Parcul Henri Berthelot", kind: "park", distance: 105 },
      { name: "Stadion ICIM", kind: "stadium", distance: 68 },
    ];
    expect(pickLandmark(candidates)?.name).toBe("Stadion ICIM");
  });

  it("coboară la ce are, când nu e nimic cunoscut prin preajmă", () => {
    const candidates: Candidate[] = [
      { name: "Melange", kind: "bakery", distance: 220 },
      { name: "La Doi Pași", kind: "convenience", distance: 98 },
    ];
    expect(pickLandmark(candidates)?.name).toBe("La Doi Pași");
  });

  it("urcă de la un magazin apropiat la un parc ceva mai depărtat", () => {
    const candidates: Candidate[] = [
      { name: "Penny", kind: "supermarket", distance: 40 },
      { name: "Catena", kind: "pharmacy", distance: 20 },
      { name: "Parcul Soarelui", kind: "park", distance: 180 },
    ];
    expect(pickLandmark(candidates)?.name).toBe("Parcul Soarelui");
  });

  /** Peste raza asta „lângă" devine o minciună politicoasă. */
  it("nu se agață de un reper prea depărtat", () => {
    expect(pickLandmark([{ name: "Stadion ICIM", kind: "stadium", distance: 640 }])).toBeNull();
  });

  it("nu întoarce nimic dintr-o listă goală", () => {
    expect(pickLandmark([])).toBeNull();
  });

  it("sare peste lucrurile fără nume", () => {
    const candidates: Candidate[] = [
      { name: "   ", kind: "stadium", distance: 10 },
      { name: "Parcul Henri Berthelot", kind: "park", distance: 105 },
    ];
    expect(pickLandmark(candidates)?.name).toBe("Parcul Henri Berthelot");
  });
});
