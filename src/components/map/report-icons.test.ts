import { readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { REPORT_CATEGORIES } from "@/lib/reports/categories";

import { RESOLVED_BADGE, reportIconUrl } from "./report-icons";

/**
 * Fișierele sunt servite de la calea publică, nu importate, deci nimic din
 * compilare nu observă dacă unul lipsește. O categorie fără icoană ar ajunge pe
 * hartă ca un pin gol, iar un fișier rămas în urmă ar fi trimis degeaba în
 * pachet — de asta se numără aici, față de folderul adevărat.
 */
const FOLDER = join(process.cwd(), "public", "report-icons", "2");

const onDisk = new Set(
  readdirSync(FOLDER)
    .filter((file) => file.endsWith(".png"))
    .map((file) => file.replace(/\.png$/, "")),
);

describe("setul de icoane", () => {
  it("are un fișier pentru fiecare categorie", () => {
    const missing = REPORT_CATEGORIES.filter((category) => !onDisk.has(category));
    expect(missing).toEqual([]);
  });

  it("are un fișier și pentru sesizarea rezolvată", () => {
    expect(onDisk.has("resolved")).toBe(true);
  });

  it("nu ține fișiere pe care nu le cere nimeni", () => {
    const wanted = new Set<string>([...REPORT_CATEGORIES, "resolved"]);
    const orphans = [...onDisk].filter((name) => !wanted.has(name));
    expect(orphans).toEqual([]);
  });

  it("are fișier pentru insigna sesizărilor rezolvate", () => {
    expect(onDisk.has(RESOLVED_BADGE)).toBe(true);
  });

  /** Calea poartă versiunea, ca glifele: fișierele se servesc cu cache de un an. */
  it("cere fișierele de pe o cale versionată", () => {
    expect(reportIconUrl("pothole")).toMatch(/^\/report-icons\/\d+\/pothole\.png$/);
  });
});
