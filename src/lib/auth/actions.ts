"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const emailSchema = z.email({ error: "Adresa de email nu pare corectă." });

export type AuthState = {
  status: "idle" | "sent" | "error";
  message?: string;
  email?: string;
};

/** Origin of the current request, so magic links come back to the right host. */
async function requestOrigin() {
  const headerList = await headers();
  const forwardedHost = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${forwardedHost}`;
}

export async function sendMagicLink(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = emailSchema.safeParse(email);

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0].message, email };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: { emailRedirectTo: `${await requestOrigin()}/auth/callback` },
  });

  if (error) {
    // Rate limiting is the one failure a visitor can act on, so it gets its own text.
    const message =
      error.status === 429
        ? "Prea multe încercări. Mai așteaptă un minut și încearcă din nou."
        : "Nu am putut trimite linkul. Încearcă din nou în câteva momente.";
    return { status: "error", message, email };
  }

  return { status: "sent", email: parsed.data };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await requestOrigin()}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    redirect("/autentificare?eroare=google");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
