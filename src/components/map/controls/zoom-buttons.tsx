"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";

import { useMapInstance, useMapView } from "../map-context";
import { MapControlGroup } from "./map-control-surface";

export function ZoomButtons({ className }: { className?: string }) {
  const map = useMapInstance();
  const view = useMapView(map);

  const atMax = view ? view.zoom >= view.maxZoom - 0.01 : true;
  const atMin = view ? view.zoom <= view.minZoom + 0.01 : true;

  return (
    <MapControlGroup className={className}>
      <Button
        type="button"
        variant="ghost"
        size="icon-xl"
        className="rounded-none"
        aria-label={t.map.zoomIn}
        title={t.map.zoomIn}
        disabled={!map || atMax}
        onClick={() => map?.zoomIn()}
      >
        <Plus className="size-[18px]" aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xl"
        className="rounded-none"
        aria-label={t.map.zoomOut}
        title={t.map.zoomOut}
        disabled={!map || atMin}
        onClick={() => map?.zoomOut()}
      >
        <Minus className="size-[18px]" aria-hidden="true" />
      </Button>
    </MapControlGroup>
  );
}
