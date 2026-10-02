import * as React from "react";
import { cn } from "./cn";

/**
 * Clones an instance-swap icon slot with a consistent size and marks it decorative
 * (aria-hidden). The accessible name for these components always comes from a
 * label or text content, never the icon itself.
 */
export function withIconSize(icon: React.ReactNode, sizeClassName: string) {
  if (!React.isValidElement<{ className?: string }>(icon)) return icon;
  return React.cloneElement(icon, {
    className: cn(sizeClassName, "shrink-0", icon.props.className),
    "aria-hidden": true,
  } as { className: string; "aria-hidden": true });
}
