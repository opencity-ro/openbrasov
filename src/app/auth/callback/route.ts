import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for magic links and for the Google redirect. Supabase sends the
 * visitor here with a one-time code, which is exchanged for a session cookie.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/harta";

  if (!code) {
    return NextResponse.redirect(`${origin}/autentificare?eroare=link`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/autentificare?eroare=link`);
  }

  // Only same-site paths are honoured, so a crafted link cannot bounce the
  // visitor to another host while carrying a fresh session.
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/harta";
  return NextResponse.redirect(`${origin}${destination}`);
}
