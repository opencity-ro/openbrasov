"use client";

import { t } from "@/lib/messages";

import { useMapInstance, useMapView } from "../map-context";
import { MinusIcon, PlusIcon } from "./icons";
import { MapButton, MapControlGroup } from "./map-control-surface";

export function ZoomButtons({ className }: { className?: string }) {
  const map = useMapInstance();
  const view = useMapView(map);

  const atMax = view ? view.zoom >= view.maxZoom - 0.01 : true;
  const atMin = view ? view.zoom <= view.minZoom + 0.01 : true;

  return (
    <MapControlGroup className={className}>
      <MapButton label={t.map.zoomIn} disabled={!map || atMax} onClick={() => map?.zoomIn()}>
        <PlusIcon />
      </MapButton>
      <MapButton label={t.map.zoomOut} disabled={!map || atMin} onClick={() => map?.zoomOut()}>
        <MinusIcon />
      </MapButton>
    </MapControlGroup>
  );
}
