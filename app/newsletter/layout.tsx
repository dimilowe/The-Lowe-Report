import MonetizationBar from "@/components/MonetizationBar";
import CreatorStack from "@/components/CreatorStack";

export default function NewsletterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="pb-14">
        {children}
        <div className="max-w-4xl mx-auto px-4">
          <CreatorStack />
        </div>
      </div>
      <MonetizationBar />
    </>
  );
}
