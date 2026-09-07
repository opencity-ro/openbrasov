"use client";

import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
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

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2">
      {REPORT_STATUSES.map((status) => {
        const active = filters.statuses.includes(status);
        return (
          <button
            key={status}
            type="button"
            aria-pressed={active}
            onClick={() => onChange({ ...filters, statuses: toggle(filters.statuses, status) })}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium",
              "focus-visible:ring-ring/60 transition-colors outline-none focus-visible:ring-2",
              "border-border/60 bg-card/85 supports-[backdrop-filter]:bg-card/70 backdrop-blur-xl",
              "shadow-[0_1px_2px_rgba(16,24,20,0.10),0_6px_18px_-8px_rgba(16,24,20,0.28)]",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span
              aria-hidden="true"
              className={cn("size-2 rounded-full transition-transform", active && "scale-125")}
              style={{ backgroundColor: statusColor[status] }}
            />
            {statusLabel(status)}
          </button>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-[34px] gap-1.5 rounded-full">
            <SlidersHorizontal aria-hidden="true" />
            {filters.categories.length > 0
              ? `${t.map.category} · ${filters.categories.length}`
              : t.map.allCategories}
            <ChevronDown aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="max-h-[60vh] w-64 overflow-y-auto">
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
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={() => onChange(NO_FILTERS)}
        >
          <Check aria-hidden="true" />
          {t.map.clearFilters}
        </Button>
      )}

      <span
        role="status"
        className="text-muted-foreground bg-card/70 rounded-full px-2 py-1 text-xs backdrop-blur-xl"
      >
        {visibleCount === 1 ? t.map.countOne : t.map.count.replace("{n}", String(visibleCount))}
      </span>
    </div>
  );
}
