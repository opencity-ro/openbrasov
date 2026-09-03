import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LogoMark, Wordmark } from "./logo";

describe("brand", () => {
  it("LogoMark is an accessible image named Open Brașov", () => {
    render(<LogoMark />);
    expect(screen.getByRole("img", { name: "Open Brașov" })).toBeInTheDocument();
  });

  it("Wordmark renders the brand text with correct diacritics", () => {
    render(<Wordmark />);
    expect(screen.getByText("Open Brașov")).toBeInTheDocument();
  });
});
