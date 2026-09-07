"use client";

import { useEffect, useState } from "react";

/** Adresa unei sesizări: se caută, s-a găsit, sau serverul n-a răspuns. */
export type AddressState =
  { status: "loading" } | { status: "ready"; label: string } | { status: "failed" };

const LOADING: AddressState = { status: "loading" };

/**
 * Cere adresa punctului abia când cardul lui se deschide.
 *
 * Nu la încărcarea hărții: acolo ar fi însemnat treizeci de întrebări deodată
 * pentru treizeci de carduri pe care nimeni nu le-a deschis încă, iar serviciul
 * de geocodare primește o singură întrebare pe secundă. Un click, o întrebare —
 * și doar prima dată, fiindcă serverul ține minte răspunsul.
 */
export function useReportAddress(latitude: number, longitude: number): AddressState {
  const point = `${latitude},${longitude}`;

  // Starea își poartă punctul cu ea. Trecerea de la o sesizare la alta se vede
  // atunci la desenare, nu după: dacă am fi șters-o dintr-un efect, cardul ar fi
  // apucat să arate o clipă adresa sesizării dinainte.
  const [found, setFound] = useState<{ point: string; state: AddressState }>({
    point,
    state: LOADING,
  });

  useEffect(() => {
    const abort = new AbortController();
    const url = `/api/adresa?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`;

    fetch(url, { signal: abort.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: { label?: unknown } | null) => {
        const state: AddressState =
          typeof body?.label === "string"
            ? { status: "ready", label: body.label }
            : { status: "failed" };
        setFound({ point, state });
      })
      .catch((error: unknown) => {
        // Închiderea cardului anulează cererea. Nu e o defecțiune, doar o
        // răzgândire, iar răspunsul nu mai interesează pe nimeni.
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFound({ point, state: { status: "failed" } });
      });

    return () => abort.abort();
  }, [latitude, longitude, point]);

  return found.point === point ? found.state : LOADING;
}
