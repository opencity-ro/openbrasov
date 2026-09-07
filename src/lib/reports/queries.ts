import "server-only";

import type { ReportCategory, ReportStatus } from "@/lib/reports/categories";
import { createClient } from "@/lib/supabase/server";

export type PublicReport = {
  id: string;
  category: ReportCategory;
  status: ReportStatus;
  description: string;
  latitude: number;
  longitude: number;
  institution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  authorLabel: string | null;
};

type PublicReportRow = {
  id: string;
  category: ReportCategory;
  status: ReportStatus;
  description: string;
  latitude: number;
  longitude: number;
  institution: string | null;
  created_at: string;
  resolved_at: string | null;
  author_label: string | null;
};

/**
 * Every report shown on the map. The city fits comfortably in one request, so
 * the map filters in the browser instead of round-tripping per filter change.
 *
 * The address is not part of it. What a reporter types is a description of where
 * they stood, not a postal address, and it was drifting from the pin they had
 * just dropped. The map is the source of truth for the place: the card asks for
 * the address of the pin's own coordinates when it opens.
 */
export async function listPublicReports(): Promise<PublicReport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_reports")
    .select(
      "id, category, status, description, latitude, longitude, institution, created_at, resolved_at, author_label",
    )
    .order("created_at", { ascending: false })
    .returns<PublicReportRow[]>();

  if (error) {
    // An unreachable database must not blank the page: the map still renders,
    // simply without pins, and the empty state explains itself.
    console.error("Nu am putut citi sesizările publice:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    category: row.category,
    status: row.status,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    institution: row.institution,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    authorLabel: row.author_label,
  }));
}
