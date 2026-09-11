import { t } from "@/lib/messages";

export const REPORT_CATEGORIES = [
  "pothole",
  "sidewalk",
  "street_lighting",
  "water_or_heating",
  "green_space",
  "park",
  "illegal_parking",
  "abandoned_vehicle",
  "crosswalk_marking",
  "road_marking",
  "traffic_light",
  "speed_bump_request",
  "illegal_dumping",
  "waste_collection",
  "unsanitary_land",
  "vandalism",
  "illegal_street_vending",
  "public_space_occupation",
  "illegal_construction",
  "air_quality",
  "stray_animal",
  "wildlife",
  "rodents",
  "insects",
  "public_transport",
  "signage",
  "noise",
  "accessibility",
  "heritage",
  "other",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_STATUSES = ["open", "in_progress", "resolved", "escalated"] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export function categoryLabel(category: ReportCategory): string {
  return t.categories[category] ?? t.categories.other;
}

export function statusLabel(status: ReportStatus): string {
  return t.statuses[status];
}

/**
 * Culoarea stării, într-un singur loc, ca pinul de pe hartă și eticheta din card
 * să nu se depărteze niciodată una de alta.
 */
export const statusColor: Record<ReportStatus, string> = {
  open: "#d97706",
  in_progress: "#2563eb",
  resolved: "#1b5e3b",
  escalated: "#b91c1c",
};

/**
 * Culoarea pinului, după categorie.
 *
 * Pe hartă culoarea spune despre ce e vorba, iar familia de nuanțe spune din ce
 * domeniu: albastrul adânc e drumul, verdele e natura, violetul e ordinea publică.
 * Starea rămâne pe card și în filtre.
 *
 * Nuanțele sunt alese pe icoana care stă deasupra, nu separat de ea. Becul galben
 * pe un disc galben ar fi dispărut, la fel conul portocaliu pe portocaliu, ursul
 * maro pe maro, ninja negru pe violet închis — fiecare culoare de aici a fost
 * probată sub icoana ei, pe ambele teme ale hărții.
 */
export const categoryColor: Record<ReportCategory, string> = {
  pothole: "#1e40af",
  crosswalk_marking: "#2563eb",
  road_marking: "#3b82f6",
  traffic_light: "#f97316",
  speed_bump_request: "#1e3a8a",
  signage: "#0e7490",
  illegal_parking: "#f59e0b",
  abandoned_vehicle: "#94a3b8",
  sidewalk: "#0ea5e9",
  accessibility: "#e11d48",
  street_lighting: "#4338ca",
  water_or_heating: "#155e75",
  green_space: "#bef264",
  park: "#65a30d",
  illegal_dumping: "#ea580c",
  waste_collection: "#1f2937",
  unsanitary_land: "#a16207",
  vandalism: "#a78bfa",
  illegal_street_vending: "#db2777",
  public_space_occupation: "#475569",
  illegal_construction: "#9333ea",
  air_quality: "#7dd3fc",
  noise: "#8b5cf6",
  stray_animal: "#06b6d4",
  wildlife: "#166534",
  rodents: "#fb923c",
  insects: "#0891b2",
  public_transport: "#1d4ed8",
  heritage: "#9f1239",
  other: "#334155",
};

/** O sesizare rezolvată nu mai are categorie de spus: verde deschis, sub bifă. */
const RESOLVED_COLOR = "#bbf7d0";

export function pinColor(category: ReportCategory, status: ReportStatus): string {
  return status === "resolved" ? RESOLVED_COLOR : categoryColor[category];
}
