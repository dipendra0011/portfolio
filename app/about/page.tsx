import type { Metadata } from "next";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { AboutMotion } from "@/components/sections/about/about-motion";
import { AboutContents } from "@/components/sections/about/about-contents";
import { AboutChapters, type Chapter } from "@/components/sections/about/about-chapters";
import { AboutExperience, type Role } from "@/components/sections/about/about-experience";
import { RollText } from "@/components/motion/roll-text";
import {
  AboutTestimonials,
  type Testimonial,
} from "@/components/sections/about/about-testimonials";
import "@/components/sections/about/about.css";

export const metadata: Metadata = {
  title: "About — Dipendra Shrestha",
  description:
    "Dipendra Shrestha is a product designer in Kathmandu who got here the long way: through drawing, a graphic design course, marketing, copywriting and a little code.",
};

/* ------------------------------------------------------------------
   Copy + placeholder data. Everything marked TODO is a stand-in — swap
   the years, quotes and portrait for real ones before this goes live.
   ------------------------------------------------------------------ */

const CONTENTS = [
  { id: "intro", label: "A brief intro" },
  { id: "story", label: "How did I get here?" },
  { id: "experience", label: "When and where" },
  { id: "kind-words", label: "What others say" },
  { id: "off-the-clock", label: "Off the clock" },
];

const CHAPTERS: Chapter[] = [
  {
    title: "Drawing on everything",
    years: "Early years",
    story: [
      "Before any of this had a name, I was the kid drawing on whatever was in reach: notebooks, the backs of worksheets, anything flat. Art and craft was the one class I never wanted to end.",
      "I didn't know design was a job. I just liked making things look the way they felt in my head, and cutting and gluing until they did.",
    ],
    picked: ["Drawing", "Art & craft", "An eye for detail"],
  },
  {
    title: "A course my brother picked",
    years: "2018", // TODO: confirm the year of your SEE + course
    story: [
      "After my SEE exams in 10th grade, my brother suggested a graphic design course. That's where I first opened the tools, and where drawing turned into something I could do on a screen.",
      "Then studies took over. The course ended, the files sat untouched, and for about two years I forgot design was something I'd ever done.",
    ],
    picked: ["Photoshop", "Illustrator", "Layout basics"],
  },
  {
    title: "Back to it, in lockdown",
    years: "2020",
    story: [
      "COVID shut everything down and left me with time and nothing to fill it. I was starting a BBA in Marketing, and on the side I tried learning to code, because tech had always pulled at me too.",
      "Code taught me how products actually get built. It also taught me it wasn't my strongest skill. So I went back to what I already loved and asked how I could use it to make something meaningful.",
    ],
    picked: ["BBA, Marketing", "Code basics", "How products ship"],
  },
  {
    title: "Learning to sell it",
    years: "2021 – 2023", // TODO: confirm your marketing years
    story: [
      "Marketing taught me to write for people and to check whether it worked. I worked as a digital marketer and a junior copywriter, writing the words and running Meta ads, then watching which ones people actually clicked.",
      "The biggest of those was the political campaign for Pukar Bam of the Rastriya Swatantra Party. Real deadlines, real stakes, and a lot of people to reach with no room for a message that didn't land.",
    ],
    picked: ["Copywriting", "Meta ads", "Campaign strategy", "Reading the data"],
  },
  {
    title: "Finding product design",
    years: "2021 – Now", // TODO: confirm, and match the "years" line in the home hero
    story: [
      "A bit of research led me to product design, and it clicked straight away. It's the one job that uses everything I'd picked up: the drawing, the marketing brain and the curiosity about tech.",
      "Now I design dashboards, tools and design systems for startups and scale-ups. Products with a lot going on, made to feel obvious to the people using them.",
    ],
    picked: ["Product design", "UX research", "Design systems", "Prototyping"],
  },
];

// TODO: company names and exact years are stand-ins — swap in the real ones.
const ROLES: Role[] = [
  {
    years: "2021 – Now",
    title: "Product Designer",
    takeaway: "Make the complex feel obvious.",
    meta: "Company name · Full-time", // TODO
    summary:
      "Product and UX/UI design for startups and scale-ups: dashboards and information-dense tools, from research and flows through to shipped interfaces and the design systems behind them.",
    highlights: ["Dashboards", "Information-dense tools", "Design systems", "UX research", "Prototyping"],
    link: { label: "See the Paubha design system", href: "/work/paubha-design-system" },
  },
  {
    years: "2022", // TODO: confirm the campaign year
    title: "Pukar Bam campaign",
    takeaway: "Every word had a deadline.",
    meta: "Rastriya Swatantra Party · Digital campaign",
    summary:
      "Ran the digital side of a political campaign: the messaging, the Meta ads and the reporting, against an election deadline that didn't move.",
    highlights: ["Meta ads", "Campaign messaging", "Audience targeting", "Reporting"],
  },
  {
    years: "2021 – 2023", // TODO
    title: "Digital Marketer",
    takeaway: "Read the people behind the numbers.",
    meta: "Company name", // TODO
    summary:
      "Planned and ran paid social, mostly on Meta, and learned to read what the numbers were saying about the people behind them.",
    highlights: ["Meta ads", "Paid social", "Analytics", "A/B testing"],
  },
  {
    years: "2021 – 2022", // TODO
    title: "Junior Copywriter",
    takeaway: "Say it in fewer words.",
    meta: "Company name", // TODO
    summary:
      "Wrote ads, captions and landing pages. Learned that a headline has one job, and that cutting words is most of the work.",
    highlights: ["Copywriting", "Ad copy", "Landing pages", "Tone of voice"],
  },
  {
    years: "2020 – 2024", // TODO: confirm
    title: "BBA, Marketing",
    takeaway: "Know who it’s for first.",
    meta: "University name · Bachelor’s degree", // TODO
    summary:
      "Business with a marketing major: research, consumer behaviour and strategy. The reason I think about who a product is for before what it looks like.",
    highlights: ["Marketing", "Consumer behaviour", "Market research"],
  },
];

// TODO: set to your LinkedIn profile URL to show the link.
const LINKEDIN_URL: string | undefined = undefined;

// Intro portrait links out here.
const PROFILE_LINK = "https://www.youtube.com/watch?v=G6Wgda6nz4Q";

// TODO: placeholders. Replace with real quotes, names and roles.
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Dipendra takes a tangled brief and comes back with something the whole team understands in one look.",
    name: "Name Surname",
    role: "Role, Company",
  },
  {
    quote:
      "He thinks like a marketer and builds like a designer. Every screen knew who it was for and what it had to say.",
    name: "Name Surname",
    role: "Role, Company",
  },
  {
    quote:
      "Fast, curious and honest about trade-offs. Handing his files to engineering was the easy part of the project.",
    name: "Name Surname",
    role: "Role, Company",
  },
];

const OFF_THE_CLOCK = [
  {
    title: "Drawing",
    body: "Still the first thing I reach for. Sketchbooks mostly, and the odd crayon bird.",
  },
  {
    title: "New tech",
    body: "If a new tool shipped this week, I've probably already broken something with it.",
  },
  {
    title: "Hiking & trekking",
    body: "Kathmandu is ringed by hills, so a lot of weekends end somewhere up a trail.",
  },
];

const label = "font-label text-[12px] uppercase leading-none tracking-[0.02em] text-fg-dim";
const statement = "font-medium leading-[0.95] tracking-[-0.045em]";

export default function AboutPage() {
  return (
    <SmoothScroll>
      <AboutMotion>
        <main id="main" className="font-sans text-fg">
          {/* --- Intro --- */}
          {/* Top padding clears the fixed header. */}
          <section id="intro" className="px-5 pt-28 pb-24 md:px-9 md:pt-32 md:pb-36">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-x-6">
              <AboutContents items={CONTENTS} className="about-load md:col-span-3" />

              <div className="about-load max-w-[420px] text-[15px] leading-[1.35] md:col-span-5 lg:col-span-4">
                <a
                  href={PROFILE_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group float-left mr-4 mb-2 block w-[88px] md:w-[104px]"
                  aria-label="Dipendra Shrestha — open on YouTube"
                >
                  {/* Source is a tall full-body portrait — cropped to the top
                      so the square frame holds the face, not the waist. */}
                  <img
                    src="/profile-web.jpeg"
                    alt="Dipendra Shrestha"
                    width={592}
                    height={592}
                    className="block aspect-square size-full rounded-[4px] bg-surface object-cover object-top grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                  />
                </a>
                <p>
                  I&apos;ve been drawing since before I knew it was a skill. Somewhere between a
                  graphic design course, a marketing degree and a few months of losing to code, I
                  found the job that uses all of it.
                </p>
                <p className="mt-3">
                  These days that job is product design: tools and systems where a lot is going on
                  and very little should feel hard.
                </p>
              </div>

              <dl className="about-load flex flex-col gap-6 text-[15px] leading-[1.35] md:col-span-4 md:items-end md:text-right lg:col-span-5">
                <div className="flex flex-col gap-2">
                  <dt className={label}>Based in</dt>
                  <dd>Kathmandu, Nepal</dd>
                </div>
                <div className="flex flex-col gap-2">
                  <dt className={label}>Right now</dt>
                  <dd>Open to full-time and contract roles</dd>
                </div>
              </dl>
            </div>

            <p
              className={`about-manifesto mt-[22svh] text-[clamp(2.25rem,5.2vw,5.5rem)] ${statement} md:indent-[25%]`}
            >
              I&apos;m a product designer who came the long way round: through art class, a
              graphic design course, ad accounts, copy decks and a lot of broken code. That route
              is the point. I know what a brand needs to say, what a person needs to do and what
              an engineer needs to build,{" "}
              <span className="text-blue">and I design for all three at once.</span>
            </p>
          </section>

          {/* --- Story --- */}
          <section id="story" aria-labelledby="story-heading">
            <div className="grid gap-6 border-t border-fg px-5 pt-10 pb-14 md:grid-cols-12 md:gap-x-6 md:px-9 md:pt-14 md:pb-20">
              <span className={`${label} md:col-span-3`}>[02] The long way round</span>
              <h2
                id="story-heading"
                className={`about-reveal text-[clamp(2.75rem,6.5vw,6.25rem)] ${statement} md:col-span-9`}
              >
                How did I get here?
              </h2>
            </div>
            <AboutChapters chapters={CHAPTERS} />
          </section>

          {/* --- Experience --- */}
          <section
            id="experience"
            aria-labelledby="experience-heading"
            className="about-experience px-5 pt-14 pb-24 text-bg md:px-9 md:pt-20 md:pb-24"
          >
            <div className="grid gap-6 pb-12 md:grid-cols-12 md:gap-x-6 md:pb-16">
              <span className="font-label text-[12px] uppercase leading-none tracking-[0.02em] text-bg/75 md:col-span-3">
                [03] When and where
              </span>
              <div className="flex flex-col items-start gap-8 md:col-span-9">
                <h2
                  id="experience-heading"
                  className={`about-reveal text-[clamp(2.75rem,6.5vw,6.25rem)] ${statement}`}
                >
                  The roles changed.
                  <br />
                  <span className="text-(--about-accent)">The thread didn&apos;t.</span>
                </h2>
                <p className="about-reveal max-w-[44ch] text-[15px] leading-[1.5] text-bg/85">
                  Dipendra Shrestha is a product designer in Kathmandu, Nepal, designing
                  dashboards, tools and design systems for startups and scale-ups. Before that:
                  digital marketing, copywriting and a lot of Meta ads.
                </p>
                {LINKEDIN_URL && (
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="roll-trigger group flex items-center gap-2 text-[15px] leading-none"
                  >
                    <RollText>The longer version on LinkedIn</RollText>
                    <svg
                      aria-hidden
                      viewBox="0 0 10 10"
                      className="size-2.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    >
                      <path d="M2 8 8 2M3 2h5v5" fill="none" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
            <AboutExperience roles={ROLES} />
          </section>

          {/* --- Kind words --- */}
          <section
            id="kind-words"
            aria-labelledby="kind-words-heading"
            className="grid gap-10 px-5 pt-10 pb-24 md:grid-cols-12 md:gap-x-6 md:px-9 md:pt-14 md:pb-36"
          >
            <div className="flex flex-col gap-4 md:col-span-3">
              <span className={label}>[04] Kind words</span>
              <h2 id="kind-words-heading" className="max-w-[18ch] text-[15px] leading-[1.35]">
                What colleagues, teammates and clients say
              </h2>
            </div>
            <AboutTestimonials items={TESTIMONIALS} />
          </section>

          {/* --- Off the clock --- */}
          <section
            id="off-the-clock"
            aria-labelledby="off-the-clock-heading"
            className="grid gap-10 border-t border-fg px-5 pt-10 pb-24 md:grid-cols-12 md:gap-x-6 md:px-9 md:pt-14 md:pb-36"
          >
            <span className={`${label} md:col-span-3`}>[05] Off the clock</span>
            <div className="md:col-span-9">
              <h2
                id="off-the-clock-heading"
                className={`about-reveal text-[clamp(2.25rem,5.2vw,5.5rem)] ${statement}`}
              >
                Design is the job.
                <br />
                <span className="text-fg-dim">It&apos;s not the whole person.</span>
              </h2>
              <dl className="mt-16 grid gap-10 border-t border-line pt-6 md:mt-24 md:grid-cols-3 md:gap-6">
                {OFF_THE_CLOCK.map((item) => (
                  <div key={item.title} className="about-reveal flex flex-col gap-3">
                    <dt className="text-[18px] font-medium leading-none tracking-[-0.01em]">
                      {item.title}
                    </dt>
                    <dd className="max-w-[32ch] text-[15px] leading-[1.45] text-fg-dim">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </main>
      </AboutMotion>
    </SmoothScroll>
  );
}
