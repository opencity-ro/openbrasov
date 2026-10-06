"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BrasovMap } from "@/components/map/brasov-map";
import { ReportsLayer } from "@/components/map/reports-layer";
import { t } from "@/lib/messages";
import type { PublicReport } from "@/lib/reports/queries";

/** Mai aproape decât harta întreagă: într-un cadru mic, orașul tot ar fi o pată. */
const PREVIEW_ZOOM = 12.6;

/**
 * Harta de pe pagina de pornire.
 *
 * E harta adevărată, cu sesizările adevărate, nu o captură și nici un desen care
 * seamănă cu o hartă. Dacă pagina promite că poți vedea ce s-a raportat în oraș,
 * primul lucru pe care îl arată trebuie să fie chiar lucrul promis.
 *
 * Se încarcă abia când se apropie de ecran: MapLibre plus dalele sunt cea mai
 * grea parte a paginii, iar cineva care citește titlul și pleacă n-are de ce să
 * le aștepte. Observatorul de intersecție face asta fără să asculte derularea.
 */
export function LandingMapPreview({ reports }: { reports: PublicReport[] }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setVisible(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <Link
      href="/harta"
      aria-label={t.home.mapAria}
      className="group border-border focus-visible:ring-ring/50 focus-visible:border-ring block overflow-hidden rounded-2xl border transition-colors focus-visible:ring-3 focus-visible:outline-none"
    >
      {/* Înălțimea e aceeași în ambele stări, deci pagina nu tresare la încărcare. */}
      <div ref={frameRef} className="bg-muted relative h-[clamp(18rem,42vh,26rem)]">
        {visible && (
          <BrasovMap preview zoom={PREVIEW_ZOOM} className="h-full">
            <ReportsLayer reports={reports} onSelect={() => {}} />
          </BrasovMap>
        )}
      </div>
    </Link>
  );
}
