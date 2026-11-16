import { NextRequest, NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/newsletter-feed";
import type { BriefingPost } from "@/lib/briefing-types";

export async function GET(request: NextRequest) {
  const rawPage = request.nextUrl.searchParams.get("page") || "1";
  const page = Number(rawPage);
  const category = request.nextUrl.searchParams.get("category") || undefined;
  if (!/^\d+$/.test(rawPage) || !Number.isSafeInteger(page) || page < 1 || page > 10000 || (category && category.length > 200)) {
    return NextResponse.json({ error: "Invalid article page." }, { status: 400 });
  }
  try {
    const result = await getBlogPosts(category, page);
    const posts: BriefingPost[] = result.posts.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      featured_image_url: post.featured_image_url,
      eyebrow: post.categories?.[0]?.name || "Culture",
      href: `/newsletter/${post.slug}`,
    }));
    return NextResponse.json({
      posts,
      nextPage: page < result.totalPages ? page + 1 : null,
    });
  } catch {
    return NextResponse.json({ error: "Unable to load articles right now." }, { status: 500 });
  }
}
