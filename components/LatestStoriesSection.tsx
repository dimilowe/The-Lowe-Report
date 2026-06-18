"use client";

import { useState } from "react";
import Link from "next/link";

interface Story {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string;
  view_count: number;
  categories: { id: number; name: string; slug: string }[];
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function StoryRow({ story }: { story: Story }) {
  const category = story.categories?.[0]?.name || "Culture";
  const href = `/newsletter/${story.slug}`;

  return (
    <Link href={href} className="group flex gap-4 py-6 border-b border-gray-200">
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-black">
          {category}
        </p>
        <h3 className="text-xl font-semibold leading-snug tracking-tight group-hover:text-orange-600 md:text-2xl">
          {story.title}
        </h3>
        {story.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
            {story.excerpt}
          </p>
        )}
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
          By The Lowe Report · {timeAgo(story.published_at)}
        </p>
      </div>
      <div
        className="flex-shrink-0 bg-cover bg-center bg-gray-200 w-24 h-24 sm:w-48 sm:h-32"
        style={{
          backgroundImage: story.featured_image_url
            ? `url('${story.featured_image_url}')`
            : undefined,
        }}
      />
    </Link>
  );
}

interface Props {
  initialStories: Story[];
  initialHasMore: boolean;
}

export default function LatestStoriesSection({ initialStories, initialHasMore }: Props) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/newsletter/latest?page=${nextPage}`);
      const data = await res.json();
      setStories((prev) => [...prev, ...data.posts]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-16 border-t border-black pt-8">
      <h2 className="mb-8 font-serif text-4xl font-semibold tracking-tight">Latest Stories</h2>
      <div>
        {stories.map((story) => (
          <StoryRow key={story.id} story={story} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="border border-black px-10 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-colors hover:bg-black hover:text-white disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}
