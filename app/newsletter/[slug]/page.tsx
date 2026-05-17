import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { AudioPlayer } from "@/components/AudioPlayer";

function isHTML(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

function formatContent(content: string): string {
  if (isHTML(content)) {
    return content;
  }
  // Plain text: convert double newlines to paragraphs, single newlines to <br>
  return content
    .split(/\n\n+/)
    .map((para) => {
      const inner = para.trim().replace(/\n/g, '<br />');
      return inner ? `<p>${inner}</p>` : '';
    })
    .filter(Boolean)
    .join('\n');
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  meta_description: string | null;
  featured_image_url: string | null;
  published_at: Date;
  view_count: number;
  is_indexed: boolean;
}

interface RecommendedProduct {
  id: number;
  slug: string;
  name: string;
  thumbnail_url: string | null;
  price_type: string | null;
  price: number | null;
}

async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const result = await query(
    `SELECT id, title, slug, content, excerpt, meta_description, featured_image_url, published_at, view_count, is_indexed
     FROM blog_posts
     WHERE slug = $1 AND published_at IS NOT NULL AND published_at <= NOW()
     LIMIT 1`,
    [slug]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function incrementViewCount(postId: number): Promise<void> {
  await query(
    `UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1`,
    [postId]
  );
}

async function getRelatedPosts(currentPostId: number): Promise<BlogPost[]> {
  const result = await query(
    `SELECT id, title, slug, excerpt, featured_image_url, published_at
     FROM blog_posts
     WHERE id != $1 AND published_at IS NOT NULL AND published_at <= NOW()
     ORDER BY published_at DESC
     LIMIT 3`,
    [currentPostId]
  );
  return result.rows;
}

async function getRecommendedProducts(): Promise<RecommendedProduct[]> {
  const result = await query(
    `SELECT id, slug, name, thumbnail_url, price_type, price
     FROM products
     WHERE visibility = 'public'
       AND type != 'invisible'
     ORDER BY created_at DESC
     LIMIT 3`
  );
  return result.rows;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | The Lowe Report`,
    description: post.meta_description || post.excerpt || post.title,
    robots: post.is_indexed
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: post.title,
      description: post.meta_description || post.excerpt || post.title,
      type: "article",
      publishedTime: post.published_at.toISOString(),
      images: post.featured_image_url ? [post.featured_image_url] : [],
      siteName: "The Lowe Report",
    },
  };
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ProductPrice({ product }: { product: RecommendedProduct }) {
  if (product.price_type === "free") return <span>Free</span>;
  if (!product.price) return null;
  return <span>${(product.price / 100).toFixed(2)}</span>;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  await incrementViewCount(post.id);

  const relatedPosts = await getRelatedPosts(post.id);
  const recommendedProducts = await getRecommendedProducts();

  return (
    <article className="bg-white text-black">
      <header className="mx-auto max-w-5xl px-4 py-12 text-center md:px-6 md:py-16">
        <Link
          href="/newsletter"
          className="mb-8 inline-flex text-xs font-semibold uppercase tracking-[0.22em] text-gray-500 transition-colors hover:text-orange-600"
        >
          Articles
        </Link>

        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-black">
          The Lowe Report
        </p>
        <h1 className="mx-auto max-w-4xl font-serif text-5xl font-semibold leading-none tracking-tight md:text-7xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
            {post.excerpt}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          <span>By The Lowe Report</span>
          <span>{formatDate(post.published_at)}</span>
          <span>{post.view_count} views</span>
        </div>
      </header>

      {post.featured_image_url && (
        <figure className="mx-auto max-w-7xl px-4 md:px-6">
          <div
            className="aspect-[16/9] w-full bg-gray-200 bg-cover bg-center md:aspect-[21/9]"
            style={{ backgroundImage: `url('${post.featured_image_url}')` }}
          />
        </figure>
      )}

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 md:px-6 lg:grid-cols-[1fr_720px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-28 border-t border-black pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black">Filed Under</p>
            <p className="mt-3 text-sm leading-6 text-gray-600">Culture, style, media, and the business of modern influence.</p>
          </div>
        </aside>

        <main>
          <AudioPlayer postId={post.id} />

          <div
            className="prose prose-xl mt-10 max-w-none
              prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-black
              prose-h2:mt-12 prose-h2:text-4xl
              prose-h3:mt-10 prose-h3:text-2xl
              prose-p:my-7 prose-p:text-[1.2rem] prose-p:leading-9 prose-p:text-gray-800
              prose-a:text-black prose-a:underline prose-a:decoration-gray-300 prose-a:underline-offset-4 hover:prose-a:text-orange-600
              prose-strong:text-black
              prose-blockquote:border-l-black prose-blockquote:text-gray-700
              prose-img:my-10 prose-img:w-full prose-img:rounded-none
              prose-li:text-gray-800"
            dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
          />
        </main>

        <aside className="hidden lg:block">
          {recommendedProducts.length > 0 && (
            <div className="sticky top-28 border-t border-black pt-5">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-black">Recommended Products</p>
              <div className="space-y-5">
                {recommendedProducts.map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`} className="group block border-b border-gray-200 pb-5">
                    <h3 className="text-lg font-semibold leading-tight group-hover:text-orange-600">{product.name}</h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                      <ProductPrice product={product} />
                    </p>
                  </Link>
                ))}
              </div>
              <Link href="/store" className="mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-black underline underline-offset-4 hover:text-orange-600">
                Browse Products
              </Link>
            </div>
          )}
        </aside>
      </div>

      {(relatedPosts.length > 0 || recommendedProducts.length > 0) && (
        <section className="border-t border-black">
          <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
            {relatedPosts.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Recommended Articles</p>
                <div className="mt-6 grid gap-8 md:grid-cols-3">
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} href={`/newsletter/${relatedPost.slug}`} className="group block border-t border-gray-200 pt-5">
                      {relatedPost.featured_image_url && (
                        <div
                          className="mb-5 aspect-[4/3] bg-gray-200 bg-cover bg-center"
                          style={{ backgroundImage: `url('${relatedPost.featured_image_url}')` }}
                        />
                      )}
                      <h2 className="text-2xl font-semibold leading-tight tracking-tight group-hover:text-orange-600">
                        {relatedPost.title}
                      </h2>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                        {formatDate(relatedPost.published_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              </>
            )}

            {recommendedProducts.length > 0 && (
              <div className="mt-12 border-t border-gray-200 pt-8 lg:hidden">
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Recommended Products</p>
                <div className="grid gap-5 sm:grid-cols-3">
                  {recommendedProducts.map((product) => (
                    <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                      <h3 className="text-lg font-semibold leading-tight group-hover:text-orange-600">{product.name}</h3>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                        <ProductPrice product={product} />
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </article>
  );
}
