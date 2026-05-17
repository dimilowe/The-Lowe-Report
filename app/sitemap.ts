import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { query } from '@/lib/db';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/newsletter`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Published blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const result = await query(
      `SELECT slug, published_at, updated_at
       FROM blog_posts
       WHERE published_at IS NOT NULL AND published_at <= NOW()
         AND (unlisted IS NULL OR unlisted = false)
       ORDER BY published_at DESC`
    );
    blogPages = result.rows.map((post) => ({
      url: `${baseUrl}/newsletter/${post.slug}`,
      lastModified: post.updated_at ?? post.published_at,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    // non-fatal: sitemap still returns static pages
  }

  return [...staticPages, ...blogPages];
}
