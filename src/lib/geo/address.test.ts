import { describe, expect, it } from "vitest";

import { formatAddress, plusCode } from "./address";

/** Piața Sfatului, ca punct de referință pentru codul locului. */
const CENTER = { lat: 45.6427, lng: 25.5887 };

describe("adresa scrisă din locul de pe hartă", () => {
  it("scrie strada cu numărul și cartierul", () => {
    expect(
      formatAddress(
        { address: { road: "Strada Lungă", house_number: "128", suburb: "Bartolomeu" } },
        CENTER.lat,
        CENTER.lng,
      ),
    ).toEqual({ label: "Strada Lungă, nr. 128, Bartolomeu", kind: "street" });
  });

  it("lasă numărul afară când nu există", () => {
    expect(
      formatAddress(
        { address: { road: "Strada Lungă", neighbourhood: "Bartolomeu" } },
        CENTER.lat,
        CENTER.lng,
      ).label,
    ).toBe("Strada Lungă, Bartolomeu");
  });

  /**
   * Fiecare sesizare e din același oraș, deci scrierea lui la fiecare rând ocupă
   * loc fără să spună nimic.
   */
  it("nu scrie orașul nostru", () => {
    expect(
      formatAddress(
        { address: { road: "Strada Lungă", house_number: "12", city: "Brașov" } },
        CENTER.lat,
        CENTER.lng,
      ).label,
    ).toBe("Strada Lungă, nr. 12");
  });

  it("scrie localitatea când sesizarea nu e în orașul nostru", () => {
    expect(
      formatAddress(
        { address: { road: "Strada Mare", house_number: "4", town: "Râșnov" } },
        CENTER.lat,
        CENTER.lng,
      ).label,
    ).toBe("Strada Mare, nr. 4, Râșnov");
  });

  it("preferă localitatea străină cartierului", () => {
    expect(
      formatAddress(
        { address: { road: "Strada Mare", town: "Codlea", suburb: "Centru" } },
        CENTER.lat,
        CENTER.lng,
      ).label,
    ).toBe("Strada Mare, Codlea");
  });

  it("trece pe reper când nu există stradă", () => {
    expect(
      formatAddress(
        { name: "Parcul Nicolae Titulescu", address: { city: "Brașov" } },
        CENTER.lat,
        CENTER.lng,
      ),
    ).toEqual({ label: "Lângă Parcul Nicolae Titulescu", kind: "landmark" });
  });

  it("găsește reperul și când vine dintr-o cheie a adresei", () => {
    expect(
      formatAddress({ address: { leisure: "Stadionul Tineretului" } }, CENTER.lat, CENTER.lng)
        .label,
    ).toBe("Lângă Stadionul Tineretului");
  });

  /**
   * Pe un drum forestier nu există nici stradă, nici nume. Codul locului e
   * singurul lucru care mai poate fi spus, iar el se citește în orice hartă.
   */
  it("cade pe codul locului când harta nu are nimic de spus", () => {
    const result = formatAddress({ address: {} }, CENTER.lat, CENTER.lng);
    expect(result.kind).toBe("code");
    expect(result.label).toBe(plusCode(CENTER.lat, CENTER.lng));
  });

  it("nu cade pe cod dacă serviciul n-a răspuns deloc", () => {
    expect(formatAddress(null, CENTER.lat, CENTER.lng).kind).toBe("code");
  });

  it("sare peste câmpurile goale ale serviciului", () => {
    expect(
      formatAddress(
        { name: "   ", address: { road: "  ", pedestrian: "Aleea Tiberiu Brediceanu" } },
        CENTER.lat,
        CENTER.lng,
      ).label,
    ).toBe("Aleea Tiberiu Brediceanu");
  });
});

describe("codul locului", () => {
  it("dă un cod întreg, nu unul scurtat", () => {
    const code = plusCode(CENTER.lat, CENTER.lng);
    expect(code).toMatch(/^[23456789CFGHJMPQRVWX]{8}\+[23456789CFGHJMPQRVWX]{2,}$/);
  });

  it("dă coduri diferite pentru locuri diferite", () => {
    expect(plusCode(CENTER.lat, CENTER.lng)).not.toBe(plusCode(45.7, 25.7));
  });
});

/**
 * Răspunsuri adevărate, culese de la serviciu pentru puncte reale din Brașov.
 * Ele au scos la iveală două lucruri pe care le nimerisem greșit din cap:
 * împărțirea administrativă „Zona Metropolitană Brașov", pe care serviciul o
 * trece la fiecare punct și pe care n-o rostește nimeni, și Poiana Brașov, care
 * e trecută ca sat înăuntrul orașului și s-ar fi pierdut cu totul.
 */
describe("răspunsuri adevărate de la serviciu", () => {
  it("stradă fără număr, cu cartier", () => {
    expect(
      formatAddress(
        {
          name: "Strada Stejerișului",
          address: {
            road: "Strada Stejerișului",
            suburb: "Prund-Schei",
            city: "Brașov",
            municipality: "Zona Metropolitană Brașov",
            county: "Brașov",
          },
        },
        45.6461,
        25.5678,
      ).label,
    ).toBe("Strada Stejerișului, Prund-Schei");
  });

  it("stradă cu număr, în centrul istoric", () => {
    expect(
      formatAddress(
        {
          name: "",
          address: {
            house_number: "27",
            road: "Piața Sfatului",
            suburb: "Centrul istoric (Cetatea)",
            city: "Brașov",
            municipality: "Zona Metropolitană Brașov",
          },
        },
        45.6427,
        25.5887,
      ).label,
    ).toBe("Piața Sfatului, nr. 27, Centrul istoric (Cetatea)");
  });

  it("scrie satul din interiorul orașului, nu orașul", () => {
    expect(
      formatAddress(
        {
          address: {
            road: "Strada Poiana lui Neagoe",
            village: "Poiana Brașov",
            city: "Brașov",
            municipality: "Zona Metropolitană Brașov",
          },
        },
        45.5949,
        25.551,
      ).label,
    ).toBe("Strada Poiana lui Neagoe, Poiana Brașov");
  });

  it("pe munte, fără stradă, rămâne numele locului", () => {
    expect(
      formatAddress(
        {
          name: "Padina Lăutei",
          address: {
            locality: "Padina Lăutei",
            city: "Brașov",
            municipality: "Zona Metropolitană Brașov",
          },
        },
        45.573,
        25.533,
      ),
    ).toEqual({ label: "Lângă Padina Lăutei", kind: "landmark" });
  });

  it("în altă localitate, scrie localitatea", () => {
    expect(
      formatAddress(
        {
          name: "Piața Industriei",
          address: {
            road: "Piața Industriei",
            town: "Râșnov",
            municipality: "Zona Metropolitană Brașov",
          },
        },
        45.5893,
        25.46,
      ).label,
    ).toBe("Piața Industriei, Râșnov");
  });
});
