import { type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

function StatCard({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-ink-faint">
        <Icon size={15} />
        <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl tracking-wide">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-ink-faint">{sub}</p> : null}
    </Card>
  );
}

export { StatCard };
