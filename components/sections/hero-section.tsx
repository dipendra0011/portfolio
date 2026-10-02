import Link from "next/link";
import { RollText } from "@/components/motion/roll-text";
import { siteConfig } from "@/config/site";

export function HeroSection() {
  return (
    <section>
      <div className="mx-auto max-w-[1200px] px-5 pt-40 pb-16 font-sans text-fg md:box-content md:px-8 md:pt-[220px] md:pb-24">
        {/* Headline */}
        <h1 className="text-[clamp(3rem,7vw,6.25rem)] font-medium leading-[0.9] tracking-[-0.045em]">
          <span className="text-blue">Product design</span> for
          <br className="hidden md:block" /> complex systems that
          <br className="hidden md:block" /> feel obvious
        </h1>

        {/* Intro + CTA */}
        <div className="mt-14 flex flex-col gap-8 md:mt-[72px] md:flex-row md:items-start md:justify-between">
          <p className="max-w-[400px] text-[15px] leading-[1.35]">
            Product &amp; UX/UI designer with 6 years building information-dense tools for startups and scale-ups. Currently open to full-time/contract roles.
          </p>
          <Link
            href={siteConfig.contact.href}
            className="roll-trigger group flex items-center gap-2 self-start text-[13px] uppercase leading-none md:text-[14px]"
          >
            <RollText>{siteConfig.contact.label}</RollText>
            <svg
              aria-hidden
              viewBox="0 0 10 10"
              className="size-2.5 transition-[transform,color] group-hover:text-blue group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            >
              <path
                d="M2 8 8 2M3 2h5v5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            </svg>
          </Link>
        </div>
      </div>
      {/* Full-bleed separator — edge to edge, no gutter */}
      <hr className="border-0 border-t border-fg" />
    </section>
  );
}
