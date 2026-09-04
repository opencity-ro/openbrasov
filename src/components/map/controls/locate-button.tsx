"use client";

import type { GeolocateControl } from "maplibre-gl";
import { LoaderCircle, LocateFixed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";
import { cn } from "@/lib/utils";

import { useMapInstance } from "../map-context";
import { mapSurfaceClass } from "./map-control-surface";

type LocateState = "idle" | "locating" | "active";

/**
 * Butonul e al nostru, logica e a MapLibre. `GeolocateControl` știe deja să
 * deseneze punctul albastru și cercul de precizie și să urmărească poziția;
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
      control.on("outofmaxbounds", () => {
        setState("idle");
        toast.info(t.map.locationOutsideBrasov);
      });
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
    <Button
      type="button"
      variant="ghost"
      size="icon-xl"
      className={cn(mapSurfaceClass, state === "active" && "text-primary")}
      aria-label={t.map.locate}
      title={t.map.locate}
      aria-busy={isBusy}
      disabled={!map}
      onClick={() => {
        if (!controlRef.current) return;
        if (state !== "active") setState("locating");
        controlRef.current.trigger();
      }}
    >
      {isBusy ? (
        <LoaderCircle
          className="size-[18px] animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : (
        <LocateFixed className="size-[18px]" aria-hidden="true" />
      )}
      <span className="sr-only" role="status">
        {isBusy ? t.map.locating : ""}
      </span>
    </Button>
  );
}
