import type { Metadata } from "next";
import NewsletterPage from "./newsletter/page";

export const metadata: Metadata = {
  title: "The Lowe Report",
  description: "Read the latest reporting, interviews, culture, style, and creator business coverage from The Lowe Report.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Lowe Report",
    description: "Read the latest reporting, interviews, culture, style, and creator business coverage.",
    url: "/",
    type: "website",
    siteName: "The Lowe Report",
  },
};

export const revalidate = 60;

export default function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  return <NewsletterPage searchParams={searchParams} />;
}
