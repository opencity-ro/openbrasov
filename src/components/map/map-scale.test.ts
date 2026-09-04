import { describe, expect, it } from "vitest";

import { formatScaleDistance, niceScaleDistance } from "./map-scale";

describe("niceScaleDistance", () => {
  it("coboară la cea mai mare treaptă rotundă care încape", () => {
    expect(niceScaleDistance(137)).toBe(100);
    expect(niceScaleDistance(299)).toBe(200);
    expect(niceScaleDistance(4_800)).toBe(3_000);
    expect(niceScaleDistance(9_999)).toBe(5_000);
  });

  it("acceptă exact treapta cerută", () => {
    expect(niceScaleDistance(500)).toBe(500);
    expect(niceScaleDistance(1_000)).toBe(1_000);
  });

  it("nu se sufocă la valori imposibile", () => {
    expect(niceScaleDistance(0)).toBe(0);
    expect(niceScaleDistance(Number.NaN)).toBe(0);
  });
});

describe("formatScaleDistance", () => {
  it("scrie metri sub un kilometru și kilometri peste", () => {
    expect(formatScaleDistance(300)).toBe("300 m");
    expect(formatScaleDistance(1_000)).toBe("1 km");
    expect(formatScaleDistance(1_500)).toBe("1.5 km");
  });
});
