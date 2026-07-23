'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  RESOURCE_TABS,
  POSTURE_ISSUES,
  POSTURE_HABITS,
  MOBILITY_ROUTINES,
  SLEEP_PROTOCOL,
  RECOVERY_TECHNIQUES,
  PROGRESSIVE_OVERLOAD,
  HYPERTROPHY_FACTORS,
  SKIN_ROUTINE,
  SKIN_TRUTHS,
} from '@/lib/program/resources';

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent>
        <h3 className="font-display text-lg tracking-wide">{title}</h3>
        <div className="mt-3">{children}</div>
      </CardContent>
    </Card>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm text-ink-muted">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-forge" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ResourcesPage() {
  const [tab, setTab] = useState(RESOURCE_TABS[0].id);

  return (
    <div className="animate-fadeIn space-y-5">
      <div>
        <h1 className="font-display text-3xl tracking-wide">Resources</h1>
        <p className="mt-1 text-ink-muted">Everything outside the workout that makes the workout work.</p>
      </div>

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {RESOURCE_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t.id ? 'border-forge bg-forge-dim text-forge' : 'border-line bg-surface text-ink-muted hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'posture' && (
        <div className="space-y-4">
          <Block title="Common Posture Issues">
            <div className="space-y-4">
              {POSTURE_ISSUES.map((issue) => (
                <div key={issue.name} className="border-l-2 border-forge/40 pl-3">
                  <p className="font-semibold text-ink">{issue.name}</p>
                  <p className="mt-1 text-sm text-ink-muted">Cause: {issue.cause}</p>
                  <p className="text-sm text-ink-muted">Fix: {issue.fix}</p>
                  <p className="mt-1 font-mono text-xs text-brass">{issue.daily}</p>
                </div>
              ))}
            </div>
          </Block>
          <Block title="Daily Posture Habits">
            <BulletList items={POSTURE_HABITS} />
          </Block>
        </div>
      )}

      {tab === 'mobility' && (
        <div className="space-y-4">
          {MOBILITY_ROUTINES.map((routine) => (
            <Block key={routine.title} title={`${routine.title} · ${routine.duration}`}>
              <BulletList items={routine.steps} />
            </Block>
          ))}
        </div>
      )}

      {tab === 'recovery' && (
        <div className="space-y-4">
          <Block title="Sleep Protocol">
            <BulletList items={SLEEP_PROTOCOL} />
          </Block>
          <Block title="Recovery Techniques">
            <div className="space-y-3">
              {RECOVERY_TECHNIQUES.map((t) => (
                <div key={t.name}>
                  <p className="font-semibold text-ink">{t.name}</p>
                  <p className="text-sm text-ink-muted">{t.fix}</p>
                </div>
              ))}
            </div>
          </Block>
        </div>
      )}

      {tab === 'science' && (
        <div className="space-y-4">
          <Block title="Progressive Overload">
            <BulletList items={PROGRESSIVE_OVERLOAD} />
          </Block>
          <Block title="Why Muscle Grows">
            <div className="space-y-3">
              {HYPERTROPHY_FACTORS.map((f) => (
                <div key={f.name}>
                  <p className="font-semibold text-ink">{f.name}</p>
                  <p className="text-sm text-ink-muted">{f.fix}</p>
                </div>
              ))}
            </div>
          </Block>
        </div>
      )}

      {tab === 'skin' && (
        <div className="space-y-4">
          <Block title="The Routine">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SKIN_ROUTINE.map((r) => (
                <div key={r.time} className="rounded-sm border border-line bg-bg p-3">
                  <p className="font-mono text-xs uppercase tracking-wider text-brass">{r.time}</p>
                  <p className="mt-1 text-sm text-ink-muted">{r.text}</p>
                </div>
              ))}
            </div>
          </Block>
          <Block title="What Actually Works">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SKIN_TRUTHS.map((t) => (
                <div key={t.text} className="rounded-sm border border-line bg-bg p-3 text-center">
                  <span className="text-xl">{t.icon}</span>
                  <p className="mt-1.5 text-xs text-ink-muted">{t.text}</p>
                </div>
              ))}
            </div>
          </Block>
        </div>
      )}
    </div>
  );
}
