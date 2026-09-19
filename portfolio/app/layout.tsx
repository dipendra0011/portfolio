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
  title: "Dipendra Shrestha · Product Designer & Digital Marketer",
  description:
    "Portfolio of Dipendra Shrestha — product design, web design, and digital marketing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${label.variable}`}>
      <body>{children}</body>
    </html>
  );
}
