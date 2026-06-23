import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const result = await query(
      `SELECT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image_url,
        bp.published_at,
        COALESCE(
          json_agg(
            json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as categories
       FROM blog_posts bp
       LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
       LEFT JOIN categories c ON bpc.category_id = c.id
       WHERE bp.published_at IS NOT NULL AND bp.published_at <= NOW()
         AND (bp.unlisted IS NULL OR bp.unlisted = false)
         AND (
           bp.title ILIKE $1
           OR bp.excerpt ILIKE $1
           OR bp.content ILIKE $1
         )
       GROUP BY bp.id
       ORDER BY
         CASE WHEN bp.title ILIKE $1 THEN 0 ELSE 1 END,
         bp.published_at DESC
       LIMIT 8`,
      [`%${q}%`]
    );

    return NextResponse.json({ results: result.rows });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
