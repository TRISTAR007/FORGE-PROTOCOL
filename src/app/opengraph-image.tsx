import { ImageResponse } from 'next/og';
import { BRAND, FLAME_PATH } from '@/lib/brand';

export const alt = 'FORGE Protocol — 365 days of home bodyweight training';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          backgroundColor: BRAND.bg,
          backgroundImage: 'radial-gradient(circle at 85% 0%, rgba(255,106,43,0.35), rgba(19,20,23,0) 55%)',
          color: BRAND.ink,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: BRAND.forge,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={BRAND.bg} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d={FLAME_PATH} />
            </svg>
          </div>
          <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>FORGE PROTOCOL</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 28, color: BRAND.brass, letterSpacing: 6, fontWeight: 700 }}>
            365 DAYS · NO GYM REQUIRED
          </span>
          <span style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, marginTop: 16 }}>
            Forge a new body, one day at a time.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 16, fontSize: 26, color: BRAND.muted }}>
          <span>Guided workouts</span>
          <span style={{ color: BRAND.forge }}>·</span>
          <span>Budget nutrition</span>
          <span style={{ color: BRAND.forge }}>·</span>
          <span>Progress tracking</span>
        </div>
      </div>
    ),
    size
  );
}
