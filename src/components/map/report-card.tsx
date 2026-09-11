"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";
import { categoryLabel, statusColor, statusLabel } from "@/lib/reports/categories";
import type { PublicReport } from "@/lib/reports/queries";
import { cn } from "@/lib/utils";

import { reportIconUrl } from "./report-icons";
import { useReportAddress } from "./use-report-address";

const dateFormat = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(value: string): string {
  return dateFormat.format(new Date(value));
}

/**
 * Adresa, luată din locul sesizării pe hartă.
 *
 * Cât timp se caută, rândul își ține locul cu o bară în locul textului. Fără ea
 * cardul ar sări în sus la fiecare deschidere, iar ochiul ar pierde rândul pe
 * care tocmai îl citea.
 */
function Address({ latitude, longitude }: { latitude: number; longitude: number }) {
  const address = useReportAddress(latitude, longitude);

  if (address.status === "loading") {
    return (
      <p className="flex h-5 items-center" aria-label={t.map.addressLoading} aria-busy="true">
        <span className="bg-muted h-3 w-3/5 animate-pulse rounded motion-reduce:animate-none" />
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm">
      {address.status === "ready" ? address.label : t.map.addressUnavailable}
    </p>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

/**
 * Detaliile unei sesizări.
 *
 * Pe ecran lat stă în colț, ca harta din spate să rămână vizibilă și să poți
 * compara cu împrejurimile. Pe telefon urcă de jos, unde ajunge degetul.
 */
export function ReportCard({ report, onClose }: { report: PublicReport; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape închide, oriunde ar fi atenția — nu doar când butonul e selectat.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Cardul apare la click pe hartă, deci atenția trebuie dusă la el.
  useEffect(() => {
    closeRef.current?.focus();
  }, [report.id]);

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={categoryLabel(report.category)}
      className={cn(
        "bg-card border-border pointer-events-auto border shadow-lg",
        "animate-in fade-in slide-in-from-bottom-4 duration-200 motion-reduce:animate-none",
        // Telefon: panou lipit de marginea de jos. Desktop: card în colț.
        "fixed inset-x-0 bottom-0 rounded-t-2xl pb-[max(1rem,env(safe-area-inset-bottom))]",
        "sm:absolute sm:inset-x-auto sm:top-4 sm:bottom-auto sm:left-4 sm:w-[22rem] sm:rounded-2xl sm:pb-4",
      )}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        {/*
         * Semnul stă singur, fără disc în spate. Cercul colorat repeta culoarea
         * pe care o spune deja bulina de sub titlu, iar semnul, strâns înăuntru,
         * se citea mai greu decât pe hartă.
         */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reportIconUrl(report.category)}
          alt=""
          aria-hidden="true"
          width={32}
          height={32}
          className="size-8 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <p className="leading-tight font-semibold">{categoryLabel(report.category)}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ backgroundColor: statusColor[report.status] }}
            />
            <span className="text-muted-foreground">{statusLabel(report.status)}</span>
          </p>
        </div>

        <Button
          ref={closeRef}
          variant="ghost"
          size="icon"
          aria-label={t.map.close}
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      <div className="space-y-3 px-4">
        <p className="text-sm leading-relaxed">{report.description}</p>
        <Address latitude={report.latitude} longitude={report.longitude} />

        <div className="border-border space-y-1.5 border-t pt-3">
          <Row label={t.map.reportedOn} value={formatDate(report.createdAt)} />
          {report.resolvedAt && (
            <Row label={t.map.resolvedOn} value={formatDate(report.resolvedAt)} />
          )}
          {report.institution && <Row label={t.map.institution} value={report.institution} />}
          {report.authorLabel && <Row label={t.map.reportedBy} value={report.authorLabel} />}
        </div>
      </div>
    </div>
  );
}
