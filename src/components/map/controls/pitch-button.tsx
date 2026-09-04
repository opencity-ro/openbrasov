"use client";

import { t } from "@/lib/messages";

import { MapButton } from "./map-control-surface";

/**
 * Eticheta arată unde ajungi, nu unde ești — convenția hărților mari. Cifrele
 * sunt tabulare ca butonul să nu tresară între „3D" și „2D".
 */
export function PitchButton({
  active,
  disabled,
  onToggle,
}: {
  active: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <MapButton
      label={active ? t.map.exit3d : t.map.enter3d}
      pressed={active}
      active={active}
      disabled={disabled}
      onClick={onToggle}
      className="text-[12px] font-semibold tabular-nums"
    >
      {active ? "2D" : "3D"}
    </MapButton>
  );
}
