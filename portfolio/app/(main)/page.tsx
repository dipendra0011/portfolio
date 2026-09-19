import { HeroSection } from "@/components/sections/hero";
import { RecentWorkSection } from "@/components/sections/recent-work";
import { AboutHelloSection } from "@/components/sections/about-hello";
import { GalleryBreakSection } from "@/components/sections/gallery-break";
import { ExpertiseSection } from "@/components/sections/expertise";
import { ExperienceFigmaSection } from "@/components/sections/experience-figma";
import { ClientLogosSection } from "@/components/sections/client-logos";

export default function Home() {
  return (
    <>
      <HeroSection />
      <RecentWorkSection />
      <AboutHelloSection />
      <ExpertiseSection />
      <GalleryBreakSection />
      <ExperienceFigmaSection />
      <ClientLogosSection />
    </>
  );
}
