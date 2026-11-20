import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/signup'],
      // Signed-in app pages are private and redirect to /login anyway.
      disallow: ['/dashboard', '/workout', '/exercises', '/nutrition', '/progress', '/resources', '/settings', '/auth/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
