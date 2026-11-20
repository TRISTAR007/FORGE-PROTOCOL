/** Single source for the product name, so a future rename is one edit. */
export const APP_NAME = 'Level Up Dojo';
export const APP_NAME_UPPER = 'LEVEL UP DOJO';
export const APP_SHORT_NAME = 'Dojo';
export const APP_TAGLINE = 'Your real-life training arc';

/**
 * The Level Up Dojo mark: two stacked "level up" chevrons and a spark,
 * drawn on a 24×24 viewBox with round 3px strokes. Reused by the in-app
 * logo, generated app icons, the OG image and share cards.
 */
export const LOGO_PATHS = ['M5 13.5 12 6.5l7 7', 'M5 19.5l7-7 7 7'];
export const LOGO_SPARK = 'M19 2.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z';

export const BRAND = {
  bg: '#0C0A1D',
  surface: '#16122E',
  surfaceRaised: '#1E1940',
  line: '#2E2758',
  ink: '#F6F2FF',
  muted: '#BDB5E0',
  faint: '#9C94C6',
  primary: '#FF4D94',
  violet: '#8B5CF6',
  gold: '#FFC94A',
  aqua: '#3DE3F5',
  ok: '#4ADE80',
};

/** CSS gradient used on the logo tile and primary hero accents. */
export const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.violet} 100%)`;
