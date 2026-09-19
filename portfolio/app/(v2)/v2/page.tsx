"use client";

import { gsap, useGSAP, createV2Smoother, MOTION_OK } from "@/lib/v2-gsap";
import { Navbar } from "@/components/v2/navbar";
import { CustomCursor } from "@/components/v2/custom-cursor";
import { SocialSidebar } from "@/components/v2/social-sidebar";
import { Hero } from "@/components/v2/hero";
import { About } from "@/components/v2/about";
import { WhatIDo } from "@/components/v2/what-i-do";
import { Projects } from "@/components/v2/projects";
import { Experience } from "@/components/v2/experience";
import { History } from "@/components/v2/history";
import { Testimonials } from "@/components/v2/testimonials";
import { CTA } from "@/components/v2/cta";
import { Footer } from "@/components/v2/footer";

export default function V2Page() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Shared with the case-study route (lib/v2-gsap.ts) so both v2 pages
    // create and tear down the smoother identically.
    mm.add(MOTION_OK, () => createV2Smoother());
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <CustomCursor />
      <SocialSidebar />
      <header>
        <Navbar />
      </header>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main id="main">
            <Hero />
            <About />
            <WhatIDo />
            <Projects />
            <Experience />
            <History />
            <Testimonials />
            <CTA />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}
