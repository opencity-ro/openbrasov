"use client";

import { useRef } from "react";

import { t } from "@/lib/messages";

import { useMapInstance, useMapView } from "../map-context";
import { CompassIcon } from "./icons";
import { MapButton, mapSurfaceClass } from "./map-control-surface";

/**
 * Cât de mult se rotește harta pentru un pixel de deget. Sub jumătate de grad,
 * gestul se simte condus, nu smucit.
 */
const DEGREES_PER_PIXEL = 0.38;

type Drag = { x: number; bearing: number; moved: boolean; frame: number | null };

/**
 * Busola stă mereu pe hartă, ca reperul să fie acolo și când nordul e sus. O
 * tragi lateral și harta se rotește după deget; o apeși scurt și revine la nord.
 *
 * Rotim după deplasarea orizontală, nu după unghiul față de centrul butonului:
 * unghiul o ia razna când degetul trece pe lângă centru și sare cu 360° la
 * jumătatea cercului.
 */
export function CompassButton() {
  const map = useMapInstance();
  const view = useMapView(map);
  const dragRef = useRef<Drag | null>(null);

  const stopDrag = () => {
    const drag = dragRef.current;
    if (drag?.frame !== null && drag?.frame !== undefined) cancelAnimationFrame(drag.frame);
    dragRef.current = null;
  };

  return (
    <div className={mapSurfaceClass}>
      <MapButton
        label={t.map.resetNorth}
        className="touch-none"
        onPointerDown={(event) => {
          if (!map) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            x: event.clientX,
            bearing: map.getBearing(),
            moved: false,
            frame: null,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!map || !drag) return;

          const delta = (event.clientX - drag.x) * DEGREES_PER_PIXEL;
          if (Math.abs(delta) > 1) drag.moved = true;

          // O singură scriere pe cadru: altfel se calculează camera de zeci de
          // ori între două redesenări și rotirea se simte ca un tremur.
          if (drag.frame !== null) return;
          drag.frame = requestAnimationFrame(() => {
            drag.frame = null;
            map.setBearing(drag.bearing + delta);
          });
        }}
        onPointerUp={(event) => {
          const drag = dragRef.current;
          stopDrag();
          event.currentTarget.releasePointerCapture(event.pointerId);

          // Doar orientarea revine la nord; înclinarea rămâne, ca să nu ieși din relief.
          if (map && drag && !drag.moved) map.easeTo({ bearing: 0, duration: 500 });
        }}
        onPointerCancel={stopDrag}
      >
        <CompassIcon bearing={view?.bearing ?? 0} />
      </MapButton>
    </div>
  );
}
