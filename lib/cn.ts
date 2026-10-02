import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Our named type-scale utilities (text-ui-*, text-body-*, text-display-*) are custom
// Tailwind v4 @theme tokens tailwind-merge doesn't know about out of the box. Without
// this, it falls back to treating them as arbitrary text-color classes and silently
// drops them whenever a real text-fg-* color class is merged in alongside. Every
// component that pairs a type-scale class with a color class (the documented, required
// pattern) loses its font-size/line-height/letter-spacing at runtime.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "ui-xs",
            "ui-sm",
            "ui-md",
            "ui-lg",
            "body-sm",
            "body-md",
            "body-lg",
            "display-xs",
            "display-sm",
            "display-md",
            "display-lg",
            "display-xl",
            "display-2xl",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
