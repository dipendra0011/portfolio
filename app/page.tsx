import { BirdCompanion } from "@/components/motion/bird-companion";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { HeroSection } from "@/components/sections/hero-section";
import { ProjectsSection } from "@/components/sections/projects/projects-section";
import { WhatIDoSection } from "@/components/sections/what-i-do/what-i-do-section";

export default function HomePage() {
  return (
    <>
      {/* Fixed, so it lives outside the smoothed (transformed) content. */}
      <BirdCompanion />
      <SmoothScroll>
      <main id="main">
        <HeroSection />
        <WhatIDoSection />
        <ProjectsSection />
      </main>
      </SmoothScroll>
    </>
  );
}
