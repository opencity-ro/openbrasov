"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { t } from "@/lib/messages";
import {
  categoryEmojiFor,
  categoryLabel,
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  statusColor,
  statusLabel,
  type ReportCategory,
  type ReportStatus,
} from "@/lib/reports/categories";
import { cn } from "@/lib/utils";

export type ReportFilters = {
  statuses: ReportStatus[];
  categories: ReportCategory[];
};

export const NO_FILTERS: ReportFilters = { statuses: [], categories: [] };

export function filtersAreEmpty(filters: ReportFilters): boolean {
  return filters.statuses.length === 0 && filters.categories.length === 0;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/**
 * Suprafața filtrelor, aceeași pentru toate.
 *
 * Aproape opacă, nu translucidă: peste o hartă închisă, un fundal la 70% lăsa
 * strada să treacă prin buton și textul devenea greu de citit. Blurul rămâne,
 * fiindcă el separă bara de oraș; opacitatea o face lizibilă.
 */
const CHIP_SURFACE = cn(
  "border-border bg-card/95 supports-[backdrop-filter]:bg-card/85 backdrop-blur-xl",
  "shadow-[0_1px_2px_rgba(16,24,20,0.12),0_6px_18px_-8px_rgba(16,24,20,0.3)]",
  "dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_6px_18px_-8px_rgba(0,0,0,0.7)]",
);

const CHIP_SHAPE = cn(
  "flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium",
  "focus-visible:ring-ring/60 outline-none transition-colors focus-visible:ring-2",
);

/**
 * Filtrele hărții.
 *
 * Stările stau la vedere, ca butoane: sunt patru și sunt întrebarea pe care o
 * pune toată lumea — ce s-a rezolvat și ce nu. Categoriile sunt treizeci, deci
 * intră într-o listă; scoase la vedere ar acoperi orașul.
 *
 * Niciun filtru bifat înseamnă „arată tot", nu „nu arăta nimic": harta nu începe
 * goală doar pentru că nimeni n-a apăsat încă nimic.
 */
export function ReportFiltersBar({
  filters,
  onChange,
  visibleCount,
}: {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  visibleCount: number;
}) {
  const empty = filtersAreEmpty(filters);
  const chosenCategories = filters.categories.length;

  return (
    <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
      {REPORT_STATUSES.map((status) => {
        const active = filters.statuses.includes(status);
        const color = statusColor[status];

        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            onClick={() => onChange({ ...filters, statuses: toggle(filters.statuses, status) })}
            className={cn(
              CHIP_SHAPE,
              CHIP_SURFACE,
              active
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
            style={
              // Selecția se vede din trei lucruri deodată — fundal colorat, contur
              // colorat, text îngroșat. Doar mărirea bulinei trecea neobservată.
              active
                ? { backgroundColor: `${color}26`, borderColor: color, color: undefined }
                : undefined
            }
          >
            <span
              aria-hidden="true"
              className={cn("rounded-full transition-all", active ? "size-2.5" : "size-2")}
              style={{
                backgroundColor: color,
                boxShadow: active ? `0 0 0 3px ${color}33` : undefined,
              }}
            />
            {statusLabel(status)}
          </button>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              CHIP_SHAPE,
              CHIP_SURFACE,
              chosenCategories > 0
                ? "text-foreground border-accent font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            {chosenCategories > 0 ? `${t.map.category} · ${chosenCategories}` : t.map.allCategories}
            <ChevronDown aria-hidden="true" className="size-4 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="max-h-[60vh] w-64 overflow-y-auto">
          {REPORT_CATEGORIES.map((category) => (
            <DropdownMenuCheckboxItem
              key={category}
              checked={filters.categories.includes(category)}
              onCheckedChange={() =>
                onChange({ ...filters, categories: toggle(filters.categories, category) })
              }
            >
              <span aria-hidden="true" className="mr-1.5">
                {categoryEmojiFor(category)}
              </span>
              {categoryLabel(category)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {!empty && (
        <button
          type="button"
          onClick={() => onChange(NO_FILTERS)}
          className={cn(CHIP_SHAPE, CHIP_SURFACE, "text-muted-foreground hover:text-foreground")}
        >
          <X aria-hidden="true" className="size-4" />
          {t.map.clearFilters}
        </button>
      )}

      <span
        role="status"
        className={cn(
          "text-muted-foreground flex h-9 items-center rounded-full border px-3 text-xs",
          CHIP_SURFACE,
        )}
      >
        {visibleCount === 1 ? t.map.countOne : t.map.count.replace("{n}", String(visibleCount))}
      </span>
    </div>
  );
}
