"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { figmaAssets } from "@/lib/figma-assets";

export function GalleryBreakSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={sectionRef}
      aria-label="Visual showcase"
      className="w-full overflow-hidden bg-background"
    >
      <div className="relative min-h-[320px] w-full md:min-h-[500px] lg:min-h-[min(90vh,900px)]">
        <motion.div style={{ y }} className="absolute inset-0 -top-[12%] -bottom-[12%]">
          <Image
            src={figmaAssets.gallery}
            alt="Outdoor posters and brand visuals"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>
      </div>
    </section>
  );
}
