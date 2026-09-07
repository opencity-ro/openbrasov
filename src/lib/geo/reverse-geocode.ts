import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  AREA_ONLY_KEYS,
  formatAddress,
  type AddressParts,
  type FormattedAddress,
  type ReversePlace,
} from "./address";
import { distanceToGeometry, type Geometry } from "./distance";

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
 * Cât de aproape trebuie să fie lucrul găsit ca să-i luăm adresa.
 *
 * Serviciul întoarce cel mai apropiat obiect cu adresă, oricât de departe ar fi.
 * Pentru sesizările din pădurea de pe Tâmpa a scris numere de case aflate la o
 * sută, două sute, chiar trei sute de metri — o adresă falsă, dar scrisă cu
 * aceeași siguranță ca una adevărată.
 *
 * Numărul cade primul, fiindcă el spune „exact aici": la douăzeci și cinci de
 * metri de o clădire ești deja la casa de alături. Strada ține mai mult, fiindcă
 * de pe trotuar, din curte sau din spatele blocului ești tot pe strada aceea.
 */
const NUMBER_MAX_M = 25;
const STREET_MAX_M = 60;

/**
 * Cât de departe are voie să fie reperul de care ne agățăm când nu există
 * stradă. Mai mult de-atât și „lângă" devine o minciună politicoasă.
 */
const LANDMARK_MAX_M = 300;

/**
 * Feluri de locuri care nu se folosesc drept reper, oricât de aproape ar fi.
 *
 * Serviciul întoarce și birouri, firme și dispecerate. „Lângă Dispecerat
 * National Salvamont A.N.S.M.R." e adevărat, dar nu e felul în care spune un om
 * unde se află; un izvor, o cabană sau un loc de popas, da.
 */
const NOT_A_LANDMARK = new Set(["office", "emergency", "shop", "craft", "healthcare"]);

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

type Found = ReversePlace & { geojson?: Geometry | null; category?: string | null };

async function ask(latitude: number, longitude: number, layer?: string): Promise<Found | null> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  // Forma întreagă a obiectului găsit. Fără ea am avea doar centrul lui, iar
  // centrul unei străzi de un kilometru nu spune nimic despre unde stăm noi.
  url.searchParams.set("polygon_geojson", "1");
  url.searchParams.set("accept-language", "ro");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  // 18 înseamnă „cea mai mică bucată cu adresă": clădirea, nu cartierul.
  if (layer) url.searchParams.set("layer", layer);
  else url.searchParams.set("zoom", "18");

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) return null;

  const body: unknown = await response.json();
  if (!body || typeof body !== "object" || "error" in body) return null;
  return body as Found;
}

/**
 * Ce a mai rămas adevărat din răspuns, după ce l-am măsurat.
 *
 * Părțile care spun unde ești — numărul, apoi strada — cad pe rând, pe măsură ce
 * obiectul găsit se dovedește prea departe. Ce rămâne mereu e localitatea și
 * cartierul: ele acoperă un teritoriu întreg, deci nu pot fi „prea departe".
 */
function trim(found: Found | null, latitude: number, longitude: number): ReversePlace | null {
  if (!found?.address) return null;

  const distance = distanceToGeometry(latitude, longitude, found.geojson);
  const measured = distance ?? Infinity;
  const address = { ...found.address };

  if (measured > NUMBER_MAX_M) delete address.house_number;

  if (measured > STREET_MAX_M) {
    // Numele, strada și felul obiectului cad toate deodată: sunt ale lucrului
    // aflat prea departe. Dacă am fi păstrat numai strada, un „Dispecerat
    // Salvamont" de la două sute de metri ar fi trecut drept reper de-al locului.
    const area: AddressParts = {};
    for (const key of AREA_ONLY_KEYS) if (address[key]) area[key] = address[key];
    return { address: area };
  }

  return { name: found.name, address };
}

/**
 * Reperul cel mai apropiat, când nu suntem pe nicio stradă: un izvor, o cabană,
 * un loc de popas. Se cere abia atunci, ca a doua întrebare, fiindcă la o
 * sesizare obișnuită de pe stradă n-are cine s-o folosească.
 */
async function nearbyLandmark(latitude: number, longitude: number): Promise<string | null> {
  const found = await inLine(() => ask(latitude, longitude, "poi,natural,manmade"));
  const name = found?.name?.trim();
  if (!name || NOT_A_LANDMARK.has(found?.category ?? "")) return null;

  const distance = distanceToGeometry(latitude, longitude, found?.geojson);
  return distance !== null && distance <= LANDMARK_MAX_M ? name : null;
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

  let found: Found | null = null;
  let place: ReversePlace | null = null;
  try {
    found = await inLine(() => ask(latitude, longitude));
    place = trim(found, latitude, longitude);

    if (!place?.address?.road && !place?.name) {
      const landmark = await nearbyLandmark(latitude, longitude);
      if (landmark) place = { name: landmark, address: place?.address ?? {} };
    }
  } catch (error) {
    console.error("Geocodarea inversă a eșuat:", error);
  }

  const address = formatAddress(place, latitude, longitude);

  const { error } = await supabase.from("geocoded_addresses").upsert(
    {
      cell,
      label: address.label,
      kind: address.kind,
      // Forma geometrică rămâne afară: conturul unei păduri are zeci de mii de
      // puncte, iar noi n-avem ce face cu ele după ce am măsurat o dată.
      raw: found ? { name: found.name, address: found.address } : null,
    },
    { onConflict: "cell" },
  );

  // Dacă memorarea eșuează, omul tot își vede adresa; doar că data viitoare se
  // întreabă din nou. Merită un semn în jurnal, nu o pagină ruptă.
  if (error) console.error("Nu am putut ține minte adresa:", error.message);

  return address;
}
