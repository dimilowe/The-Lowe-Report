"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

export default function MonetizationBar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("monetization-bar-dismissed");
    if (dismissed) {
      setIsHidden(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("monetization-bar-dismissed", "true");
    setTimeout(() => setIsHidden(true), 300);
  };

  if (isHidden) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="bg-white border-t border-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black">
              Grow your audience —
              <span className="font-normal text-gray-600 ml-1 normal-case tracking-normal">
                tools built for creators
              </span>
            </p>

            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/products/nudge"
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap"
              >
                Try Nudge
              </Link>

              <Link
                href="/products/qrsocial"
                className="px-4 py-1.5 border border-black hover:bg-black hover:text-white text-black text-xs font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap"
              >
                QR Social
              </Link>

              <button
                onClick={handleDismiss}
                className="p-1 text-gray-400 hover:text-black transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
