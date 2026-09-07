/** Lățimea maximă a barei de scară, în pixeli. Bara reală e mai scurtă sau egală. */
export const SCALE_MAX_WIDTH = 88;

const NICE_STEPS = [1, 2, 3, 5];

/**
 * Cea mai mare distanță „rotundă" care încape în lățimea dată. O bară care scrie
 * 137 m nu se citește; una care scrie 100 m se citește dintr-o privire.
 */
export function niceScaleDistance(maxMeters: number): number {
  if (!Number.isFinite(maxMeters) || maxMeters <= 0) return 0;

  const magnitude = 10 ** Math.floor(Math.log10(maxMeters));
  const candidates = [...NICE_STEPS.map((step) => step * magnitude), 10 * magnitude];

  return candidates.filter((value) => value <= maxMeters).pop() ?? magnitude;
}

export function formatScaleDistance(meters: number): string {
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${Number.isInteger(km) ? km : km.toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}
