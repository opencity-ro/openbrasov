import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

/**
 * Clientul care trece peste regulile de acces din bază.
 *
 * Există pentru un singur lucru: tabelul cu adrese ținute minte, pe care nimeni
 * din afară n-are voie nici să-l citească, nici să-l scrie. Cheia lui deschide
 * toată baza, deci nu pleacă niciodată către browser — de aici și `server-only`,
 * care oprește compilarea dacă fișierul ajunge într-o componentă de client.
 */
let client: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Lipsește SUPABASE_SERVICE_ROLE_KEY. Adresele sesizărilor nu pot fi ținute minte fără ea.",
    );
  }

  // Fără sesiune și fără reîmprospătare: clientul ăsta nu aparține niciunui om,
  // iar o sesiune păstrată între cereri ar amesteca doi vizitatori pe același server.
  client ??= createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}
