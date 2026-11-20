import { ImageResponse } from 'next/og';
import { BRAND, LOGO_PATHS, LOGO_SPARK } from '@/lib/brand';

/**
 * App icon variants, rendered to PNG at build time:
 *  - any:      rounded gradient tile on a transparent background
 *  - maskable: full-bleed tile with the mark inside the 80% safe zone (Android adaptive icons)
 *  - apple:    full-bleed tile — iOS applies its own rounded mask and doesn't support transparency
 */
export function brandIconResponse(size: number, variant: 'any' | 'maskable' | 'apple' = 'any') {
  const fullBleed = variant !== 'any';
  const tile = fullBleed ? size : Math.round(size * 0.9);
  const glyph = Math.round(size * (variant === 'maskable' ? 0.44 : 0.56));

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <div
          style={{
            width: tile,
            height: tile,
            borderRadius: fullBleed ? 0 : Math.round(size * 0.24),
            backgroundImage: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none">
            {LOGO_PATHS.map((d) => (
              <path key={d} d={d} stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            ))}
            <path d={LOGO_SPARK} fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
