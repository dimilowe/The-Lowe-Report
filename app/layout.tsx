import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { CartProvider } from "@/contexts/CartContext";
import { AppProvider } from "@/components/providers/AppProvider";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import FloatingToolsButton from "@/components/FloatingToolsButton";
import SiteFooter from "@/components/SiteFooter";
import { FeedbackLauncherButton } from "@/components/FeedbackLauncherButton";
import { getSiteUrl } from "@/lib/site-url";

const inter = Inter({ subsets: ["latin"] });
const SUNSET_MODE = false;

export const metadata: Metadata = {
  title: "The Lowe Report",
  description: "Culture, style, and creator business coverage from The Lowe Report.",
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "zoAGLmXBDcCSAHWxGPaxlAQSgpsh2ScnkmVuMQ7YYZQ",
  },
  openGraph: {
    title: "The Lowe Report",
    description: "Culture, style, and creator business coverage from The Lowe Report.",
    url: "/",
    siteName: "The Lowe Report",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {SUNSET_MODE ? (
          <main className="min-h-screen">{children}</main>
        ) : (
          <CartProvider>
            <AppProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <SiteFooter />
              </div>
              <FeedbackLauncherButton />
              <FeedbackDialog hideTrigger />
              <FloatingToolsButton />
            </AppProvider>
          </CartProvider>
        )}
      </body>
    </html>
  );
}
