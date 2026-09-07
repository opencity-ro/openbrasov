/**
 * Alegerea reperului după care spui unde ești.
 *
 * Serviciul de geocodare întoarce un singur lucru: cel mai apropiat obiect cu
 * adresă. Între blocuri, acela e o parcare fără nume, iar stadionul de la
 * șaptezeci de metri, după care se orientează tot cartierul, nu apare niciodată.
 * De aceea reperele se caută altfel — cu toate candidații deodată — iar aici se
 * alege dintre ei.
 *
 * Alegerea nu e „cel mai apropiat". Un coafor la patruzeci de metri e mai
 * aproape decât stadionul, dar nimeni nu spune „lângă coafor" când are un
 * stadion alături. Contează întâi ce fel de loc e, apoi cât de departe.
 */

export type Candidate = {
  name: string;
  /** Valoarea etichetei care spune ce fel de loc e: `stadium`, `park`, `cafe`. */
  kind: string;
  distance: number;
};

/**
 * Locuri după care se orientează un oraș întreg: le știe și cine trece pe acolo
 * o dată pe an.
 */
const FIRST_RANK = new Set([
  "stadium",
  "park",
  "sports_centre",
  "hospital",
  "school",
  "university",
  "college",
  "museum",
  "theatre",
  "cinema",
  "place_of_worship",
  "cemetery",
  "castle",
  "monument",
  "memorial",
  "ruins",
  "attraction",
  "viewpoint",
  "peak",
  "spring",
  "waterfall",
  "water",
  "station",
  "bus_station",
  "marketplace",
  "townhall",
  "library",
  "zoo",
  "swimming_pool",
  "ice_rink",
]);

/** Locuri de cartier: le știe lumea din jur, nu tot orașul. */
const SECOND_RANK = new Set([
  "playground",
  "pitch",
  "fitness_centre",
  "pharmacy",
  "supermarket",
  "fuel",
  "bank",
  "post_office",
  "kindergarten",
  "hotel",
  "guest_house",
  "restaurant",
  "cafe",
  "fast_food",
  "bar",
  "pub",
  "picnic_site",
  "shelter",
  "clinic",
  "doctors",
  "hunting_stand",
  "wilderness_hut",
]);

/** Cât de departe are voie să fie reperul. Peste atât, „lângă" nu mai e adevărat. */
export const LANDMARK_MAX_M = 250;

function rank(kind: string): number {
  if (FIRST_RANK.has(kind)) return 1;
  if (SECOND_RANK.has(kind)) return 2;
  return 3;
}

/**
 * Reperul cel mai potrivit dintre cele găsite prin preajmă, sau `null` dacă
 * niciunul nu e destul de aproape.
 *
 * Un loc de rang mai bun bate unul mai apropiat, dar numai în limita aceleiași
 * raze: altfel „lângă" ar ajunge să însemne „la trei sute de metri de", ceea ce
 * nu ajută pe nimeni să găsească o groapă.
 */
export function pickLandmark(candidates: readonly Candidate[]): Candidate | null {
  const reachable = candidates.filter(
    (candidate) => candidate.name.trim().length > 0 && candidate.distance <= LANDMARK_MAX_M,
  );
  if (reachable.length === 0) return null;

  return reachable.reduce((best, candidate) => {
    const byRank = rank(candidate.kind) - rank(best.kind);
    if (byRank !== 0) return byRank < 0 ? candidate : best;
    return candidate.distance < best.distance ? candidate : best;
  });
}
