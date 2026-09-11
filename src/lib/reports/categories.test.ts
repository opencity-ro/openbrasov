import { describe, expect, it } from "vitest";

import {
  categoryColor,
  categoryLabel,
  pinColor,
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  statusColor,
  statusLabel,
} from "./categories";

describe("categoriile sesizărilor", () => {
  it("dă fiecărei categorii un nume", () => {
    for (const category of REPORT_CATEGORIES) {
      expect(categoryLabel(category), category).toBeTruthy();
    }
  });

  it("dă fiecărei stări o culoare și un nume", () => {
    for (const status of REPORT_STATUSES) {
      expect(statusColor[status], status).toMatch(/^#[0-9a-f]{6}$/);
      expect(statusLabel(status), status).toBeTruthy();
    }
  });
});

describe("culoarea pinului", () => {
  it("dă fiecărei categorii o culoare", () => {
    for (const category of REPORT_CATEGORIES) {
      expect(categoryColor[category], category).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("urmează categoria cât timp sesizarea nu e rezolvată", () => {
    expect(pinColor("pothole", "open")).toBe(categoryColor.pothole);
    expect(pinColor("pothole", "in_progress")).toBe(categoryColor.pothole);
    expect(pinColor("pothole", "escalated")).toBe(categoryColor.pothole);
  });

  it("dă aceeași culoare oricărei sesizări rezolvate", () => {
    expect(pinColor("pothole", "resolved")).toBe(pinColor("vandalism", "resolved"));
    expect(pinColor("pothole", "resolved")).not.toBe(categoryColor.pothole);
  });
});
