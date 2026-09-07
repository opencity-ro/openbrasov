import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import { formatAddress, type FormattedAddress, type ReversePlace } from "./address";

/**
 * Traducerea unei coordonate în adresă.
 *
 * Trece prin serverul nostru, niciodată din browserul vizitatorului. Serviciul
 * de geocodare cere un cap de cerere care ne identifică, o singură întrebare pe
 * secundă și păstrarea răspunsurilor; un site care întreabă din fiecare browser
 * încalcă toate trei deodată și ajunge blocat pe adresă de internet.
 */

const ENDPOINT = "https://nominatim.openstreetmap.org/reverse";

/**
 * Ne prezentăm la fiecare cerere. Capul implicit al bibliotecilor e refuzat
 * explicit de serviciu, iar fără el nu se știe cine trebuie anunțat dacă ceva
 * merge prost.
 */
const USER_AGENT = "OpenBrasov/1.0 (+https://openbrasov.ro)";

/** O întrebare pe secundă, cu puțin peste, ca să nu ne apropiem de limită. */
const MIN_GAP_MS = 1100;

/** Serviciul e departe; peste atât renunțăm și dăm codul locului. */
const TIMEOUT_MS = 6000;

/**
 * Cinci zecimale, adică circa un metru. Sub atât, două atingeri ale aceleiași
 * clădiri ar cere fiecare câte un răspuns nou, deși e vorba de același loc.
 */
export function cellKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)},${longitude.toFixed(5)}`;
}

/**
 * Cererile pleacă una după alta, la distanță de o secundă.
 *
 * Firul e per proces, iar în producție pot exista mai multe procese deodată.
 * Nu e o problemă: o cerere pleacă doar la prima vedere a unui punct nou, deci
 * două plecări în aceeași secundă cer două sesizări deschise simultan, amândouă
 * niciodată văzute până atunci.
 */
let lastDeparture = 0;
let line: Promise<unknown> = Promise.resolve();

function inLine<T>(task: () => Promise<T>): Promise<T> {
  const run = line.then(async () => {
    const wait = MIN_GAP_MS - (Date.now() - lastDeparture);
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastDeparture = Date.now();
    return task();
  });
  // Un eșec nu are voie să rupă rândul pentru cei din spate.
  line = run.catch(() => undefined);
  return run;
}

async function ask(latitude: number, longitude: number): Promise<ReversePlace | null> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  // 18 înseamnă „cea mai mică bucată cu adresă": clădirea, nu cartierul.
  url.searchParams.set("zoom", "18");
  url.searchParams.set("accept-language", "ro");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) return null;

  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || "error" in body) return null;
  return body as ReversePlace;
}

/**
 * Adresa punctului, din memorie dacă a mai fost cerută, altfel de la serviciu.
 *
 * Nimic din ce se întâmplă aici nu are voie să lase sesizarea fără adresă: dacă
 * baza tace sau serviciul e picat, rămâne codul locului, care se calculează la
 * noi și nu poate să eșueze.
 */
export async function resolveAddress(
  latitude: number,
  longitude: number,
): Promise<FormattedAddress> {
  const cell = cellKey(latitude, longitude);
  const supabase = createAdminClient();

  const { data: remembered } = await supabase
    .from("geocoded_addresses")
    .select("label, kind")
    .eq("cell", cell)
    .maybeSingle();

  if (remembered) {
    return { label: remembered.label as string, kind: remembered.kind as FormattedAddress["kind"] };
  }

  let place: ReversePlace | null = null;
  try {
    place = await inLine(() => ask(latitude, longitude));
  } catch (error) {
    console.error("Geocodarea inversă a eșuat:", error);
  }

  const address = formatAddress(place, latitude, longitude);

  const { error } = await supabase
    .from("geocoded_addresses")
    .upsert({ cell, label: address.label, kind: address.kind, raw: place }, { onConflict: "cell" });

  // Dacă memorarea eșuează, omul tot își vede adresa; doar că data viitoare se
  // întreabă din nou. Merită un semn în jurnal, nu o pagină ruptă.
  if (error) console.error("Nu am putut ține minte adresa:", error.message);

  return address;
}
