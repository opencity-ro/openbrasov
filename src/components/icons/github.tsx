import { cn } from "@/lib/utils";

/**
 * Marca oficială GitHub (Octocat mark, simple-icons / GitHub logos).
 * lucide-react a eliminat iconițele de brand în v1, iar logourile de brand
 * trebuie oricum folosite în forma lor oficială.
 */
export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("size-4", className)}
    >
      <path d="M12 .297a12 12 0 0 0-3.794 23.386c.6.111.82-.26.82-.577 0-.285-.01-1.04-.016-2.04-3.338.725-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.73.083-.73 1.205.084 1.838 1.237 1.838 1.237 1.07 1.834 2.809 1.304 3.494.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.333-5.467-5.932 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.005-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.625-5.48 5.922.43.371.814 1.103.814 2.222 0 1.604-.015 2.898-.015 3.293 0 .32.217.694.825.576A12 12 0 0 0 12 .297Z" />
    </svg>
  );
}
