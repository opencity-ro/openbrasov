import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "./site";

describe("resolveSiteUrl", () => {
  it("uses the explicit site URL when it is set", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://openbrasov.ro" })).toBe(
      "https://openbrasov.ro",
    );
  });

  it("falls back when the variable is an empty string", () => {
    // Next inlines unset NEXT_PUBLIC_* variables as "", which used to reach
    // `new URL("")` and break the production build.
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "" })).toBe("https://openbrasov.ro");
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "   " })).toBe("https://openbrasov.ro");
  });

  it("falls back to the Vercel production domain and adds the protocol", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "",
        NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "openbrasov.vercel.app",
      }),
    ).toBe("https://openbrasov.vercel.app");
  });

  it("uses the deployment URL on preview builds", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_VERCEL_URL: "openbrasov-abc123.vercel.app" })).toBe(
      "https://openbrasov-abc123.vercel.app",
    );
  });

  it("always returns a value accepted by the URL constructor", () => {
    expect(() => new URL(resolveSiteUrl({}))).not.toThrow();
  });
});
