import type { Metadata } from "next";
import { Inter, Nunito_Sans } from "next/font/google";
import "@/components/v2/global.css";

const sans = Inter({
  variable: "--font-v2-sans",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const label = Nunito_Sans({
  variable: "--font-v2-label",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dipendra Shrestha — v2",
  description: "Alternate concept: GSAP ScrollSmoother, hover-reveal hero, custom cursor.",
};

// Separate root layout (own <html>/<body>) via Next's multiple-root-layouts
// route-group pattern, so this concept doesn't inherit the main site's
// Tailwind globals, Lenis provider, or SiteHeader/SiteFooter.
export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${label.variable}`}>
      <body>{children}</body>
    </html>
  );
}
