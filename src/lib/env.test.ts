import { afterEach, describe, expect, it, vi } from "vitest";

const VALID = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
};

async function loadEnv(overrides: Partial<typeof VALID>) {
  vi.resetModules();
  const values = { ...VALID, ...overrides };
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", values.NEXT_PUBLIC_SUPABASE_URL);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", values.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return import("./env");
}

describe("env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("exposes validated public Supabase variables", async () => {
    const { env } = await loadEnv({});
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe(VALID.NEXT_PUBLIC_SUPABASE_URL);
    expect(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBe(
      VALID.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  });

  it("throws a readable error when the URL is invalid", async () => {
    await expect(loadEnv({ NEXT_PUBLIC_SUPABASE_URL: "not-a-url" })).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });

  it("throws when the publishable key is empty", async () => {
    await expect(loadEnv({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "" })).rejects.toThrow(
      /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/,
    );
  });
});
