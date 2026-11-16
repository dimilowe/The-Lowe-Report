import { query } from "@/lib/db";

export const POSTS_PER_PAGE = 10;

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  published_at: Date;
  view_count: number;
  categories: { id: number; name: string; slug: string }[];
}

export async function getBlogPosts(categorySlug?: string, page = 1) {
  const params: (string | number)[] = [];
  let filter = `bp.published_at IS NOT NULL AND bp.published_at <= NOW()
    AND (bp.unlisted IS NULL OR bp.unlisted = false)`;
  if (categorySlug) {
    params.push(categorySlug);
    filter += ` AND bp.id IN (
      SELECT bpc.blog_post_id FROM blog_post_categories bpc
      JOIN categories c ON c.id = bpc.category_id WHERE c.slug = $1
    )`;
  }
  const countResult = await query(`SELECT COUNT(*) AS count FROM blog_posts bp WHERE ${filter}`, params);
  const totalCount = Number(countResult.rows[0]?.count || 0);
  const result = await query(`
    SELECT bp.id, bp.title, bp.slug, bp.excerpt, bp.featured_image_url,
      bp.published_at, bp.view_count,
      COALESCE(json_agg(json_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
        ORDER BY c.id) FILTER (WHERE c.id IS NOT NULL), '[]') AS categories
    FROM blog_posts bp
    LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
    LEFT JOIN categories c ON c.id = bpc.category_id
    WHERE ${filter}
    GROUP BY bp.id
    ORDER BY bp.published_at DESC, bp.id DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `, [...params, POSTS_PER_PAGE, (page - 1) * POSTS_PER_PAGE]);
  return {
    posts: result.rows as BlogPost[],
    totalCount,
    totalPages: Math.ceil(totalCount / POSTS_PER_PAGE),
    currentPage: page,
  };
}
