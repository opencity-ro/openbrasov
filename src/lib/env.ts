import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function readEnv(source: Record<string, string | undefined> = process.env): Env {
  // NEXT_PUBLIC_* values are inlined at build time, so each one must be referenced literally.
  const parsed = schema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Variabile de mediu invalide — ${details}`);
  }

  return parsed.data;
}

/**
 * Validated environment, resolved on first use rather than on import.
 *
 * Validating at import time meant a missing variable broke `next build` while it
 * was still collecting page data, which blocked preview deployments and anyone
 * cloning the repository without our credentials. Deferring it keeps the build
 * independent of configuration while a misconfigured deployment still fails
 * loudly — on the first request that actually needs Supabase, with the same message.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, key: string) {
    cached ??= readEnv();
    return cached[key as keyof Env];
  },
});
