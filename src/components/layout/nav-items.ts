import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Dumbbell,
  Home,
  LineChart,
  MessagesSquare,
  ScrollText,
  Settings,
  Sparkles,
  UtensilsCrossed,
  Zap,
} from 'lucide-react';

export interface NavItem {
  href: string;
  /** Message key under `nav.` */
  key: 'dashboard' | 'workout' | 'train' | 'community' | 'exercises' | 'nutrition' | 'progress' | 'coaches' | 'resources' | 'settings';
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', key: 'dashboard', icon: Home },
  { href: '/workout', key: 'workout', icon: Dumbbell },
  { href: '/train', key: 'train', icon: Zap },
  { href: '/community', key: 'community', icon: MessagesSquare },
  { href: '/exercises', key: 'exercises', icon: BookOpen },
  { href: '/progress', key: 'progress', icon: LineChart },
  { href: '/nutrition', key: 'nutrition', icon: UtensilsCrossed },
  { href: '/coaches', key: 'coaches', icon: Sparkles },
  { href: '/resources', key: 'resources', icon: ScrollText },
  { href: '/settings', key: 'settings', icon: Settings },
];

/** The 4 primary items in the mobile bottom tab bar; everything else lives in "More". */
export const MOBILE_PRIMARY = NAV_ITEMS.slice(0, 4);
export const MOBILE_MORE = NAV_ITEMS.slice(4);

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}
