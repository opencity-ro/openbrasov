"use client";

import type { GeolocateControl } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { t } from "@/lib/messages";

import { useMapInstance } from "../map-context";
import { LocateArrowIcon } from "./icons";
import { MapButton } from "./map-control-surface";

type LocateState = "idle" | "locating" | "active";

/**
 * Butonul e al nostru, logica e a MapLibre. `GeolocateControl` știe deja să
 * deseneze punctul de poziție și cercul de precizie și să urmărească poziția;
 * îi ascundem butonul implicit (vezi `globals.css`) și îl pornim cu `trigger()`.
 */
export function LocateButton() {
  const map = useMapInstance();
  const controlRef = useRef<GeolocateControl | null>(null);
  const [state, setState] = useState<LocateState>("idle");

  useEffect(() => {
    if (!map) return;

    let control: GeolocateControl | undefined;
    let cancelled = false;

    void (async () => {
      const maplibregl = await import("maplibre-gl");
      if (cancelled) return;

      control = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true, timeout: 10_000 },
        trackUserLocation: true,
        showAccuracyCircle: true,
        showUserLocation: true,
      });

      control.on("geolocate", () => setState("active"));
      control.on("trackuserlocationend", () => setState("idle"));
      control.on("error", (event: GeolocationPositionError) => {
        setState("idle");
        toast.error(event.code === 1 ? t.map.locationDenied : t.map.locationUnavailable);
      });

      map.addControl(control);
      controlRef.current = control;
    })();

    return () => {
      cancelled = true;
      if (control && map.hasControl(control)) map.removeControl(control);
      controlRef.current = null;
    };
  }, [map]);

  const isBusy = state === "locating";

  return (
    <MapButton
      label={t.map.locate}
      active={state === "active"}
      busy={isBusy}
      disabled={!map}
      onClick={() => {
        if (!controlRef.current) return;
        if (state !== "active") setState("locating");
        controlRef.current.trigger();
      }}
    >
      <LocateArrowIcon
        filled={state === "active"}
        className={isBusy ? "animate-pulse motion-reduce:animate-none" : undefined}
      />
      <span className="sr-only" role="status">
        {isBusy ? t.map.locating : ""}
      </span>
    </MapButton>
  );
}
