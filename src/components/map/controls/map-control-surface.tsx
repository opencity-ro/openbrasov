"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Suprafața pe care stau controalele. Blur-ul nu e decor: harta trece pe sub
 * butoane cu orice contrast, iar stratul translucid le ține citibile peste orice.
 */
export const mapSurfaceClass = cn(
  "border-border/55 bg-card/85 supports-[backdrop-filter]:bg-card/70 rounded-[10px] border",
  "shadow-[0_1px_2px_rgba(16,24,20,0.10),0_6px_18px_-8px_rgba(16,24,20,0.28)]",
  "backdrop-blur-xl backdrop-saturate-150",
  "dark:shadow-[0_1px_2px_rgba(0,0,0,0.45),0_6px_18px_-8px_rgba(0,0,0,0.65)]",
);

type MapButtonProps = React.ComponentProps<"button"> & {
  label: string;
  /** Controlul e pornit — colorează iconița, fără să schimbe forma butonului. */
  active?: boolean;
};

/**
 * Butoanele hărții sunt mai mici decât cele din restul aplicației — 38px, cât
 * cere o hartă ca să nu-ți acopere orașul. Zona de atingere rămâne însă 44px,
 * întinsă cu un pseudo-element invizibil.
 *
 * Primește și împrăștie orice altă proprietate: fără asta, un declanșator de
 * popover nu își poate lipi de el nici evenimentele, nici referința.
 */
export function MapButton({ className, label, active, ...props }: MapButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "relative flex size-[38px] shrink-0 items-center justify-center",
        "text-foreground/80 hover:text-foreground transition-colors duration-150",
        "hover:bg-foreground/[0.06] active:bg-foreground/[0.1]",
        "focus-visible:ring-ring/60 outline-none focus-visible:ring-2",
        "disabled:pointer-events-none disabled:opacity-40",
        // Ținta de atingere rămâne 44px, chiar dacă desenul are 38.
        "after:absolute after:-inset-[3px] after:content-['']",
        active && "text-primary",
        className,
      )}
      {...props}
    />
  );
}

/** Butoane lipite într-o singură placă, despărțite de o linie subțire. */
export function MapControlGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        mapSurfaceClass,
        "flex flex-col overflow-hidden",
        "[&>*+*]:border-border/45 [&>*+*]:border-t",
        className,
      )}
    >
      {children}
    </div>
  );
}
