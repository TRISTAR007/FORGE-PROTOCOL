import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FORGE Protocol',
    short_name: 'FORGE',
    description: 'A 365-day home bodyweight training, nutrition and habit tracker.',
    id: '/dashboard',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#131417',
    theme_color: '#131417',
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: "Start today's workout", short_name: 'Workout', url: '/workout?start=1' },
      { name: 'Progress', url: '/progress' },
      { name: 'Nutrition', url: '/nutrition' },
    ],
  };
}
