"use client";

import { useEffect, useRef } from "react";

import type { PublicReport } from "@/lib/reports/queries";

import { useMapInstance } from "./map-context";

/**
 * Apropierea la care ajungi când deschizi o sesizare. La atâta se citesc numele
 * străzilor din jur, adică exact ce-ți trebuie ca să recunoști locul.
 */
const FOCUS_ZOOM = 15;

/** Durata drumului dus și a celui întors. Sub o jumătate de secundă. */
const FLIGHT_MS = 500;

/** Cardul de detalii, plus aer în jurul lui, ca pinul să nu stea sub el. */
const CARD_WIDTH = 400;
const DESKTOP_FROM = 640;

const NO_PADDING = { top: 0, right: 0, bottom: 0, left: 0 };

type View = { center: [number, number]; zoom: number; bearing: number; pitch: number };

/**
 * Cât loc trebuie ținut liber ca sesizarea deschisă să rămână vizibilă lângă
 * cardul ei: pe ecran lat cardul stă în stânga, pe telefon urcă de jos.
 *
 * Marginile nu depășesc jumătate din hartă. Peste atât, camera nu mai are unde
 * să încadreze punctul și harta sare în loc să se miște.
 */
function cardPadding(width: number, height: number) {
  if (width >= DESKTOP_FROM) {
    return { ...NO_PADDING, left: Math.min(CARD_WIDTH, width / 2) };
  }
  return { ...NO_PADDING, bottom: Math.min(height * 0.45, height / 2) };
}

/**
 * Duce harta la sesizarea deschisă și o aduce înapoi când o închizi.
 *
 * Priveliștea de dinainte se ține minte o singură dată, la prima deschidere:
 * dacă treci de la o sesizare la alta, închiderea te lasă tot de unde ai plecat,
 * nu la pinul dinainte. O întoarcere la un punct fix — centrul orașului, să zicem
 * — ar arunca peste bord cartierul în care tocmai te uitai.
 *
 * Apropierea nu scade niciodată: dacă erai deja mai aproape decât atât, deschisul
 * unei sesizări n-are de ce să te tragă înapoi.
 */
export function ReportFocus({ selected }: { selected: PublicReport | null }) {
  const map = useMapInstance();
  const before = useRef<View | null>(null);

  useEffect(() => {
    if (!map) return;

    if (selected) {
      if (!before.current) {
        const center = map.getCenter();
        before.current = {
          center: [center.lng, center.lat],
          zoom: map.getZoom(),
          bearing: map.getBearing(),
          pitch: map.getPitch(),
        };
      }

      const canvas = map.getCanvas();
      map.flyTo({
        center: [selected.longitude, selected.latitude],
        zoom: Math.max(map.getZoom(), FOCUS_ZOOM),
        duration: FLIGHT_MS,
        padding: cardPadding(canvas.clientWidth, canvas.clientHeight),
      });
      return;
    }

    const previous = before.current;
    if (!previous) return;
    before.current = null;

    // Marginile rămân pe cameră până le schimbi, deci se sting odată cu cardul;
    // altfel harta ar continua să evite un card care nu mai există.
    map.flyTo({ ...previous, duration: FLIGHT_MS, padding: NO_PADDING });
  }, [map, selected]);

  return null;
}
