import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const result = await query(
      `SELECT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image_url,
        bp.published_at,
        bp.view_count,
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
       GROUP BY bp.id
       ORDER BY bp.published_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) as total FROM blog_posts
       WHERE published_at IS NOT NULL AND published_at <= NOW()
         AND (unlisted IS NULL OR unlisted = false)`
    );
    const total = parseInt(countResult.rows[0]?.total || "0");

    return NextResponse.json({
      posts: result.rows,
      total,
      page,
      hasMore: offset + result.rows.length < total,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load stories" }, { status: 500 });
  }
}
