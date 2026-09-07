import { resolveAddress } from "@/lib/geo/reverse-geocode";

/**
 * Fereastra în care răspundem: zona metropolitană, plus o margine largă pentru
 * munții și satele din jur. Nu e o limită a hărții, ci a acestei rute — fără ea,
 * oricine ar putea folosi serverul nostru ca să geocodeze planeta pe cheltuiala
 * și pe reputația noastră.
 */
const WINDOW = { south: 45.25, north: 46.03, west: 25.1, east: 26.1 };

/** Un punct nu-și schimbă adresa. Răspunsul poate sta un an în orice cache. */
const CACHE_CONTROL = "public, max-age=86400, s-maxage=31536000, immutable";

function coordinate(raw: string | null, min: number, max: number): number | null {
  if (raw === null) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) return null;
  return value;
}

/**
 * Adresa unei coordonate, scrisă pentru oameni.
 *
 * Trece pe la noi ca să adăugăm capul de identificare cerut, să respectăm o
 * singură întrebare pe secundă și să ținem minte răspunsul. Chemat direct din
 * browserul fiecărui vizitator, serviciul de geocodare ne-ar bloca.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const latitude = coordinate(params.get("lat"), WINDOW.south, WINDOW.north);
  const longitude = coordinate(params.get("lng"), WINDOW.west, WINDOW.east);

  if (latitude === null || longitude === null) {
    return Response.json(
      { error: "Punctul cerut este în afara zonei Brașovului." },
      { status: 400 },
    );
  }

  try {
    const address = await resolveAddress(latitude, longitude);
    return Response.json(address, { headers: { "Cache-Control": CACHE_CONTROL } });
  } catch (error) {
    console.error("Nu am putut afla adresa:", error);
    return Response.json({ error: "Adresa nu este disponibilă acum." }, { status: 503 });
  }
}
