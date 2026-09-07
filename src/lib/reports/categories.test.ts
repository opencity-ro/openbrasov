import { describe, expect, it } from "vitest";

import {
  categoryEmojiFor,
  categoryLabel,
  pinEmoji,
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  statusColor,
  statusLabel,
} from "./categories";

describe("categoriile sesizărilor", () => {
  it("dă fiecărei categorii un semn și un nume", () => {
    for (const category of REPORT_CATEGORIES) {
      expect(categoryEmojiFor(category), category).toBeTruthy();
      expect(categoryLabel(category), category).toBeTruthy();
    }
  });

  it("nu repetă același semn la două categorii", () => {
    const emoji = REPORT_CATEGORIES.map(categoryEmojiFor);

    // Două categorii cu același semn ar face harta de necitit fără click.
    expect(new Set(emoji).size).toBe(emoji.length);
  });

  it("dă fiecărei stări o culoare și un nume", () => {
    for (const status of REPORT_STATUSES) {
      expect(statusColor[status], status).toMatch(/^#[0-9a-f]{6}$/);
      expect(statusLabel(status), status).toBeTruthy();
    }
  });
});

describe("semnul de pe pin", () => {
  it("arată categoria cât timp sesizarea e deschisă", () => {
    expect(pinEmoji("pothole", "open")).toBe(categoryEmojiFor("pothole"));
    expect(pinEmoji("pothole", "in_progress")).toBe(categoryEmojiFor("pothole"));
    expect(pinEmoji("pothole", "escalated")).toBe(categoryEmojiFor("pothole"));
  });

  it("arată bifa când e rezolvată, indiferent de categorie", () => {
    const resolved = REPORT_CATEGORIES.map((category) => pinEmoji(category, "resolved"));

    expect(new Set(resolved).size).toBe(1);
    expect(resolved[0]).not.toBe(categoryEmojiFor("pothole"));
  });
});
