"use client";

import { Mail } from "lucide-react";
import "./social-sidebar.css";

type IconProps = { size?: number; strokeWidth?: number };

// lucide-react no longer ships brand marks (GitHub/LinkedIn/X) — hand-rolled
// to match the stroke weight of the rest of the icon set.
function GithubIcon({ size = 24, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

function LinkedinIcon({ size = 24, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v1.5A6 6 0 0 1 16 8Z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon({ size = 24, strokeWidth = 1.75 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l7.6 9.6L4.3 20H6l6-6.5L17 20h3l-8-10.1L19 4h-2l-5.4 6L7 4H4Z" />
    </svg>
  );
}

const LINKS = [
  { label: "GitHub", href: "#", Icon: GithubIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedinIcon },
  { label: "Twitter", href: "#", Icon: TwitterIcon },
  { label: "Email", href: "mailto:dipendra@example.com", Icon: Mail },
];

export function SocialSidebar() {
  return (
    <nav className="social-sidebar" aria-label="Social links">
      {LINKS.map(({ label, href, Icon }) => (
        <a key={label} href={href} aria-label={label} data-cursor-hover>
          <Icon size={18} strokeWidth={1.75} />
        </a>
      ))}
    </nav>
  );
}
