"use client";

import { useRef } from "react";

import { t } from "@/lib/messages";
import { cn } from "@/lib/utils";

import { useMapInstance, useMapView } from "../map-context";
import { CompassIcon } from "./icons";
import { MapButton, mapSurfaceClass } from "./map-control-surface";

type Drag = { angle: number; bearing: number; moved: boolean };

function angleFrom(element: HTMLElement, clientX: number, clientY: number): number {
  const box = element.getBoundingClientRect();
  const x = clientX - (box.left + box.width / 2);
  const y = clientY - (box.top + box.height / 2);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/**
 * Apare doar când harta e rotită sau înclinată — un buton care nu are ce reseta
 * e zgomot. Se poate și trage de el: harta se rotește cât ții degetul pe busolă,
 * iar o apăsare simplă readuce nordul sus.
 */
export function CompassButton() {
  const map = useMapInstance();
  const view = useMapView(map);
  const dragRef = useRef<Drag | null>(null);

  const isOriented = !view || (Math.abs(view.bearing) < 0.5 && view.pitch < 0.5);

  return (
    <div
      className={cn(
        mapSurfaceClass,
        "transition-all duration-200 ease-out",
        isOriented
          ? "pointer-events-none scale-90 opacity-0 duration-150"
          : "scale-100 opacity-100",
      )}
      aria-hidden={isOriented}
    >
      <MapButton
        label={t.map.resetNorth}
        tabIndex={isOriented ? -1 : undefined}
        className="touch-none"
        onPointerDown={(event) => {
          if (!map) return;
          const element = event.currentTarget;
          element.setPointerCapture(event.pointerId);
          dragRef.current = {
            angle: angleFrom(element, event.clientX, event.clientY),
            bearing: map.getBearing(),
            moved: false,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!map || !drag) return;

          const angle = angleFrom(event.currentTarget, event.clientX, event.clientY);
          let delta = angle - drag.angle;
          // Peste ±180° unghiul trece prin discontinuitate; îl aducem înapoi.
          if (delta > 180) delta -= 360;
          if (delta < -180) delta += 360;

          if (Math.abs(delta) > 1.5) drag.moved = true;
          map.setBearing(drag.bearing + delta);
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current;
          dragRef.current = null;
          event.currentTarget.releasePointerCapture(event.pointerId);

          // Doar orientarea revine la nord; înclinarea rămâne, ca să nu ieși din relief.
          if (map && drag && !drag.moved) map.easeTo({ bearing: 0, duration: 450 });
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <CompassIcon bearing={view?.bearing ?? 0} />
      </MapButton>
    </div>
  );
}
