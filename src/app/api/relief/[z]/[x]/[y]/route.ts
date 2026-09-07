import { isReliefTileAllowed, RELIEF_TILE_ORIGIN } from "@/lib/map/relief-tiles";

type RouteContext = { params: Promise<{ z: string; x: string; y: string }> };

/** Un an: dalele de relief nu se schimbă, iar CDN-ul le servește apoi fără funcție. */
const CACHE_CONTROL = "public, max-age=31536000, s-maxage=31536000, immutable";

/**
 * Proxy pentru dalele de elevație folosite de modul 3D. Există doar ca să adauge
 * antetul CORS pe care sursa nu îl trimite; fereastra de dale îl ține legat de Brașov.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { z, x, y } = await context.params;
  const zoom = Number(z);
  const tileX = Number(x);
  const tileY = Number(y);

  if (!isReliefTileAllowed(zoom, tileX, tileY)) {
    return new Response("Dala cerută este în afara zonei Brașovului.", { status: 404 });
  }

  const upstream = await fetch(`${RELIEF_TILE_ORIGIN}/${zoom}/${tileX}/${tileY}.png`);

  if (!upstream.ok || !upstream.body) {
    return new Response("Relieful nu este disponibil acum.", { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": CACHE_CONTROL,
      "Access-Control-Allow-Origin": "*",
    },
  });
}
