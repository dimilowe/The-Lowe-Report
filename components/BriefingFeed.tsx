"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BriefingPost } from "@/lib/briefing-types";

export default function BriefingFeed({
  initialPosts,
  initialNextPage,
  category,
}: {
  initialPosts: BriefingPost[];
  initialNextPage: number | null;
  category?: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [nextPage, setNextPage] = useState(initialNextPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => () => activeRequest.current?.abort(), []);

  const loadMore = useCallback(async () => {
    if (nextPage === null || activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ page: String(nextPage) });
      if (category) params.set("category", category);
      const response = await fetch(`/api/newsletter/briefing?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Article request failed");
      const data: { posts: BriefingPost[]; nextPage: number | null } = await response.json();
      if (controller.signal.aborted) return;
      setPosts(existing => {
        const ids = new Set(existing.map(post => post.id));
        return [...existing, ...data.posts.filter(post => !ids.has(post.id))];
      });
      setNextPage(data.nextPage);
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      if (!controller.signal.aborted) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }, [category, nextPage]);

  useEffect(() => {
    if (error || loading || nextPage === null || !sentinel.current || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) void loadMore();
    }, { rootMargin: "300px" });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [error, loading, nextPage, loadMore]);

  const nextHref = nextPage === null ? null : `/newsletter?${new URLSearchParams({
    ...(category ? { category } : {}), page: String(nextPage),
  })}#briefing`;

  return (
    <>
      <div className="grid gap-8 md:grid-cols-3" aria-label="Briefing articles">
        {posts.map(post => {
          const content = (
            <>
              <div className="mb-5 aspect-[16/9] w-full bg-cover bg-center bg-gray-200"
                style={{ backgroundImage: post.featured_image_url ? `url('${post.featured_image_url}')` : undefined }} />
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-black">{post.eyebrow}</p>
              <h3 className="text-2xl font-semibold leading-tight tracking-tight group-hover:text-orange-600">{post.title}</h3>
              {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{post.excerpt}</p>}
            </>
          );
          return post.href
            ? <Link key={post.id} href={post.href} className="group block border-t border-gray-200 pt-5">{content}</Link>
            : <article key={post.id} className="group block border-t border-gray-200 pt-5">{content}</article>;
        })}
      </div>
      <div ref={sentinel} className="mt-8 text-center text-sm text-gray-600">
        <p role="status" aria-live="polite">{loading ? "Loading more articles…" : error ? "Articles could not be loaded. Please try again." : nextPage === null && posts.length > 0 ? "You’re all caught up." : ""}</p>
        {nextHref && (
          <a href={nextHref}
            className="mt-4 inline-block border border-gray-300 px-5 py-3 font-semibold text-black hover:text-orange-600"
            onClick={event => { event.preventDefault(); void loadMore(); }}
            aria-disabled={loading}>
            {error ? "Try again" : "More articles"}
          </a>
        )}
      </div>
    </>
  );
}
