"use client";

import { getSmoother } from "@/lib/v2-gsap";
import "./scroll-indicator.css";

export function ScrollIndicator() {
  const handleClick = () => {
    const target = document.querySelector("#about");
    if (!target) return;
    const smoother = getSmoother();
    if (smoother) smoother.scrollTo(target, true, "top top");
    else target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button
      className="scroll-indicator"
      onClick={handleClick}
      aria-label="Scroll to About"
      data-cursor-hover
    >
      <svg
        className="scroll-indicator__ring"
        viewBox="0 0 100 100"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <path
            id="scroll-indicator-path"
            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          />
        </defs>
        <text>
          <textPath href="#scroll-indicator-path" startOffset="0%">
            SCROLL &#8226; SCROLL &#8226; SCROLL &#8226;
          </textPath>
        </text>
      </svg>
      <svg
        className="scroll-indicator__arrow"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M12 5v14M12 19l-6-6M12 19l6-6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
