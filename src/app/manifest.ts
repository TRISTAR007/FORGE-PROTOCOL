import type { MetadataRoute } from 'next';
import { APP_NAME } from '@/lib/brand';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: 'Dojo',
    description: 'Free anime-style workouts with original coaches, voice guidance, XP, belts and a worldwide community.',
    id: '/dashboard',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0C0A1D',
    theme_color: '#0C0A1D',
    categories: ['health', 'fitness', 'lifestyle', 'social'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: "Start today's workout", short_name: 'Workout', url: '/workout?start=1' },
      { name: 'Quick workouts', short_name: 'Train', url: '/train' },
      { name: 'Community', url: '/community' },
      { name: 'Progress', url: '/progress' },
    ],
  };
}
