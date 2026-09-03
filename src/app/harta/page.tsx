import { MapPinOff } from "lucide-react";
import type { Metadata } from "next";

import { BrasovMap } from "@/components/map/brasov-map";
import { SiteHeader } from "@/components/site/header";
import { t } from "@/lib/messages";

export const metadata: Metadata = {
  title: t.map.title,
  description: t.map.emptyBody,
};

export default function MapPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative flex-1">
        <h1 className="sr-only">{t.map.title}</h1>
        <BrasovMap className="absolute inset-0" />
        <div
          role="note"
          className="bg-card border-border absolute top-4 left-1/2 z-10 flex max-w-sm -translate-x-1/2 items-start gap-3 rounded-2xl border p-4 shadow-md"
        >
          <MapPinOff aria-hidden="true" className="text-accent mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">{t.map.emptyTitle}</p>
            <p className="text-muted-foreground text-sm">{t.map.emptyBody}</p>
          </div>
        </div>
      </main>
    </>
  );
}
