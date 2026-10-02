import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../../../lib/cn";
import { withIconSize } from "../../../lib/with-icon-size";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center whitespace-nowrap",
    "rounded-sm font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-100",
    "focus-visible:outline-none focus-visible:shadow-[var(--shadow-glow-focus)]",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: [
          "bg-bg-brand-solid text-fg-on-brand shadow-sm",
          "hover:bg-bg-brand-solid-hover",
          "active:bg-bg-brand-solid-active",
          "disabled:bg-bg-disabled disabled:text-fg-disabled",
        ].join(" "),
        secondary: [
          "border border-border-default bg-bg-primary text-fg-primary shadow-xs",
          "hover:border-border-strong hover:bg-bg-secondary-hover",
          "active:border-border-strong active:bg-bg-tertiary",
          "focus-visible:border-border-brand",
          "disabled:bg-bg-primary disabled:text-fg-disabled disabled:border-border-default",
        ].join(" "),
        ghost: [
          "bg-transparent text-fg-primary",
          "hover:bg-bg-secondary-hover",
          "active:bg-bg-tertiary",
          "disabled:text-fg-disabled",
        ].join(" "),
        destructive: [
          "bg-bg-error-solid text-fg-on-error shadow-sm",
          "hover:bg-bg-error-solid-hover",
          "active:bg-[var(--error-800)]",
          "disabled:bg-bg-disabled disabled:text-fg-disabled",
        ].join(" "),
        link: [
          "bg-transparent text-fg-brand underline-offset-4",
          "hover:text-fg-brand hover:underline",
          "active:text-[var(--brand-800)]",
          "disabled:text-fg-disabled disabled:no-underline",
        ].join(" "),
      },
      size: {
        sm: "h-8 gap-1 px-3 text-ui-md",
        md: "h-10 gap-2 px-4 text-ui-lg",
        lg: "h-12 gap-2 px-5 text-ui-lg",
        xl: "h-14 gap-3 px-6 text-ui-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ComponentPropsWithRef<"button">,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  /** Instance-swap icon slot rendered before the label. Sized to match the button's `size`. */
  leadingIcon?: React.ReactNode;
  /** Instance-swap icon slot rendered after the label. Sized to match the button's `size`. */
  trailingIcon?: React.ReactNode;
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4 animate-spin", className)}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * role=button · Enter/Space activates · focus ring visible on Tab · disabled prevents interaction · loading state announces via aria-busy
 */
export function Button({
  ref,
  className,
  variant,
  size = "md",
  loading = false,
  disabled,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  // Icon sizes per Figma (canvas 2120:2, node 2121:38/2121:74/2121:110):
  // sm -> 16px, md/lg -> 20px, xl -> 24px. Not a flat sm/md=16, lg/xl=20 split.
  const iconSizeClassName =
    size === "xl" ? "size-6" : size === "sm" ? "size-4" : "size-5";

  return (
    <button
      ref={ref}
      type="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {leadingIcon ? withIconSize(leadingIcon, iconSizeClassName) : null}
      {children}
      {loading ? (
        <Spinner className={iconSizeClassName} />
      ) : trailingIcon ? (
        withIconSize(trailingIcon, iconSizeClassName)
      ) : null}
    </button>
  );
}

Button.displayName = "Button";

export { buttonVariants };
