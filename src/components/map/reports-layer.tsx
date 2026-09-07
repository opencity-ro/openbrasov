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
 * Intrarea pinurilor: se sting și se aprind, atât.
 *
 * Prima variantă le și umfla puțin peste măsura lor, printr-o expresie schimbată
 * la fiecare cadru. Mărimea unei icoane e proprietate de așezare, deci fiecare
 * cadru cerea hărții să reconstruiască tot stratul de simboluri — de șaizeci de
 * ori pe secundă — iar un click prins la mijlocul acelei reconstrucții căuta
 * trăsături într-o dală care tocmai fusese schimbată sub el și arunca o eroare
 * din adâncul hărții.
 *
 * Transparența e proprietate de desenare: harta o trece singură de la o valoare
 * la alta, într-o singură comandă, fără să atingă așezarea. Am pierdut umflarea
 * și decalajul dintre pini; am câștigat o hartă care nu se mai rupe.
 */
const POP_MS = 380;

type Properties = {
  id: string;
  category: PublicReport["category"];
  status: PublicReport["status"];
  icon: string;
};

function toFeatureCollection(reports: PublicReport[]): FeatureCollection<Point, Properties> {
  return {
    type: "FeatureCollection",
    features: reports.map((report) => ({
      type: "Feature",
      id: report.id,
      geometry: { type: "Point", coordinates: [report.longitude, report.latitude] },
      properties: {
        id: report.id,
        category: report.category,
        status: report.status,
        icon: pinImageId(report.category, report.status),
      },
    })) satisfies Feature<Point, Properties>[],
  };
}

type ReportsLayerProps = {
  /**
   * Sesizările care trec de filtre. Restul nici nu ajung la hartă: gruparea se
   * face în sursă, înainte de orice filtru de strat, deci un grup ar fi numărat
   * și sesizările ascunse și ar fi arătat un cerc cu șapte peste un cartier în
   * care filtrul curent nu lasă niciuna.
   */
  reports: PublicReport[];
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
export function ReportsLayer({ reports, onSelect }: ReportsLayerProps) {
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
    // Instalările se pun la rând, nu se aruncă. Aducerea icoanelor cere o
    // așteptare, iar o simplă santinelă „sunt ocupat" ar fi înghițit tocmai
    // evenimentul care anunța un stil nou, lăsând harta fără sesizări.
    let queue: Promise<void> = Promise.resolve();
    let dropped = false;

    const install = () => {
      queue = queue
        .then(() => (dropped ? undefined : addEverything()))
        .catch((error: unknown) => {
          console.error("Nu am putut așeza stratul de sesizări:", error);
        });
    };

    const addEverything = async () => {
      if (!map.getSource(REPORTS_SOURCE)) {
        map.addSource(REPORTS_SOURCE, {
          type: "geojson",
          data: toFeatureCollection(reports),
          cluster: true,
          clusterMaxZoom: CLUSTER_MAX_ZOOM,
          clusterRadius: CLUSTER_RADIUS,
        });
      }

      // Icoanele intră înaintea straturilor care le cer. Invers, harta s-ar fi
      // plâns în consolă pentru fiecare imagine lipsă, la fiecare încărcare.
      const images = await renderPinImages(reports, Math.ceil(window.devicePixelRatio || 1), (id) =>
        map.hasImage(id),
      );
      if (dropped) return;
      for (const image of images) {
        if (!map.hasImage(image.id)) {
          map.addImage(image.id, image.data, { pixelRatio: image.pixelRatio });
        }
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
          // Stratul se așază stins; efectul de mai jos îl aprinde o singură dată.
          paint: { "icon-opacity": 0 },
        });
      }
    };

    install();
    map.on("styledata", install);
    return () => {
      dropped = true;
      map.off("styledata", install);
    };
  }, [map, reports]);

  // Datele se schimbă doar când se schimbă lista, nu la fiecare filtrare.
  useEffect(() => {
    const source = map?.getSource(REPORTS_SOURCE) as GeoJSONSource | undefined;
    source?.setData(toFeatureCollection(reports));
  }, [map, reports]);

  /**
   * Intrarea pinurilor: transparența pleacă de la zero și urcă o singură dată.
   *
   * O comandă, nu una pe cadru: harta face trecerea singură, iar noi nu-i mai
   * schimbăm nimic sub mână cât timp desenează.
   */
  useEffect(() => {
    if (!map) return;

    let frame = 0;

    const light = () => {
      if (!map.getLayer(REPORTS_PIN_LAYER)) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      map.setPaintProperty(REPORTS_PIN_LAYER, "icon-opacity-transition", {
        duration: reduced ? 0 : POP_MS,
      });
      map.setPaintProperty(REPORTS_PIN_LAYER, "icon-opacity", 1);
    };

    // Un cadru de răgaz: stratul se așază cu transparența pe zero, iar trecerea
    // pornește de acolo. Pornită în același cadru, harta n-ar avea de unde pleca.
    frame = requestAnimationFrame(light);
    map.on("styledata", light);

    return () => {
      cancelAnimationFrame(frame);
      map.off("styledata", light);
    };
  }, [map, reports]);

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
