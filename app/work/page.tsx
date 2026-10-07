import type { Metadata } from "next";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { ProjectsSection } from "@/components/sections/projects/projects-section";
import { WorkHero } from "@/components/sections/projects/work-hero";
import { PROJECTS } from "@/config/projects";

export const metadata: Metadata = {
  title: "Work — Dipendra Shrestha",
  description: "Dashboards, tools and design systems I've designed for startups and scale-ups.",
};

export default function WorkPage() {
  return (
    <SmoothScroll>
      <main id="main">
        <WorkHero title="Work" count={PROJECTS.length} />
        {/* This page is the full list, so no "Selected works" heading or
            "See all works" link. */}
        {/* Held until the title lands; WorkHero releases it. */}
        <div className="work-grid" data-hold-entrance>
          <ProjectsSection intro={false} />
        </div>
      </main>
    </SmoothScroll>
  );
}
