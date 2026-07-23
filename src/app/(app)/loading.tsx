import { Skeleton } from '@/components/ui/spinner';

// This is the only loading.tsx in the (app) route group. Every page here is
// a client component reading from context that's already resolved by the
// layout above, so this boundary fires once — on first entry into ANY app
// route (a deep link, a hard refresh, or straight after login) — not per
// page. It stays deliberately generic rather than dashboard-shaped so it
// doesn't visually misrepresent whichever page is actually about to load.
export default function AppLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48 rounded-sm" />
      <Skeleton className="h-32 w-full rounded-md" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Skeleton className="h-20 rounded-md" />
        <Skeleton className="h-20 rounded-md" />
        <Skeleton className="h-20 rounded-md" />
      </div>
      <Skeleton className="h-40 w-full rounded-md" />
    </div>
  );
}
