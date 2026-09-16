"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { figmaAssets } from "@/lib/figma-assets";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

function subscribeFinePointer(onStoreChange: () => void) {
  const mql = window.matchMedia(FINE_POINTER);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function useFinePointerHover() {
  return useSyncExternalStore(
    subscribeFinePointer,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false,
  );
}

const projects = [
  {
    image: figmaAssets.projectA,
    title: "NEPTUNES",
    tag: "Web Design",
    href: "/work/neptunes/",
  },
  {
    image: figmaAssets.projectB,
    title: "SERVICE BOOKING",
    tag: "Web Design",
  },
  {
    image: figmaAssets.projectC,
    title: "SERVICE BOOKING",
    tag: "Web Design",
  },
  {
    image: figmaAssets.projectA,
    title: "SERVICE BOOKING",
    tag: "Web Design",
  },
] as const satisfies readonly {
  image: string;
  title: string;
  tag: string;
  href?: string;
}[];

type Project = (typeof projects)[number];

function PreviewCard({ image, title }: { image: string; title: string }) {
  return (
    <CardContainer containerClassName="w-full py-0" className="w-full">
      <CardBody className="h-auto w-full">
        <CardItem translateZ={50} className="w-full">
          <div className="relative aspect-[1.43/1] w-full overflow-hidden bg-surface">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
              sizes="360px"
            />
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}

function ProjectRow({
  project,
  index,
  canHoverPreview,
  onHover,
  onLeave,
}: {
  project: Project;
  index: number;
  canHoverPreview: boolean;
  onHover: (project: Project, event: React.MouseEvent) => void;
  onLeave: () => void;
}) {
  const inner = (
    <>
      <p className="font-[family-name:var(--font-inter)] text-[13px] uppercase tracking-[0.14em] text-foreground/50">
        {project.tag}
      </p>
      <span className="mt-2 block font-[family-name:var(--font-display)] text-[clamp(2rem,6vw,4.5rem)] font-medium uppercase leading-[0.9] tracking-[-0.05em] text-foreground transition-colors duration-300 group-hover:text-accent-lime">
        {project.title}
      </span>
      {!canHoverPreview ? (
        <div className="relative mt-5 aspect-[1.43/1] w-full max-w-md overflow-hidden bg-surface">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 448px"
          />
        </div>
      ) : null}
    </>
  );

  const className =
    "group block border-b border-foreground/15 py-8 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-foreground/40 md:py-10";

  if (project.href) {
    return (
      <motion.li
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, delay: index * 0.05 }}
      >
        <Link
          href={project.href}
          className={className}
          onMouseEnter={(event) => onHover(project, event)}
          onMouseMove={(event) => onHover(project, event)}
          onMouseLeave={onLeave}
        >
          {inner}
        </Link>
      </motion.li>
    );
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
    >
      <div
        className={className}
        onMouseEnter={(event) => onHover(project, event)}
        onMouseMove={(event) => onHover(project, event)}
        onMouseLeave={onLeave}
      >
        {inner}
      </div>
    </motion.li>
  );
}

export function RecentWorkSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const canHoverPreview = useFinePointerHover();
  const [preview, setPreview] = useState<{
    project: Project;
    x: number;
    y: number;
  } | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  return (
    <section id="work" className="bg-background py-20 md:py-24">
      <motion.div
        ref={sectionRef}
        className="page-figma relative mx-auto max-w-figma"
        style={prefersReducedMotion ? undefined : { scale }}
      >
        <div className="grid grid-cols-2 gap-y-8 lg:grid-cols-[520px_1fr] lg:items-start lg:gap-x-60">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-[540px] font-[family-name:var(--font-display)] text-[clamp(3rem,7vw,5.8rem)] font-medium uppercase leading-[0.9] tracking-[-0.05em] text-foreground"
            >
              MY RECENT
              <br />
              WORK
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:pt-4"
          >
            <p className="max-w-[560px] text-left font-[family-name:var(--font-inter)] text-[18px] leading-[1.65] tracking-[0.005em] text-foreground/92">
              Design is more than pixels; it&apos;s about creating experiences
              that matter. Here&apos;s a look into my process, challenges, and
              solutions that brought each project to life.
            </p>
          </motion.div>
        </div>

        <ul className="mt-16 border-t border-foreground/15 lg:mt-14">
          {projects.map((project, index) => (
            <ProjectRow
              key={`${project.title}-${index}`}
              project={project}
              index={index}
              canHoverPreview={canHoverPreview}
              onHover={(item, event) => {
                if (!canHoverPreview) return;
                setPreview({ project: item, x: event.clientX, y: event.clientY });
              }}
              onLeave={() => setPreview(null)}
            />
          ))}
        </ul>
      </motion.div>

      {canHoverPreview && preview ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-40 w-[min(22rem,42vw)]"
          style={{
            left: preview.x + 28,
            top: preview.y - 90,
            transform: `perspective(900px) rotateY(${(preview.x / window.innerWidth - 0.5) * 10}deg) rotateX(${(0.5 - preview.y / window.innerHeight) * 8}deg)`,
          }}
        >
          <PreviewCard image={preview.project.image} title={preview.project.title} />
        </div>
      ) : null}
    </section>
  );
}
