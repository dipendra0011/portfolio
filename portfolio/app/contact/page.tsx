import type { Metadata } from "next";
import { ContactPageSection } from "@/components/sections/contact-page";

export const metadata: Metadata = {
  title: "Contact · Dipendra Shrestha",
  description:
    "Reach out to Dipendra Shrestha for product design, UX, and collaboration inquiries.",
};

export default function ContactPage() {
  return <ContactPageSection />;
}
