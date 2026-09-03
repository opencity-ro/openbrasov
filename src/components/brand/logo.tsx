import { cn } from "@/lib/utils";

type LogoMarkProps = {
  size?: number;
  className?: string;
};

/** Pin de hartă cu siluetă de munte — Brașovul stă sub Tâmpa. */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      role="img"
      aria-label="Open Brașov"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      <path
        d="M16 2C9.925 2 5 6.925 5 13c0 7.5 11 17 11 17s11-9.5 11-17c0-6.075-4.925-11-11-11Z"
        className="fill-primary"
      />
      <path d="M9 17l4-6 3 4 2-3 5 5H9Z" fill="var(--background)" />
      <circle cx="21" cy="9" r="2" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={28} />
      <span className="font-heading text-xl font-bold tracking-tight">Open Brașov</span>
    </span>
  );
}
