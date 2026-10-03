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
    "Paubha: an open-source design system where Figma and code share one source of truth.",
};

/* Copy reflects what actually shipped. Remaining TODOs:
   - Timeline: confirm the months.
   - Figure captions: make sure each caption matches its image. */

const META = [
  { label: "Role", value: "Designer & engineer" },
  { label: "Team", value: "Solo" },
  { label: "Timeline", value: "2026" }, // TODO: add months
  { label: "Focus", value: "Design systems · Tokens · Frontend" },
];

const APPROACH = [
  "Every colour, space and radius is defined once, and named for what it does rather than how it looks.",
  "Figma and code use the exact same names, so designs hand off without translation.",
  "Light and dark themes are built into the tokens, so every component supports both by default.",
  "One sizing scale keeps buttons, inputs and selects aligned whenever they sit side by side.",
  "Every interactive element shares the same soft focus ring, so the whole system feels like one product.",
  "Components install with a single command and live in your codebase, so teams fully own them.",
  "Accessibility is built in, with keyboard support and screen reader labels on every component.",
];

const OUTCOMES = [
  {
    title: "What shipped",
    items: [
      "33 core components, from buttons and inputs to menus, dialogs and tables",
      "Nearly 50 ready-made patterns for real screens: dashboards, settings, sign-in, pricing and more",
      "Light and dark themes built on one shared set of tokens",
      "A live documentation site and an open-source library anyone can install",
    ],
  },
  {
    title: "What I learned",
    items: [
      "Strong foundations make everything faster. New screens get assembled, not redrawn",
      "Small, repeated details, like one shared focus ring, are what make a system feel designed",
      "Examples matter as much as components. People learn a system by seeing it used",
    ],
  },
  {
    title: "Built for",
    items: [
      "Product teams who want design and code to stay aligned",
      "Developers who want accessible components they fully own",
      "Designers who want a Figma library that matches production",
    ],
  },
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

function Figure({
  src,
  caption,
  wide,
  showcase,
}: {
  src: string;
  caption: string;
  wide?: boolean;
  showcase?: boolean;
}) {
  const cls = ["cs-figure", wide && "cs-figure--wide", showcase && "cs-figure--showcase", "cs-reveal"]
    .filter(Boolean)
    .join(" ");
  return (
    <figure className={cls}>
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
              Paubha<span className="cs-title__dim">: one system, from Figma to production.</span>
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

          {/* Hero */}
          <div className="cs-hero cs-cover cs-intro--rest">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/projects/paubha/cover.webp" alt="Paubha design system overview" />
          </div>

          <CaseStudyAnchors items={SECTIONS} />

          <Section id="challenge" index="01">
            <p>
              Design systems usually live in two places. Designers work from a Figma file, engineers
              work from a code library, and over time the two drift apart. A colour gets updated in
              one and not the other. A button looks one way in the mockup and another in the product.
            </p>
            <p>Paubha started with a simple question: what if there was only one source of truth?</p>
          </Section>

          <Section id="approach" index="02">
            <p>
              I started with the foundations, not the components. Get the tokens right and everything
              built on top of them stays consistent.
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

          <div className="cs-gallery cs-gallery--single">
            {/* TODO: confirm caption matches the image */}
            <Figure src="/projects/paubha/showcase.webp" caption="System showcase — colour, actions, type, controls" wide showcase />
          </div>

          <Section id="changed" index="03">
            <p>
              With Paubha, a button’s colour lives in one place: <code>--bg-brand-solid</code>.
              Change it once and every screen updates, in the design file and in the product.
            </p>
            <p>
              Switching a whole product to dark mode, or to a new brand colour, becomes a token
              change instead of a redesign.
            </p>
          </Section>

          <div className="cs-gallery">
            {/* TODO: confirm caption matches the image */}
            <Figure src="/projects/paubha/components.webp" caption="Component library — sign-in, stats, cards, testimonials" />
            {/* TODO: confirm caption matches the image */}
            <Figure src="/projects/paubha/tokens.webp" caption="Spacing and radius scales" />
            {/* TODO: confirm caption matches the image */}
            <Figure src="/projects/paubha/docs.webp" caption="Documentation site — colours, typography, components" wide />
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
              Paubha is open source and still growing. Next up: a published Figma library, more
              real-world examples, and room for others to contribute.
            </p>
          </Section>

          <blockquote className="cs-quote cs-reveal">
            <p>“If design and code can disagree, eventually they will.”</p>
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
