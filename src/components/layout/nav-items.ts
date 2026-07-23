import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Dumbbell, BookOpen, UtensilsCrossed, LineChart, Sparkles, Settings } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workout', label: 'Workout', icon: Dumbbell },
  { href: '/exercises', label: 'Exercises', icon: BookOpen },
  { href: '/nutrition', label: 'Nutrition', icon: UtensilsCrossed },
  { href: '/progress', label: 'Progress', icon: LineChart },
  { href: '/resources', label: 'Resources', icon: Sparkles },
  { href: '/settings', label: 'Settings', icon: Settings },
];

/** The 4 primary items shown in the mobile bottom tab bar; everything else lives in "More". */
export const MOBILE_PRIMARY = NAV_ITEMS.slice(0, 4);
export const MOBILE_MORE = NAV_ITEMS.slice(4);
