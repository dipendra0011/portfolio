import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { CaseStudyReveal } from "@/components/case-study/case-study-reveal";
import { CaseStudyAnchors } from "@/components/case-study/case-study-anchors";
import { EnlargeImage } from "@/components/case-study/enlarge-image";
import { RollText } from "@/components/motion/roll-text";
import { ArrowRight } from "@/components/sections/projects/arrow-right";
import "@/components/case-study/case-study.css";

export const metadata: Metadata = {
  title: "Paubha Design System — Dipendra Shrestha",
  description:
    "Case study: building Paubha, a token-driven design system mirrored one-to-one between Figma and code.",
};

/* ------------------------------------------------------------------
   Copy + placeholder data. Everything marked TODO is a stand-in — swap
   the numbers, dates and images for real ones before this goes live.
   ------------------------------------------------------------------ */

const META = [
  { label: "Role", value: "Author, Product Designer" },
  { label: "Team", value: "Solo, with engineering review" }, // TODO
  { label: "Timeline", value: "2025 – 2026" }, // TODO
  { label: "Focus", value: "Design systems · Tokens · Frontend" },
];

const APPROACH = [
  "Audited existing screens and pulled every colour, size and radius into one inventory.",
  "Split tokens into two layers: primitives (raw scales) and semantics (what a value is for).",
  "Built light and dark modes on the semantic layer only, so components never touch a hex.",
  "Set a 4px spacing base and a squircle-leaning radius scale shared by Figma and CSS.",
  "Built components in Figma first, then mirrored each one in React with matching variants.",
  "Wrote a sync log so every token change is traceable back to a Figma node.",
];

const OUTCOMES = [
  {
    title: "What shipped",
    items: [
      "11-step brand, gray and status ramps",
      "Semantic tokens for bg, fg, border and focus, in light and dark",
      "Spacing, radius, shadow and type scales as Tailwind v4 theme tokens",
      "Component library with variants and states, mirrored in code",
    ],
  },
  {
    title: "What I observed",
    items: [
      "New screens get assembled from existing parts instead of redrawn",
      "Dark mode came almost for free once semantics were in place",
      "Design and code disagreements became diffs, not debates",
    ],
  },
  {
    title: "What this case doesn’t claim",
    items: [
      "No formal before/after time study was run", // TODO: replace if you have numbers
      "Adoption figures are directional, not measured",
    ],
  },
];

const BRAND_RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const GRAY_RAMP = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const TYPE_SCALE = [
  { token: "display-xl", size: "60 / 72" },
  { token: "display-md", size: "36 / 44" },
  { token: "body-lg", size: "18 / 28" },
  { token: "ui-md", size: "14 / 20" },
];

const SPACING = [
  { token: "xs", px: 4 },
  { token: "md", px: 8 },
  { token: "xl", px: 16 },
  { token: "3xl", px: 24 },
  { token: "4xl", px: 32 },
  { token: "6xl", px: 48 },
  { token: "7xl", px: 64 },
];

const RADII = [
  { token: "xs", px: 4 },
  { token: "sm", px: 8 },
  { token: "md", px: 12 },
  { token: "lg", px: 16 },
  { token: "xl", px: 20 },
];

/* ------------------------------------------------------------------ */

const SECTIONS = [
  { id: "challenge", label: "The challenge" },
  { id: "approach", label: "The approach" },
  { id: "changed", label: "What changed" },
  { id: "outcomes", label: "Outcomes" },
  { id: "next", label: "What’s next" },
];

function Section({
  id,
  index,
  children,
}: {
  id: string;
  index: string;
  children: ReactNode;
}) {
  const title = SECTIONS.find((s) => s.id === id)?.label ?? "";
  return (
    <section className="cs-section" id={id} aria-labelledby={`${id}-title`}>
      {/* No reveal on the head itself — it gets pinned, so the reveal
          lives on its children instead. */}
      <div className="cs-section__head">
        <span className="cs-label cs-reveal">{index}</span>
        <h2 className="cs-section__title cs-reveal" id={`${id}-title`}>
          {title}
        </h2>
      </div>
      <div className="cs-section__body cs-reveal">{children}</div>
    </section>
  );
}

function Figure({ src, caption, wide }: { src: string; caption: string; wide?: boolean }) {
  return (
    <figure className={wide ? "cs-figure cs-figure--wide cs-reveal" : "cs-figure cs-reveal"}>
      <div className="cs-figure__media">
        <EnlargeImage src={src} alt={caption} />
      </div>
      <figcaption className="cs-label">{caption}</figcaption>
    </figure>
  );
}

export default function PaubhaCaseStudyPage() {
  return (
    <SmoothScroll>
      <CaseStudyReveal>
        <main id="main" className="cs">
          {/* The intro is hidden in CSS until GSAP takes over; without JS
              nothing would ever reveal it. */}
          <noscript>
            <style>{`.cs-title,.cs-intro--eyebrow,.cs-intro--rest{visibility:visible!important}`}</style>
          </noscript>
          {/* Header */}
          <header className="cs-header">
            <p className="cs-label cs-intro--eyebrow">Case study · Design system</p>
            <h1 className="cs-title">
              Paubha<span className="cs-title__dim">: built once in Figma, shipped everywhere in code.</span>
            </h1>

            <dl className="cs-meta cs-intro--rest">
              {META.map((item) => (
                <div key={item.label} className="cs-meta__item">
                  <dt className="cs-label">{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </header>

          {/* Hero — TODO: replace with a real cover shot */}
          <div className="cs-hero cs-cover cs-intro--rest">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/projects/project-b.webp" alt="Paubha design system overview" />
          </div>

          <CaseStudyAnchors items={SECTIONS} />

          <Section id="challenge" index="01">
            <p>
              Every new screen was being drawn from scratch. Blues drifted between files, spacing was
              eyeballed, and dark mode meant duplicating whole frames. Design and code each had their
              own version of the truth, and they rarely agreed.
            </p>
            <p>
              The goal was one source of truth: a system where a value is decided once, named for
              what it does, and reaches both Figma and production without anyone retyping it.
            </p>
          </Section>

          <Section id="approach" index="02">
            <p>
              I started with tokens, not components. If the foundations are wrong, every component
              built on top inherits the mistake.
            </p>
            <ol className="cs-steps">
              {APPROACH.map((step, i) => (
                <li key={step}>
                  <span className="cs-label">{String(i + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Section>

          {/* Foundations — rendered live from the real tokens, so these never
              need a screenshot. */}
          <section className="cs-plates" aria-labelledby="foundations-title">
            <h2 id="foundations-title" className="sr-only">
              Foundations
            </h2>
            <div className="cs-plate cs-plate--wide cs-reveal">
              <p className="cs-label">Colour · primitives</p>
              {[
                { name: "Brand", token: "brand", ramp: BRAND_RAMP },
                { name: "Gray", token: "gray", ramp: GRAY_RAMP },
              ].map(({ name, token, ramp }) => (
                <div key={token} className="cs-ramp-row">
                  <span className="cs-ramp-row__name">{name}</span>
                  {/* One labelled image per ramp: eleven bare numbers read
                      out one by one tell a screen reader user nothing. */}
                  <div
                    className="cs-ramp"
                    role="img"
                    aria-label={`${name} ramp, ${ramp.length} steps from ${ramp[0]} to ${ramp[ramp.length - 1]}`}
                  >
                    {ramp.map((step) => (
                      <div key={step} className="cs-ramp__swatch" aria-hidden>
                        <span style={{ background: `var(--${token}-${step})` }} />
                        <small>{step}</small>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="cs-plate cs-reveal">
              <p className="cs-label">Type scale</p>
              <ul className="cs-type">
                {TYPE_SCALE.map((t) => (
                  <li key={t.token}>
                    <span className={`cs-type__sample cs-type__sample--${t.token}`}>Aa</span>
                    <span className="cs-label">
                      {t.token} · {t.size}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cs-plate cs-reveal">
              <p className="cs-label">Spacing · 4px base</p>
              <ul className="cs-spacing">
                {SPACING.map((s) => (
                  <li key={s.token}>
                    <span className="cs-spacing__bar" style={{ width: s.px * 3 }} aria-hidden />
                    <span className="cs-label">
                      {s.token} · {s.px}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="cs-label cs-plate__sub">Radius</p>
              <div className="cs-radii">
                {RADII.map((r) => (
                  <div key={r.token}>
                    <span style={{ borderTopLeftRadius: r.px }} aria-hidden />
                    <small>{r.px}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Section id="changed" index="03">
            <p>
              Before, a button colour lived in a dozen places. Now it lives in one:{" "}
              <code>--bg-brand-solid</code>. Components only reference semantic tokens, so a change to
              the brand ramp or a new dark-mode value updates every surface at once.
            </p>
            <p>
              Figma and code share the same names, the same scales and the same states. Handoff
              stopped being a translation step.
            </p>
          </Section>

          {/* TODO: replace with component library + docs screenshots */}
          <div className="cs-gallery">
            <Figure src="/projects/project-a.webp" caption="Component library — buttons, inputs, badges" />
            <Figure src="/projects/project-c.webp" caption="Light and dark semantic tokens" />
            <Figure src="/projects/gallery.webp" caption="Documentation site" wide />
          </div>

          <Section id="outcomes" index="04">
            <div className="cs-outcomes">
              {OUTCOMES.map((group) => (
                <div key={group.title} className="cs-outcomes__col">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section id="next" index="05">
            <p>
              A system is never finished. Next up: application-level patterns (grids, forms, empty
              states), automated token sync from Figma variables, and contribution guidelines so
              others can extend Paubha without breaking it.
            </p>
          </Section>

          <blockquote className="cs-quote cs-reveal">
            <p>“A design system only works when using it is easier than working around it.”</p>
          </blockquote>

          <nav className="cs-next" aria-label="Keep exploring">
            <span className="cs-label">Keep exploring</span>
            <Link href="/work" className="roll-trigger cs-next__link">
              <RollText>Back to all works</RollText>
              <ArrowRight strokeWidth={1.5} />
            </Link>
          </nav>
        </main>
      </CaseStudyReveal>
    </SmoothScroll>
  );
}
