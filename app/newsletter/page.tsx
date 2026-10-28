import type { Metadata } from "next";
import NewsletterPage from "@/components/NewsletterPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "The Lowe Report",
  description: "Read the latest reporting, interviews, culture, style, and creator business coverage from The Lowe Report.",
  openGraph: {
    title: "The Lowe Report",
    description: "Read the latest reporting, interviews, culture, style, and creator business coverage.",
    type: "website",
  },
};

export default function NewsletterRoute({ searchParams }: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  return <NewsletterPage searchParams={searchParams} />;
}
