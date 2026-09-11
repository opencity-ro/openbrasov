/**
 * Semnele categoriilor: un set desenat, nu emoji.
 *
 * Emoji arată altfel pe Windows, pe Mac și pe Android — aceeași sesizare avea
 * trei chipuri, iar stilurile se băteau cap în cap pe aceeași hartă. Setul e
 * Fluent Emoji (licență MIT), în varianta 3D: plin, cu volum și lumină proprie,
 * ca să se țină singur pe un disc colorat, fără monedă albă sub el.
 *
 * Fișierele se generează cu `pnpm map:icons` și se versionează în git. Singura
 * intervenție e compunerea a două icoane Fluent acolo unde una nu ajunge.
 */

/**
 * Calea poartă versiunea, ca glifele hărții: fișierele se servesc cu cache de un
 * an, iar un set nou primește un număr nou în loc să lupte cu memoria browserului.
 */
const VERSION = 2;

/**
 * Icoana sesizărilor rezolvate: bifa mare, în locul icoanei categoriei. Pe hartă,
 * o sesizare rezolvată nu mai are nevoie să spună despre ce fusese — contează că
 * s-a terminat, iar bifa se citește mai repede decât orice categorie.
 */
export const RESOLVED_BADGE = "resolved";

export function reportIconUrl(name: string): string {
  return `/report-icons/${VERSION}/${name}.png`;
}

/**
 * Icoanele deja cerute, ținute minte după nume.
 *
 * Se păstrează promisiunea, nu imaginea: două pinuri din aceeași categorie cer
 * icoana în același moment, iar fără asta ar porni două descărcări pentru
 * același fișier. O icoană care n-a venit se întoarce ca `null` — pinul se
 * desenează fără ea, gol pe dinăuntru, în loc să lipsească de pe hartă.
 */
const pending = new Map<string, Promise<HTMLImageElement | null>>();

export function loadReportIcon(name: string): Promise<HTMLImageElement | null> {
  const known = pending.get(name);
  if (known) return known;

  const loading = new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    // Fișierele sunt ale noastre, dar pânza rămâne curată doar dacă spunem asta
    // explicit; altfel nu putem citi înapoi desenul ca să-l dăm hărții.
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = reportIconUrl(name);
  });

  pending.set(name, loading);
  return loading;
}
