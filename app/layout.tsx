import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add
          attributes to <body> before React hydrates. This only silences
          attribute mismatches on <body> itself, not on anything inside it. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* First tab stop on every page: jumps past the header nav. Every
            page's <main> carries id="main". */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-[60] focus:flex focus:h-11 focus:items-center focus:rounded-[4px] focus:bg-surface focus:px-3.5 focus:font-sans focus:text-[18px] focus:text-fg"
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
