import { cn } from "@/lib/utils";

/**
 * Suprafața pe care stau controalele. Blur-ul nu e decor: hărțile trec pe sub
 * butoane cu orice contrast, iar stratul translucid le ține citibile peste orice.
 */
export const mapSurfaceClass = cn(
  "border-border/60 bg-card/85 supports-[backdrop-filter]:bg-card/70 rounded-xl border",
  "shadow-[0_1px_2px_rgba(16,24,20,0.08),0_8px_24px_-8px_rgba(16,24,20,0.22)]",
  "backdrop-blur-xl backdrop-saturate-150",
  "dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-8px_rgba(0,0,0,0.6)]",
);

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
        // Linia dintre butoanele lipite; un grup e o singură suprafață, nu două plăci.
        "[&>*+*]:border-border/50 [&>*+*]:border-t",
        className,
      )}
    >
      {children}
    </div>
  );
}
