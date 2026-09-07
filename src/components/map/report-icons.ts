import type { ReportCategory, ReportStatus } from "@/lib/reports/categories";

/**
 * Semnele categoriilor: un set desenat, nu emoji.
 *
 * Emoji arată altfel pe Windows, pe Mac și pe Android — aceeași sesizare avea
 * trei chipuri, iar stilurile se băteau cap în cap pe aceeași hartă. Setul e
 * Fluent Emoji, licență MIT, luat **așa cum e livrat**: fără desene adăugate de
 * noi peste el și fără filtre proprii. Tocmai retușurile fac un set să arate
 * peticit, iar contrastul se rezolvă la desenare, nu stricând icoana.
 */

/**
 * Calea poartă versiunea, ca glifele hărții: fișierele se servesc cu cache de un
 * an, iar un set nou primește un număr nou în loc să lupte cu memoria browserului.
 */
const VERSION = 1;

/** Numele fișierului pentru o sesizare. O sesizare rezolvată arată la fel, oricare i-ar fi categoria. */
export function reportIconName(category: ReportCategory, status: ReportStatus): string {
  return status === "resolved" ? "resolved" : category;
}

export function reportIconUrl(name: string): string {
  return `/report-icons/${VERSION}/${name}.svg`;
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
