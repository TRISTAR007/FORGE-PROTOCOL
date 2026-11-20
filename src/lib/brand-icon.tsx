import { ImageResponse } from 'next/og';
import { BRAND, FLAME_PATH } from '@/lib/brand';

/**
 * App icon variants, rendered to PNG at build time:
 *  - any:      rounded orange tile on a transparent background
 *  - maskable: full-bleed tile with the flame inside the 80% safe zone (Android adaptive icons)
 *  - apple:    full-bleed tile — iOS applies its own rounded mask and doesn't support transparency
 */
export function brandIconResponse(size: number, variant: 'any' | 'maskable' | 'apple' = 'any') {
  const fullBleed = variant !== 'any';
  const tile = fullBleed ? size : Math.round(size * 0.9);
  const glyph = Math.round(size * (variant === 'maskable' ? 0.46 : 0.56));

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
            borderRadius: fullBleed ? 0 : Math.round(size * 0.22),
            background: BRAND.forge,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width={glyph}
            height={glyph}
            viewBox="0 0 24 24"
            fill="none"
            stroke={BRAND.bg}
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={FLAME_PATH} />
          </svg>
        </div>
      </div>
    ),
    { width: size, height: size }
  );
}
