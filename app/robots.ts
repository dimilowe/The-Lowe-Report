import { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/files/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/settings/',
          '/saved/',
          '/workspace/',
          '/workstations/',
          '/login',
          '/signup',
          '/reset-password',
          '/forgot-password',
          '/forgot-username',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
