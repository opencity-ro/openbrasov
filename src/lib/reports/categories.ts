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
