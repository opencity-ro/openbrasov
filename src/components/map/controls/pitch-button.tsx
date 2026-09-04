"use client";

import { Button } from "@/components/ui/button";
import { t } from "@/lib/messages";
import { cn } from "@/lib/utils";

import { mapSurfaceClass } from "./map-control-surface";

/**
 * Eticheta arată unde ajungi, nu unde ești — la fel ca la hărțile mari. Cifrele
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
  const label = active ? t.map.exit3d : t.map.enter3d;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xl"
      className={cn(
        mapSurfaceClass,
        "text-[13px] font-semibold tabular-nums",
        active && "text-primary",
      )}
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onClick={onToggle}
    >
      {active ? "2D" : "3D"}
    </Button>
  );
}
