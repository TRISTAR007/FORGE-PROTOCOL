import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { APP_NAME_UPPER, BRAND, LOGO_PATHS, LOGO_SPARK } from '@/lib/brand';

export const alt = 'Level Up Dojo — free anime-style workouts, coaches and community';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

async function coachDataUri(id: string) {
  const file = await readFile(join(process.cwd(), 'src/assets/og', `${id}.png`));
  return `data:image/png;base64,${file.toString('base64')}`;
}

export default async function OpengraphImage() {
  const coaches = await Promise.all(['kaito', 'mika', 'zara', 'ryu'].map(coachDataUri));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          backgroundColor: BRAND.bg,
          backgroundImage:
            'radial-gradient(circle at 85% 10%, rgba(139,92,246,0.45), rgba(12,10,29,0) 55%), radial-gradient(circle at 10% 100%, rgba(255,77,148,0.35), rgba(12,10,29,0) 50%)',
          color: BRAND.ink,
          padding: 64,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 640 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 18,
                backgroundImage: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.violet})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width={42} height={42} viewBox="0 0 24 24" fill="none">
                {LOGO_PATHS.map((d) => (
                  <path key={d} d={d} stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                ))}
                <path d={LOGO_SPARK} fill="#FFF" />
              </svg>
            </div>
            <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: 2 }}>{APP_NAME_UPPER}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 26, color: BRAND.gold, letterSpacing: 5, fontWeight: 700 }}>
              FREE · ANIME COACHES · COMMUNITY
            </span>
            <span style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.04, marginTop: 14 }}>
              Start your real-life training arc.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 14, fontSize: 24, color: BRAND.muted }}>
            <span>130+ workouts</span>
            <span style={{ color: BRAND.primary }}>✦</span>
            <span>Home or gym</span>
            <span style={{ color: BRAND.primary }}>✦</span>
            <span>12 languages</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', width: 440, gap: 16, alignContent: 'center', marginLeft: 32 }}>
          {coaches.map((src, i) => (
            <div
              key={i}
              style={{
                width: 210,
                height: 210,
                borderRadius: 28,
                overflow: 'hidden',
                display: 'flex',
                border: `3px solid ${i % 2 === 0 ? BRAND.primary : BRAND.violet}`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
              <img src={src} width={210} height={210} alt="" style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
