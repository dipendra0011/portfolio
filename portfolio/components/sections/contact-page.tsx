"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FormEvent, useCallback } from "react";
import { CONTACT_EMAIL } from "@/lib/site-contact";

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
  } as const;
}

const fieldClass =
  "w-full rounded-lg border border-border-nav bg-surface px-4 py-3 font-[family-name:var(--font-inter)] text-[15px] leading-relaxed text-white placeholder:text-body-subtle outline-none transition-[border-color,box-shadow] focus-visible:border-accent-lime focus-visible:ring-2 focus-visible:ring-ring";

const labelClass =
  "mb-2 block font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.12em] text-muted";

export function ContactPageSection() {
  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const message = String(fd.get("message") ?? "").trim();

    const subject = `Portfolio inquiry from ${name}`;
    const body = `${message}

---
Name: ${name}
Email: ${email}`;

    const qs = new URLSearchParams({ subject, body }).toString();
    window.location.href = `mailto:${CONTACT_EMAIL}?${qs}`;
  }, []);

  return (
    <div className="bg-background">
      <section
        className="border-b border-surface-raised pt-6 pb-16 md:pb-24 lg:pt-8 lg:pb-28"
        aria-labelledby="contact-heading"
      >
        <div className="page-figma mx-auto max-w-figma">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line-grey/60 pb-8">
            <motion.p
              {...fadeUp(0)}
              className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.12em] text-muted-strong"
            >
              <Link
                href="/"
                className="text-muted transition-colors hover:text-white"
              >
                Home
              </Link>
              <span className="mx-2 text-border-nav" aria-hidden>
                /
              </span>
              <span className="text-white">Contact</span>
            </motion.p>
          </div>

          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-x-16 xl:gap-x-24">
            <div>
              <motion.h1
                id="contact-heading"
                {...fadeUp(0.04)}
                className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,7vw,4.5rem)] font-bold uppercase leading-[1.05] tracking-[-0.04em] text-white"
              >
                <span className="text-accent-lime">Let&apos;s</span> talk
              </motion.h1>
              <motion.p
                {...fadeUp(0.1)}
                className="mt-6 max-w-md font-[family-name:var(--font-inter)] text-[17px] leading-[1.65] text-white/85"
              >
                Share a bit about your project or role. Submitting opens your
                email app with a draft to{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-accent-lime underline decoration-accent-lime/40 underline-offset-4 transition-colors hover:decoration-accent-lime"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </motion.p>
            </div>

            <motion.form
              {...fadeUp(0.12)}
              className="flex flex-col gap-6"
              onSubmit={onSubmit}
            >
              <div>
                <label htmlFor="contact-name" className={labelClass}>
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={fieldClass}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={fieldClass}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={6}
                  className={`${fieldClass} min-h-[140px] resize-y`}
                  placeholder="What would you like to work on?"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="relative flex h-12 w-full items-center justify-center rounded-full border border-border-nav bg-black px-8 outline outline-2 outline-offset-[-2px] outline-white transition-opacity hover:opacity-90 sm:w-auto"
                >
                  <span className="font-[family-name:var(--font-instrument)] text-sm font-normal uppercase leading-5 text-white sm:text-[17.6px]">
                    Send message
                  </span>
                </button>
                <p className="mt-4 font-[family-name:var(--font-inter)] text-sm text-body-subtle">
                  If nothing opens, copy{" "}
                  <span className="text-muted-strong">{CONTACT_EMAIL}</span> into
                  your mail app.
                </p>
              </div>
            </motion.form>
          </div>
        </div>
      </section>
    </div>
  );
}
