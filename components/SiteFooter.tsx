import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">The Lowe Report</p>
            <p className="text-sm text-gray-600">Culture, style, and creator business coverage.</p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
            <Link href="/terms" className="hover:text-orange-600 transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/privacy" className="hover:text-orange-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/cookie-policy" className="hover:text-orange-600 transition-colors">
              Cookie Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-orange-600 transition-colors">
              Refund Policy
            </Link>
            <Link href="/dmca" className="hover:text-orange-600 transition-colors">
              DMCA
            </Link>
            <Link href="/contact" className="hover:text-orange-600 transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4 text-xs text-gray-500">
          © {year} The Lowe Report. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
