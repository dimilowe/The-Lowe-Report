import { query } from "@/lib/db";
import Link from "next/link";
import { Metadata } from "next";

export const revalidate = 60;

const POSTS_PER_PAGE = 10;

export const metadata: Metadata = {
  title: "The Lowe Report",
  description: "Read the latest reporting, interviews, culture, style, and creator business coverage from The Lowe Report.",
  openGraph: {
    title: "The Lowe Report",
    description: "Read the latest reporting, interviews, culture, style, and creator business coverage.",
    type: "website",
  },
};

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  published_at: Date;
  view_count: number;
  categories: { id: number; name: string; slug: string }[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  post_count: number;
}

interface PaginatedResult {
  posts: BlogPost[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

type DisplayPost = BlogPost & {
  eyebrow: string;
  byline: string;
  href: string | null;
};

const fallbackPosts: DisplayPost[] = [
  {
    id: -1,
    title: "The New Rules of Culture, Style, and Creator Business",
    slug: "coming-soon-culture-style-creator-business",
    excerpt: "The Lowe Report is building an editorial home for modern taste, ambition, and the business of influence.",
    featured_image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1600",
    published_at: new Date(),
    view_count: 0,
    categories: [],
    eyebrow: "Editor's Letter",
    byline: "By The Lowe Report",
    href: null,
  },
  {
    id: -2,
    title: "What Personal Style Looks Like When Everyone Has a Camera",
    slug: "coming-soon-personal-style",
    excerpt: "A sharper look at taste, image, and why the best-dressed people online still feel specific.",
    featured_image_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200",
    published_at: new Date(),
    view_count: 0,
    categories: [],
    eyebrow: "Style",
    byline: "By The Lowe Report",
    href: null,
  },
  {
    id: -3,
    title: "Inside the Creator Economy's Next Status Symbols",
    slug: "coming-soon-creator-economy",
    excerpt: "The new markers of taste are not just what you wear, but what you build, own, and publish.",
    featured_image_url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200",
    published_at: new Date(),
    view_count: 0,
    categories: [],
    eyebrow: "Business",
    byline: "By The Lowe Report",
    href: null,
  },
  {
    id: -4,
    title: "Why the Best Media Brands Feel Like Worlds",
    slug: "coming-soon-media-worlds",
    excerpt: "A media site is more than articles. It is a point of view with rhythm, taste, and repeatable rituals.",
    featured_image_url: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=800",
    published_at: new Date(),
    view_count: 0,
    categories: [],
    eyebrow: "Media",
    byline: "By The Lowe Report",
    href: null,
  },
  {
    id: -5,
    title: "The Return of Editorial Authority",
    slug: "coming-soon-editorial-authority",
    excerpt: "Curation matters again when everyone can publish everything.",
    featured_image_url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800",
    published_at: new Date(),
    view_count: 0,
    categories: [],
    eyebrow: "Opinion",
    byline: "By The Lowe Report",
    href: null,
  },
  {
    id: -6,
    title: "How Taste Travels From Street to Screen",
    slug: "coming-soon-taste-travels",
    excerpt: "The fastest signals in fashion, music, and culture now move through feeds before institutions catch up.",
    featured_image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800",
    published_at: new Date(),
    view_count: 0,
    categories: [],
    eyebrow: "Culture",
    byline: "By The Lowe Report",
    href: null,
  },
];

async function getBlogPosts(categorySlug?: string, page: number = 1): Promise<PaginatedResult> {
  const offset = (page - 1) * POSTS_PER_PAGE;

  let countSql = `
    SELECT COUNT(DISTINCT bp.id) as count
    FROM blog_posts bp
    LEFT JOIN blog_post_categories bpc ON bp.id = bpc.blog_post_id
    WHERE bp.published_at IS NOT NULL AND bp.published_at <= NOW() AND (bp.unlisted IS NULL OR bp.unlisted = false)
  `;

  let sql = `
    SELECT
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
    WHERE bp.published_at IS NOT NULL AND bp.published_at <= NOW() AND (bp.unlisted IS NULL OR bp.unlisted = false)
  `;

  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (categorySlug) {
    const categoryFilter = ` AND bp.id IN (
      SELECT blog_post_id FROM blog_post_categories
      WHERE category_id = (SELECT id FROM categories WHERE slug = $${paramIndex})
    )`;
    sql += categoryFilter;
    countSql += categoryFilter;
    params.push(categorySlug);
    paramIndex++;
  }

  sql += `
    GROUP BY bp.id
    ORDER BY bp.published_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const countResult = await query(countSql, categorySlug ? [categorySlug] : []);
  const totalCount = parseInt(countResult.rows[0]?.count || "0");
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);

  const result = await query(sql, [...params, POSTS_PER_PAGE, offset]);

  return {
    posts: result.rows,
    totalCount,
    totalPages,
    currentPage: page,
  };
}

async function getCategories(): Promise<Category[]> {
  const result = await query(
    `SELECT
      c.id,
      c.name,
      c.slug,
      COUNT(bpc.blog_post_id) as post_count
     FROM categories c
     LEFT JOIN blog_post_categories bpc ON c.id = bpc.category_id
     LEFT JOIN blog_posts bp ON bpc.blog_post_id = bp.id
       AND bp.published_at IS NOT NULL
       AND bp.published_at <= NOW()
       AND (bp.unlisted IS NULL OR bp.unlisted = false)
     GROUP BY c.id
     HAVING COUNT(bpc.blog_post_id) > 0
     ORDER BY c.name ASC`,
    []
  );
  return result.rows;
}

function toDisplayPost(post: BlogPost): DisplayPost {
  const primaryCategory = post.categories?.[0]?.name || "Culture";

  return {
    ...post,
    eyebrow: primaryCategory,
    byline: "By The Lowe Report",
    href: `/newsletter/${post.slug}`,
  };
}

function StoryLink({
  post,
  className,
  children,
}: {
  post: DisplayPost;
  className?: string;
  children: React.ReactNode;
}) {
  if (!post.href) {
    return <article className={className}>{children}</article>;
  }

  return (
    <Link href={post.href} className={className}>
      {children}
    </Link>
  );
}

function StoryImage({ post, className }: { post: DisplayPost; className: string }) {
  return (
    <div
      className={`bg-cover bg-center bg-gray-200 ${className}`}
      style={{
        backgroundImage: post.featured_image_url ? `url('${post.featured_image_url}')` : undefined,
      }}
    />
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-black">
      {children}
    </p>
  );
}

function Byline({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-black">
      {children}
    </p>
  );
}

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1"));
  const { posts, totalPages } = await getBlogPosts(category, currentPage);
  const categories = await getCategories();
  const displayPosts = posts.length > 0 ? posts.map(toDisplayPost) : fallbackPosts;
  const leadPost = displayPosts[0];
  const leftPosts = displayPosts.slice(1, 3);
  const railPosts = displayPosts.slice(3, 8);
  const belowPosts = displayPosts.slice(1);
  const categoryNav = categories.length > 0
    ? categories
    : [
        { id: -1, name: "Style", slug: "style", post_count: 0 },
        { id: -2, name: "Culture", slug: "culture", post_count: 0 },
        { id: -3, name: "Business", slug: "business", post_count: 0 },
        { id: -4, name: "Media", slug: "media", post_count: 0 },
      ];

  return (
    <div className="bg-white text-black">
      <section className="border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-700">
            {categoryNav.map((cat) => (
              <Link
                key={cat.id}
                href={cat.post_count > 0 ? `/newsletter?category=${cat.slug}` : "/newsletter"}
                className={category === cat.slug ? "text-orange-600" : "hover:text-orange-600"}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-16">
        <div className={`grid gap-10 lg:gap-8 ${railPosts.length > 0 ? 'lg:grid-cols-[0.95fr_2fr_0.95fr]' : 'lg:grid-cols-[0.95fr_2fr]'}`}>
          {/* Left sidebar — appears second on mobile via order */}
          <div className="order-2 space-y-10 lg:order-1">
            {leftPosts.map((post) => (
              <StoryLink key={post.id} post={post} className="group block text-center">
                <StoryImage post={post} className="mb-5 aspect-[4/5] w-full" />
                <Eyebrow>{post.eyebrow}</Eyebrow>
                <h2 className="text-2xl font-semibold leading-tight tracking-tight group-hover:text-orange-600">
                  {post.title}
                </h2>
                <Byline>{post.byline}</Byline>
              </StoryLink>
            ))}
          </div>

          {/* Center feature — appears first on mobile via order */}
          <StoryLink post={leadPost} className="group order-1 block lg:order-2">
            <StoryImage post={leadPost} className="aspect-[4/5] w-full md:aspect-[5/4] lg:aspect-[4/5]" />
            <div className="mx-auto max-w-3xl pt-6 text-center">
              <Eyebrow>{leadPost.eyebrow}</Eyebrow>
              <h1 className="font-serif text-4xl font-semibold leading-none tracking-tight group-hover:text-orange-600 md:text-6xl">
                {leadPost.title}
              </h1>
              {leadPost.excerpt && (
                <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                  {leadPost.excerpt}
                </p>
              )}
              <Byline>{leadPost.byline}</Byline>
            </div>
          </StoryLink>

          {/* Right rail — only rendered when there are enough posts */}
          {railPosts.length > 0 && (
            <aside className="order-3 space-y-8 lg:order-3">
              {railPosts.map((post) => (
                <StoryLink key={post.id} post={post} className="group grid grid-cols-[1fr_88px] gap-5 border-b border-gray-200 pb-8">
                  <div>
                    <Eyebrow>{post.eyebrow}</Eyebrow>
                    <h2 className="text-xl font-semibold leading-tight tracking-tight group-hover:text-orange-600">
                      {post.title}
                    </h2>
                    <Byline>{post.byline}</Byline>
                  </div>
                  <StoryImage post={post} className="aspect-[4/5] w-full" />
                </StoryLink>
              ))}
            </aside>
          )}
        </div>

        <section className="mt-16 border-t border-black pt-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Latest</p>
              <h2 className="mt-2 font-serif text-4xl font-semibold tracking-tight">The Briefing</h2>
            </div>
            {totalPages > 1 && (
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {belowPosts.slice(0, 6).map((post) => (
              <StoryLink key={`briefing-${post.id}`} post={post} className="group block border-t border-gray-200 pt-5">
                <Eyebrow>{post.eyebrow}</Eyebrow>
                <h3 className="text-2xl font-semibold leading-tight tracking-tight group-hover:text-orange-600">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{post.excerpt}</p>
                )}
              </StoryLink>
            ))}
          </div>
        </section>

        {posts.length === 0 && (
          <div className="mt-12 border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
            The local development database is ready, but no published articles have been added yet.
          </div>
        )}
      </main>
    </div>
  );
}
