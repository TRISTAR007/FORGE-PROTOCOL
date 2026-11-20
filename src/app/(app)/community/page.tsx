import type { Metadata } from 'next';
import { CommunityApp } from '@/components/community/community-app';

export const metadata: Metadata = { title: 'Community — Level Up Dojo' };

export default function CommunityPage() {
  return <CommunityApp />;
}
