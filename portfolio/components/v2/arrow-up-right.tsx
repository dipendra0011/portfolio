/*
 * strokeWidth is in viewBox units, so the rendered weight is strokeWidth * (size / 24).
 * Larger icons take a lighter value on purpose — optical compensation, the same reason
 * display type carries less relative stroke than body type.
 */
export function ArrowUpRight({
  size = 24,
  strokeWidth = 1.5,
  className,
}: {
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
