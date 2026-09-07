"use client";

import { MapPinOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { t } from "@/lib/messages";
import {
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  type ReportCategory,
  type ReportStatus,
} from "@/lib/reports/categories";
import type { PublicReport } from "@/lib/reports/queries";

import { BrasovMap } from "./brasov-map";
import { ReportCard } from "./report-card";
import { ReportFocus } from "./report-focus";
import { ReportFiltersBar, type ReportFilters } from "./report-filters";
import { ReportsLayer } from "./reports-layer";

const STATUS_PARAM = "stare";
const CATEGORY_PARAM = "categorie";

/** Cât stă anunțul de hartă goală înainte să plece singur. */
const EMPTY_NOTICE_MS = 6000;

function readList<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (!raw) return [];
  const values = raw.split(",");
  return allowed.filter((value) => values.includes(value));
}

/**
 * Harta cu sesizări.
 *
 * Filtrele stau în adresă, nu doar în memoria paginii: o hartă filtrată pe
 * „gropi nerezolvate" e exact lucrul pe care vrei să-l trimiți cuiva, iar un
 * link care se deschide altfel decât arăta la tine nu ajută pe nimeni.
 */
export function ReportsMap({ reports }: { reports: PublicReport[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filters = useMemo<ReportFilters>(
    () => ({
      statuses: readList<ReportStatus>(params.get(STATUS_PARAM), REPORT_STATUSES),
      categories: readList<ReportCategory>(params.get(CATEGORY_PARAM), REPORT_CATEGORIES),
    }),
    [params],
  );

  const applyFilters = useCallback(
    (next: ReportFilters) => {
      const query = new URLSearchParams(params.toString());
      const set = (key: string, values: string[]) =>
        values.length > 0 ? query.set(key, values.join(",")) : query.delete(key);

      set(STATUS_PARAM, next.statuses);
      set(CATEGORY_PARAM, next.categories);

      const search = query.toString();
      router.replace(search ? `?${search}` : "/harta", { scroll: false });
    },
    [params, router],
  );

  const visible = useMemo(
    () =>
      reports.filter(
        (report) =>
          (filters.statuses.length === 0 || filters.statuses.includes(report.status)) &&
          (filters.categories.length === 0 || filters.categories.includes(report.category)),
      ),
    [reports, filters],
  );

  const selected = useMemo(
    () => visible.find((report) => report.id === selectedId) ?? null,
    [visible, selectedId],
  );

  /**
   * Harta goală se anunță o dată, ca un mesaj care coboară de sus și pleacă
   * singur. Un card fix ar sta peste oraș la nesfârșit, deși nu are ce adăuga
   * după ce l-ai citit o dată.
   */
  const announced = useRef(false);
  useEffect(() => {
    if (announced.current || reports.length > 0) return;
    announced.current = true;

    toast(t.map.emptyTitle, {
      description: t.map.emptyBody,
      icon: <MapPinOff aria-hidden="true" className="text-accent size-5" />,
      duration: EMPTY_NOTICE_MS,
      position: "top-center",
    });
  }, [reports.length]);

  return (
    <BrasovMap className="absolute inset-0">
      <ReportsLayer reports={visible} onSelect={setSelectedId} />
      <ReportFocus selected={selected} />

      {/* Deasupra hărții, dar sub controalele ei, care stau pe margini. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center gap-2 p-3 sm:p-4">
        <ReportFiltersBar filters={filters} onChange={applyFilters} visibleCount={visible.length} />

        {visible.length === 0 && reports.length > 0 && (
          <p
            role="status"
            className="bg-card border-border pointer-events-auto rounded-full border px-4 py-2 text-sm shadow-md"
          >
            {t.map.noMatch}
          </p>
        )}
      </div>

      {selected && <ReportCard report={selected} onClose={() => setSelectedId(null)} />}
    </BrasovMap>
  );
}
