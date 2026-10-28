import type { Metadata } from "next";
import NewsletterPage from "@/components/NewsletterPage";
import AdSlot from "@/components/ads/AdSlot";

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
  return (
    <NewsletterPage
      searchParams={searchParams}
      afterLead={
        <AdSlot
          placement="tlr_home_banner"
          refreshKey="homepage"
          reserveHeight={280}
          className="tlr-native-ad mx-auto my-8 w-full max-w-3xl"
        />
      }
    />
  );
}
