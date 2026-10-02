/** Superscript count next to a nav label, e.g. Work⁽⁸⁾. */
export function NavCount({ count }: { count: number }) {
  return (
    <sup className="relative -top-[0.55em] ml-[1px] align-baseline text-[0.6em] leading-none transition-colors duration-300 group-hover:text-blue group-focus-visible:text-blue">
      ({count})
    </sup>
  );
}
