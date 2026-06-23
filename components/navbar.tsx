"use client"

import Link from "next/link";
import { Bookmark, LogOut, Menu, Search, User, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import SearchModal from "@/components/SearchModal";

export function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);
  const savedRef = useRef<HTMLDivElement>(null);
  const { items, removeFromCart, itemCount } = useCart();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (savedRef.current && !savedRef.current.contains(event.target as Node)) {
        setIsSavedOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.isLoggedIn || false);
        setIsAdmin(data.isAdmin || false);
        setIsCheckingSession(false);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsCheckingSession(false);
      });
  }, []);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsProfileOpen(false);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        console.error("Logout failed:", response.statusText);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }

    setIsLoggedIn(false);
    window.location.href = "/";
  }

  return (
    <>
    <nav data-global-navbar="true" className="relative z-[70] border-b border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-4 md:px-6">
        <div className="flex items-center justify-start">
          <Link
            href="/store"
            className="hidden border border-black bg-black px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-black sm:inline-flex"
          >
            Products
          </Link>
        </div>

        <Link
          href="/"
          className="justify-self-center font-serif text-3xl font-black uppercase leading-none tracking-tight text-black md:text-5xl"
        >
          The Lowe Report
        </Link>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search articles"
            className="p-2 text-black transition-colors hover:text-orange-600"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="relative" ref={savedRef}>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Saved items"
              className="rounded-none text-black hover:bg-gray-100 hover:text-orange-600"
              onClick={() => setIsSavedOpen(!isSavedOpen)}
            >
              <Bookmark className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>

            {isSavedOpen && (
              <div className="fixed left-4 right-4 top-16 z-[80] border border-gray-200 bg-white shadow-xl md:absolute md:left-auto md:right-0 md:w-80">
                <div className="border-b border-gray-100 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-black">Saved</h3>
                  <p className="text-sm text-gray-500">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                </div>

                {items.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bookmark className="mx-auto mb-3 h-9 w-9 text-gray-300" />
                    <p className="text-sm text-gray-500">No saved items yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 hover:bg-gray-50">
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/products/${item.slug}`}
                              className="block truncate text-sm font-medium text-black hover:text-orange-600"
                              onClick={() => setIsSavedOpen(false)}
                            >
                              {item.name}
                            </Link>
                            <p className="text-xs uppercase tracking-[0.12em] text-gray-500">{item.type}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                      <Link
                        href="/saved"
                        className="block w-full bg-black py-2.5 text-center text-sm font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-orange-600"
                        onClick={() => setIsSavedOpen(false)}
                      >
                        View Saved
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {!isCheckingSession && (
            <div className="relative hidden sm:block" ref={profileRef}>
              {isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Account"
                    className="rounded-none text-black hover:bg-gray-100 hover:text-orange-600"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                    <User className="h-5 w-5" />
                  </Button>

                  {isProfileOpen && (
                    <div className="absolute right-0 z-[100] mt-2 w-52 border border-gray-200 bg-white shadow-xl">
                      <Link href="/dashboard" className="block px-4 py-3 text-sm font-medium text-black hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="block px-4 py-3 text-sm font-medium text-black hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                          Admin
                        </Link>
                      )}
                      <Link href="/workspace" className="block px-4 py-3 text-sm font-medium text-black hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                        Workspace
                      </Link>
                      <Link href="/settings" className="block px-4 py-3 text-sm font-medium text-black hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50"
                      >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link href="/login" className="p-2 text-black transition-colors hover:text-orange-600" aria-label="Sign in">
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>
          )}

          <button
            type="button"
            className="inline-flex items-center gap-2 p-2 text-sm font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:text-orange-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
          >
            <span className="hidden md:inline">Menu</span>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-1 px-6 py-5 text-sm font-semibold uppercase tracking-[0.16em] text-black md:grid-cols-4">
            <Link href="/" className="py-2 hover:text-orange-600" onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/newsletter" className="py-2 hover:text-orange-600" onClick={() => setIsMobileMenuOpen(false)}>
              Articles
            </Link>
            <Link href="/store" className="py-2 hover:text-orange-600" onClick={() => setIsMobileMenuOpen(false)}>
              Products
            </Link>
            <Link href="/pricing" className="py-2 hover:text-orange-600" onClick={() => setIsMobileMenuOpen(false)}>
              Subscribe
            </Link>
          </div>
        </div>
      )}
    </nav>

    <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
