export function ArrowRight({
  strokeWidth = 1.5,
  className,
}: {
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 12H20M20 12L14 6M20 12L14 18"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
