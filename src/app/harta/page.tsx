import type { Metadata } from "next";
import { Suspense } from "react";

import { ReportsMap } from "@/components/map/reports-map";
import { SiteHeader } from "@/components/site/header";
import { t } from "@/lib/messages";
import { listPublicReports } from "@/lib/reports/queries";

export const metadata: Metadata = {
  title: t.map.title,
  description: t.map.emptyBody,
};

export default async function MapPage() {
  const reports = await listPublicReports();

  return (
    <>
      <SiteHeader />
      <main className="relative flex-1">
        <h1 className="sr-only">{t.map.title}</h1>
        {/* Filtrele se citesc din adresă, iar asta cere o graniță de așteptare. */}
        <Suspense>
          <ReportsMap reports={reports} />
        </Suspense>
      </main>
    </>
  );
}
