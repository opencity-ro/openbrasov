/**
 * Cuvântul marcat: un traseu de marker verde pe sub literă, nu un fundal plin.
 *
 * Culoarea mărcii nu are voie să devină fundal de bloc, dar peste un singur cuvânt
 * dintr-un titlu e chiar treaba ei — arată unde se uită ochiul, o dată pe pagină.
 */
export function Marked({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      <span
        aria-hidden="true"
        className="bg-primary/70 absolute inset-x-[-0.1em] bottom-[0.2em] block h-[0.3em] -rotate-[0.5deg]"
      />
      <span className="relative">{children}</span>
    </span>
  );
}
