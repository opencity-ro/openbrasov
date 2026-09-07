"use client";

import type { Feature, FeatureCollection, Point } from "geojson";
import type { ExpressionSpecification, GeoJSONSource, MapGeoJSONFeature } from "maplibre-gl";
import { useEffect, useRef } from "react";

import type { PublicReport } from "@/lib/reports/queries";

import { useMapInstance } from "./map-context";
import { pinImageId, renderPinImages } from "./report-pins";

export const REPORTS_SOURCE = "reports";
export const REPORTS_PIN_LAYER = "reports-pins";
const CLUSTER_LAYER = "reports-clusters";
const CLUSTER_COUNT_LAYER = "reports-cluster-count";
const CLUSTER_HALO_LAYER = "reports-cluster-halo";

/**
 * Grupurile sunt chihlimbar, nu verde. Verdele mărcii se pierdea în parcurile
 * hărții, iar pe hartă un grup trebuie să fie primul lucru care sare în ochi.
 *
 * Umplerea e deschisă și cifra e închisă, nu invers: alb pe portocaliu ar fi
 * ținut sub pragul de contrast la mărimea asta, iar aproape-negru pe chihlimbar
 * trece lejer, și pe temă deschisă, și pe temă închisă.
 */
const CLUSTER_COLOR = "#fbbf24";
const CLUSTER_TEXT = "#1c1917";

/** Discul crește cu numărul de sesizări, dar se oprește: altfel acoperă cartierul. */
function clusterRadius(): ExpressionSpecification {
  return ["interpolate", ["linear"], ["get", "point_count"], 2, 17, 10, 21, 50, 26, 200, 32];
}

/** Peste pragul ăsta sesizările se despart; sub el se adună în grupuri. */
const CLUSTER_MAX_ZOOM = 15;
const CLUSTER_RADIUS = 46;

/**
 * Săltul de intrare: pinul crește din nimic, trece puțin peste mărimea lui și
 * revine. Fără depășire ar părea că se umflă și se oprește brusc; cu ea, pare
 * pus pe hartă de o mână.
 */
const POP_MS = 380;
const POP_PEAK_MS = 266;
const POP_OVERSHOOT = 1.15;
const POP_FADE_MS = 133;

/** Decalajul dintre două pinuri vecine, ca să nu apară toate deodată. */
const POP_STAGGER_MS = 25;

/** Toată intrarea se încheie într-atât, oricâte sesizări ar fi de arătat. */
const POP_STAGGER_CAP_MS = 500;

/**
 * Peste atâtea sesizări pe ecran, intrarea se sare cu totul. Mărimea unei icoane
 * e proprietate de așezare, deci fiecare cadru al animației cere hărții să
 * recalculeze locul tuturor simbolurilor — plăcut la treizeci, sacadat la mii.
 */
const POP_MAX_PINS = 400;

type Properties = {
  id: string;
  category: PublicReport["category"];
  status: PublicReport["status"];
  icon: string;
  /** Momentul, față de începutul animației, la care intră pinul ăsta. */
  appearAt: number;
};

/** Cât a trecut de la intrarea fiecărui pin, ca număr pe care harta îl poate citi. */
const sinceAppeared = (elapsed: number): ExpressionSpecification => [
  "-",
  elapsed,
  ["case", ["has", "appearAt"], ["to-number", ["get", "appearAt"]], 0],
];

const popSize = (elapsed: number): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  sinceAppeared(elapsed),
  0,
  0,
  POP_PEAK_MS,
  POP_OVERSHOOT,
  POP_MS,
  1,
];

const popOpacity = (elapsed: number): ExpressionSpecification => [
  "interpolate",
  ["linear"],
  sinceAppeared(elapsed),
  0,
  0,
  POP_FADE_MS,
  1,
];

function toFeatureCollection(reports: PublicReport[]): FeatureCollection<Point, Properties> {
  return {
    type: "FeatureCollection",
    features: reports.map((report, index) => ({
      type: "Feature",
      id: report.id,
      geometry: { type: "Point", coordinates: [report.longitude, report.latitude] },
      properties: {
        id: report.id,
        category: report.category,
        status: report.status,
        icon: pinImageId(report.category, report.status),
        appearAt: Math.min(index * POP_STAGGER_MS, POP_STAGGER_CAP_MS),
      },
    })) satisfies Feature<Point, Properties>[],
  };
}

type ReportsLayerProps = {
  reports: PublicReport[];
  /** Sesizările care trec de filtre; restul dispar de pe hartă, nu se estompează. */
  visibleIds: string[];
  onSelect: (id: string) => void;
};

/**
 * Sesizările pe hartă.
 *
 * Un strat de simboluri, nu câte un element de pagină pe fiecare sesizare: harta
 * poate ajunge la mii de pini, iar desenul lor stă pe placa video. Pinurile au
 * voie să se suprapună peste orice altceva — o groapă raportată nu dispare
 * pentru că lângă ea e o farmacie — și nici nu iau locul nimănui: numele
 * localităților rămân pe hartă chiar și sub un grup de sesizări.
 */
export function ReportsLayer({ reports, visibleIds, onSelect }: ReportsLayerProps) {
  const map = useMapInstance();
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Straturile trăiesc pe stilul curent, iar schimbarea temei îl reconstruiește;
  // le reașezăm la fiecare stil nou.
  useEffect(() => {
    if (!map) return;

    // Adăugarea unei surse, a unui strat sau a unei imagini schimbă stilul, iar
    // schimbarea stilului anunță `styledata` — evenimentul care ne-a chemat aici.
    // Fără garda asta, prima instalare se cheamă pe sine până se umple stiva.
    let installing = false;

    const install = () => {
      if (installing) return;
      installing = true;
      try {
        addEverything();
      } finally {
        installing = false;
      }
    };

    const addEverything = () => {
      if (!map.getSource(REPORTS_SOURCE)) {
        map.addSource(REPORTS_SOURCE, {
          type: "geojson",
          data: toFeatureCollection(reports),
          cluster: true,
          clusterMaxZoom: CLUSTER_MAX_ZOOM,
          clusterRadius: CLUSTER_RADIUS,
        });
      }

      const images = renderPinImages(reports, Math.ceil(window.devicePixelRatio || 1), (id) =>
        map.hasImage(id),
      );
      for (const image of images) {
        map.addImage(image.id, image.data, { pixelRatio: image.pixelRatio });
      }

      // Aureola: același chihlimbar, aproape transparent, care dă grupului volum
      // și îl desparte de hartă fără să adauge încă un contur.
      if (!map.getLayer(CLUSTER_HALO_LAYER)) {
        map.addLayer({
          id: CLUSTER_HALO_LAYER,
          type: "circle",
          source: REPORTS_SOURCE,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": CLUSTER_COLOR,
            "circle-opacity": 0.22,
            "circle-radius": ["+", clusterRadius(), 7],
          },
        });
      }

      if (!map.getLayer(CLUSTER_LAYER)) {
        map.addLayer({
          id: CLUSTER_LAYER,
          type: "circle",
          source: REPORTS_SOURCE,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": CLUSTER_COLOR,
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2.5,
            "circle-radius": clusterRadius(),
          },
        });
      }

      if (!map.getLayer(CLUSTER_COUNT_LAYER)) {
        map.addLayer({
          id: CLUSTER_COUNT_LAYER,
          type: "symbol",
          source: REPORTS_SOURCE,
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Inter Bold"],
            // Cifra crește odată cu discul, ca să umple grupul la fel la orice mărime.
            "text-size": ["interpolate", ["linear"], ["get", "point_count"], 2, 14, 50, 17],
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          },
          paint: { "text-color": CLUSTER_TEXT },
        });
      }

      if (!map.getLayer(REPORTS_PIN_LAYER)) {
        map.addLayer({
          id: REPORTS_PIN_LAYER,
          type: "symbol",
          source: REPORTS_SOURCE,
          filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": ["get", "icon"],
            "icon-size": 1,
            // Vârful picăturii stă pe coordonata sesizării, nu centrul ei.
            "icon-anchor": "bottom",
            // O sesizare nu dispare niciodată din cauza aglomerației…
            "icon-allow-overlap": true,
            // …și nici nu scoate pe nimeni de pe hartă.
            //
            // Harta așază etichetele începând cu stratul de deasupra, iar
            // sesizările stau chiar acolo. Cât timp erau obstacol, ele prindeau
            // locul primele și numele orașului — scris fix în mijloc, unde se
            // adună și sesizările — nu mai avea unde să încapă. Un oraș fără
            // nume pe hartă e un preț prea mare pentru câțiva pixeli de
            // suprapunere.
            "icon-ignore-placement": true,
            "icon-padding": 2,
          },
        });
      }
    };

    install();
    map.on("styledata", install);
    return () => {
      map.off("styledata", install);
    };
  }, [map, reports]);

  // Datele se schimbă doar când se schimbă lista, nu la fiecare filtrare.
  useEffect(() => {
    const source = map?.getSource(REPORTS_SOURCE) as GeoJSONSource | undefined;
    source?.setData(toFeatureCollection(reports));
  }, [map, reports]);

  // Filtrarea se face pe hartă, fără să atingem sursa: sursa rămâne întreagă, iar
  // grupurile se recalculează singure pe ce a mai rămas vizibil.
  useEffect(() => {
    if (!map?.getLayer(REPORTS_PIN_LAYER)) return;
    map.setFilter(REPORTS_PIN_LAYER, [
      "all",
      ["!", ["has", "point_count"]],
      ["in", ["get", "id"], ["literal", visibleIds]],
    ]);
  }, [map, visibleIds]);

  /**
   * Intrarea pinurilor pe hartă.
   *
   * Ceasul stă la noi, nu în hartă: expresia primește la fiecare cadru câte
   * milisecunde au trecut, iar fiecare pin își scade din ele propria întârziere.
   * Așa avem un singur lucru de schimbat pe cadru, indiferent câte sesizări sunt,
   * iar decalajul dintre pini iese din date, nu din câte un cronometru pe fiecare.
   */
  useEffect(() => {
    if (!map) return;

    let frame = 0;
    let played = false;

    const settle = () => {
      if (!map.getLayer(REPORTS_PIN_LAYER)) return;
      map.setLayoutProperty(REPORTS_PIN_LAYER, "icon-size", 1);
      map.setPaintProperty(REPORTS_PIN_LAYER, "icon-opacity", 1);
    };

    const skip =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      visibleIds.length === 0 ||
      visibleIds.length > POP_MAX_PINS;

    const play = () => {
      if (played || !map.getLayer(REPORTS_PIN_LAYER)) return;
      played = true;

      if (skip) {
        settle();
        return;
      }

      const started = performance.now();
      const step = () => {
        if (!map.getLayer(REPORTS_PIN_LAYER)) return;
        const elapsed = performance.now() - started;
        if (elapsed >= POP_MS + POP_STAGGER_CAP_MS) {
          settle();
          return;
        }
        map.setLayoutProperty(REPORTS_PIN_LAYER, "icon-size", popSize(elapsed));
        map.setPaintProperty(REPORTS_PIN_LAYER, "icon-opacity", popOpacity(elapsed));
        frame = requestAnimationFrame(step);
      };

      // Primul cadru se pune pe loc: altfel pinurile ar apărea o clipă întregi,
      // înainte ca animația să apuce să le facă mici.
      map.setLayoutProperty(REPORTS_PIN_LAYER, "icon-size", popSize(0));
      map.setPaintProperty(REPORTS_PIN_LAYER, "icon-opacity", popOpacity(0));
      frame = requestAnimationFrame(step);
    };

    // Stratul poate să nu fie încă așezat când ajungem aici, iar schimbarea temei
    // reconstruiește stilul din zero.
    play();
    map.on("styledata", play);

    return () => {
      cancelAnimationFrame(frame);
      map.off("styledata", play);
      settle();
    };
  }, [map, visibleIds]);

  useEffect(() => {
    if (!map) return;

    const openReport = (event: { features?: MapGeoJSONFeature[] }) => {
      const id = event.features?.[0]?.properties?.id;
      if (typeof id === "string") onSelectRef.current(id);
    };

    const zoomIntoCluster = async (event: { features?: MapGeoJSONFeature[] }) => {
      const feature = event.features?.[0];
      const clusterId = feature?.properties?.cluster_id;
      if (clusterId === undefined) return;

      const source = map.getSource(REPORTS_SOURCE) as GeoJSONSource;
      const zoom = await source.getClusterExpansionZoom(clusterId as number);
      map.easeTo({
        center: (feature!.geometry as Point).coordinates as [number, number],
        zoom,
        duration: 500,
      });
    };

    // Aceleași referințe la adăugare și la scoatere: `off` compară funcția, iar
    // una creată pe loc ar lăsa ascultătorul în urmă la fiecare remontare.
    map.on("click", REPORTS_PIN_LAYER, openReport);
    map.on("click", CLUSTER_LAYER, zoomIntoCluster);

    return () => {
      map.off("click", REPORTS_PIN_LAYER, openReport);
      map.off("click", CLUSTER_LAYER, zoomIntoCluster);
    };
  }, [map]);

  return null;
}
