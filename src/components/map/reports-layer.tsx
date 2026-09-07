"use client";

import type { Feature, FeatureCollection, Point } from "geojson";
import type { GeoJSONSource, MapGeoJSONFeature } from "maplibre-gl";
import { useEffect, useRef } from "react";

import type { PublicReport } from "@/lib/reports/queries";

import { useMapInstance } from "./map-context";
import { pinImageId, renderPinImages } from "./report-pins";

export const REPORTS_SOURCE = "reports";
export const REPORTS_PIN_LAYER = "reports-pins";
const CLUSTER_LAYER = "reports-clusters";
const CLUSTER_COUNT_LAYER = "reports-cluster-count";

/** Peste pragul ăsta sesizările se despart; sub el se adună în grupuri. */
const CLUSTER_MAX_ZOOM = 15;
const CLUSTER_RADIUS = 46;

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
 * pentru că lângă ea e o farmacie — dar rămân în calcul pentru etichetele hărții,
 * ca acelea să se dea la o parte din fața lor.
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

    const install = () => {
      if (!map.getSource(REPORTS_SOURCE)) {
        map.addSource(REPORTS_SOURCE, {
          type: "geojson",
          data: toFeatureCollection(reports),
          cluster: true,
          clusterMaxZoom: CLUSTER_MAX_ZOOM,
          clusterRadius: CLUSTER_RADIUS,
        });
      }

      for (const image of renderPinImages(reports, Math.ceil(window.devicePixelRatio || 1))) {
        if (map.hasImage(image.id)) map.removeImage(image.id);
        map.addImage(image.id, image.data, { pixelRatio: image.pixelRatio });
      }

      if (!map.getLayer(CLUSTER_LAYER)) {
        map.addLayer({
          id: CLUSTER_LAYER,
          type: "circle",
          source: REPORTS_SOURCE,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#1b5e3b",
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
            // Grupurile mari se văd mai mari, dar nu la nesfârșit.
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["get", "point_count"],
              2,
              15,
              10,
              19,
              50,
              24,
              200,
              30,
            ],
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
            "text-size": 13,
            "text-allow-overlap": true,
          },
          paint: { "text-color": "#ffffff" },
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
            // Un raport nu dispare niciodată din cauza aglomerației…
            "icon-allow-overlap": true,
            // …dar rămâne un obstacol, ca etichetele hărții să-i facă loc.
            "icon-ignore-placement": false,
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
    const showHand = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const hideHand = () => {
      map.getCanvas().style.cursor = "";
    };
    const clickable = [REPORTS_PIN_LAYER, CLUSTER_LAYER];

    map.on("click", REPORTS_PIN_LAYER, openReport);
    map.on("click", CLUSTER_LAYER, zoomIntoCluster);
    for (const layer of clickable) {
      map.on("mouseenter", layer, showHand);
      map.on("mouseleave", layer, hideHand);
    }

    return () => {
      map.off("click", REPORTS_PIN_LAYER, openReport);
      map.off("click", CLUSTER_LAYER, zoomIntoCluster);
      for (const layer of clickable) {
        map.off("mouseenter", layer, showHand);
        map.off("mouseleave", layer, hideHand);
      }
    };
  }, [map]);

  return null;
}
