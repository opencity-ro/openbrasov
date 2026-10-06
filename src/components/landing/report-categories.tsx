import Image from "next/image";

import { reportIconUrl } from "@/components/map/report-icons";
import { t } from "@/lib/messages";
import { categoryLabel, type ReportCategory } from "@/lib/reports/categories";

/**
 * Categoriile, grupate pe domenii.
 *
 * Toate treizeci și patru, nu o selecție: lista întreagă e singurul argument care
 * nu se poate scrie din marketing. Cine caută groapa din fața blocului o găsește
 * aici, iar cine se întreabă dacă platforma e serioasă vede cât de departe merge.
 *
 * Grupurile sunt ale noastre, nu ale bazei de date: omul nu caută după coloana în
 * care ținem categoria, ci după locul din oraș unde l-a enervat problema.
 */
const GROUPS: { key: keyof typeof t.home.categoryGroups; items: ReportCategory[] }[] = [
  {
    key: "road",
    items: [
      "pothole",
      "sidewalk",
      "crosswalk_marking",
      "road_marking",
      "traffic_light",
      "signage",
      "speed_bump_request",
      "public_transport",
      "accessibility",
    ],
  },
  {
    key: "parking",
    items: [
      "illegal_parking_road",
      "illegal_parking_sidewalk",
      "bollards",
      "illegal_scooter_parking",
      "abandoned_vehicle",
    ],
  },
  {
    key: "clean",
    items: [
      "illegal_dumping",
      "waste_collection",
      "unsanitary_land",
      "air_quality",
      "noise",
      "green_space",
      "park",
    ],
  },
  {
    key: "order",
    items: [
      "vandalism",
      "illegal_construction",
      "public_space_occupation",
      "illegal_street_vending",
      "commercial_space",
      "heritage",
    ],
  },
  { key: "animals", items: ["stray_animal", "wildlife", "rodents", "insects"] },
  { key: "utilities", items: ["street_lighting", "water_or_heating", "other"] },
];

export function ReportCategories() {
  return (
    <ul className="grid gap-10 sm:grid-cols-2">
      {GROUPS.map((group) => (
        <li key={group.key}>
          <h3 className="text-muted-foreground text-sm font-semibold">
            {t.home.categoryGroups[group.key]}
          </h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {group.items.map((category) => (
              <li
                key={category}
                className="border-border bg-card flex items-center gap-2 rounded-lg border py-1.5 pr-3 pl-2 text-sm"
              >
                {/*
                 * Icoana e aceeași care stă pe pin; eticheta de alături o spune în
                 * cuvinte, deci pentru cititorul de ecran e decorativă.
                 *
                 * Trece prin optimizarea de imagini: fișierul sursă are 128 de puncte
                 * și aproape 19 kilobocteți, iar aici se vede la 20. Treizeci și patru
                 * de fișiere servite la mărimea lor ar fi însemnat peste jumătate de
                 * megaoctet pentru niște pictograme cât o literă.
                 */}
                <Image src={reportIconUrl(category)} alt="" width={20} height={20} />
                {categoryLabel(category)}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
