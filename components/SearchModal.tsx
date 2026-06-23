"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface Result {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string;
  categories: { id: number; name: string; slug: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/newsletter/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
        setActiveIndex(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);
    search(val);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = activeIndex >= 0 ? results[activeIndex] : results[0];
      if (target) {
        onClose();
        router.push(`/newsletter/${target.slug}`);
      }
    }
  }

  function handleResultClick(slug: string) {
    onClose();
    router.push(`/newsletter/${slug}`);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center bg-black/60 px-4 pt-20 sm:pt-28"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-gray-200 px-4">
          {loading
            ? <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-gray-400" />
            : <Search className="h-5 w-5 flex-shrink-0 text-gray-400" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search articles…"
            className="flex-1 py-4 text-base text-black placeholder-gray-400 outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-1 text-gray-400 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {results.length > 0 && (
          <ul>
            {results.map((r, i) => {
              const category = r.categories?.[0]?.name || "";
              return (
                <li key={r.id}>
                  <button
                    onClick={() => handleResultClick(r.slug)}
                    className={`flex w-full items-center gap-4 px-4 py-3 text-left transition-colors ${
                      i === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
                    } ${i < results.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <div
                      className="h-14 w-20 flex-shrink-0 bg-cover bg-center bg-gray-200"
                      style={{
                        backgroundImage: r.featured_image_url
                          ? `url('${r.featured_image_url}')`
                          : undefined,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      {category && (
                        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                          {category}
                        </p>
                      )}
                      <p className="truncate text-sm font-semibold text-black">{r.title}</p>
                      {r.excerpt && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{r.excerpt}</p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500">
            No articles found for <span className="font-semibold">"{query}"</span>
          </p>
        )}

        {query.length === 0 && (
          <p className="px-4 py-4 text-xs text-gray-400">
            Start typing to search all articles…
          </p>
        )}
      </div>
    </div>
  );
}
