import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/v2/case-study";
import { PROJECTS, getNextProject, getProject } from "@/lib/projects-data";

/* Deliberately NOT "use client": generateStaticParams can only be exported
   from a server component, and next.config.ts sets `output: "export"`, which
   makes it mandatory for a dynamic segment — there's no runtime fallback to
   fall back to. The interactive half lives in <CaseStudy>. */

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  return {
    title: project ? `${project.title} — Dipendra Shrestha` : "Work — Dipendra Shrestha",
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Next 16 hands `params` in as a Promise — awaiting it is required.
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  return <CaseStudy project={project} nextProject={getNextProject(slug)} />;
}
