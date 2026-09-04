import { describe, expect, it } from "vitest";

import { readEnv } from "./env";

const VALID = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
};

describe("readEnv", () => {
  it("returns the validated public Supabase variables", () => {
    expect(readEnv(VALID)).toEqual(VALID);
  });

  it("throws a readable error when the URL is invalid", () => {
    expect(() => readEnv({ ...VALID, NEXT_PUBLIC_SUPABASE_URL: "not-a-url" })).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });

  it("throws when the publishable key is empty", () => {
    expect(() => readEnv({ ...VALID, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "" })).toThrow(
      /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  });

  it("throws when a variable is missing entirely", () => {
    // Next inlines an unset NEXT_PUBLIC_* variable as undefined during a build
    // with no configuration, which is exactly the preview-deployment case.
    expect(() => readEnv({})).toThrow(/Variabile de mediu invalide/);
  });
});
