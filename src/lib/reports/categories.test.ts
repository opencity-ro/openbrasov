import { describe, expect, it } from "vitest";

import {
  categoryLabel,
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
