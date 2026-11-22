import { memo, useId } from 'react';
import type { AvatarConfig } from '@/lib/types';
import { colorOf } from '@/lib/avatar';
import { cn } from '@/lib/utils';

const INK = '#1A1325';

/** Darkens (amount < 0) or lightens (amount > 0) a #RRGGBB color. */
function shade(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.max(0, Math.min(255, Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount)));
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function HairBack({ style, color }: { style: string; color: string }) {
  if (style === 'long')
    return <path d="M34 50 C32 30 46 24 60 24 C74 24 88 30 86 50 L91 98 Q76 102 71 88 L49 88 Q44 102 29 98 Z" fill={color} />;
  if (style === 'ponytail') return <path d="M78 38 C99 42 103 72 93 92 C89 76 87 60 77 50 Z" fill={color} />;
  if (style === 'twin')
    return (
      <>
        <path d="M39 42 C21 48 19 76 27 96 C32 80 34 62 41 51 Z" fill={color} />
        <path d="M81 42 C99 48 101 76 93 96 C88 80 86 62 79 51 Z" fill={color} />
      </>
    );
  return null;
}

function HairFront({ style, color }: { style: string; color: string }) {
  const shine = <path d="M47 33 Q56 29 65 31" stroke="#fff" strokeOpacity={0.3} strokeWidth={2} fill="none" strokeLinecap="round" />;
  const short = (
    <path d="M36 54 C32 30 46 25 60 25 C74 25 88 30 84 54 C80 42 70 40 60 41 C52 41 42 42 36 54 Z" fill={color} />
  );
  switch (style) {
    case 'spiky':
      return (
        <>
          <path d="M36 54 L30 38 L40 40 L37 25 L48 32 L52 17 L60 29 L68 17 L72 32 L83 25 L80 40 L90 38 L84 54 Q80 40 60 39 Q40 40 36 54 Z" fill={color} />
          {shine}
        </>
      );
    case 'wild':
      return (
        <>
          <path d="M34 56 L22 40 L34 38 L26 22 L42 28 L44 12 L56 24 L64 8 L70 24 L82 14 L80 30 L96 26 L88 42 L98 50 L86 56 Q80 40 60 39 Q40 40 34 56 Z" fill={color} />
          {shine}
        </>
      );
    case 'long':
      return (
        <>
          <path d="M36 54 C34 32 46 26 60 26 C74 26 86 32 84 54 C82 44 76 40 70 38 C68 44 62 46 58 40 C54 44 46 46 42 42 C40 46 38 50 36 54 Z" fill={color} />
          {shine}
        </>
      );
    case 'bun':
      return (
        <>
          <circle cx={60} cy={21} r={9} fill={color} />
          {short}
          {shine}
        </>
      );
    case 'buzz':
      return <path d="M38 50 C37 33 48 29 60 29 C72 29 83 33 82 50 C78 41 70 39 60 39 C50 39 42 41 38 50 Z" fill={color} opacity={0.92} />;
    case 'crest':
      return (
        <>
          <path d="M38 50 C37 33 48 29 60 29 C72 29 83 33 82 50 C78 41 70 39 60 39 C50 39 42 41 38 50 Z" fill={color} opacity={0.75} />
          <path d="M50 36 L52 12 L58 24 L62 6 L66 24 L72 14 L70 36 Q60 32 50 36 Z" fill={color} />
        </>
      );
    case 'twin':
      return (
        <>
          {short}
          <circle cx={39} cy={45} r={3.5} fill="#FF4D94" />
          <circle cx={81} cy={45} r={3.5} fill="#FF4D94" />
          {shine}
        </>
      );
    default:
      return (
        <>
          {short}
          {shine}
        </>
      );
  }
}

function Outfit({ id, color, skin }: { id: string; color: string; skin: string }) {
  const body = 'M16 120 C17 100 32 88 60 88 C88 88 103 100 104 120 Z';
  const dark = shade(color, -0.35);
  const light = shade(color, 0.35);
  const gi = (trim: string) => (
    <>
      <path d={body} fill={color} />
      <path d="M50 88 L60 104 L70 88 Z" fill={skin} />
      <path d="M47 89 L60 107 L60 120" stroke={trim} strokeWidth={5} fill="none" />
      <path d="M73 89 L60 107" stroke={trim} strokeWidth={5} fill="none" />
    </>
  );
  switch (id) {
    case 'tank':
      return (
        <>
          <path d={body} fill={skin} />
          <path d="M38 120 L41 97 Q60 106 79 97 L82 120 Z" fill={color} />
          <path d="M43 98 L45 89 M77 98 L75 89" stroke={color} strokeWidth={4} />
        </>
      );
    case 'hoodie':
      return (
        <>
          <path d={body} fill={color} />
          <path d="M40 90 Q60 78 80 90 Q60 99 40 90 Z" fill={dark} />
          <path d="M55 95 L54 108 M65 95 L66 108" stroke={light} strokeWidth={1.8} strokeLinecap="round" />
        </>
      );
    case 'track':
      return (
        <>
          <path d={body} fill={color} />
          <path d="M60 92 L60 120" stroke={light} strokeWidth={1.6} />
          <path d="M50 88 L60 95 L70 88" stroke={light} strokeWidth={3} fill="none" />
          <path d="M24 104 C30 96 38 92 46 91 M96 104 C90 96 82 92 74 91" stroke="#fff" strokeOpacity={0.7} strokeWidth={2.2} fill="none" />
        </>
      );
    case 'raider':
      return (
        <>
          <path d={body} fill={dark} />
          <path d="M30 96 L82 120 M90 96 L38 120" stroke={color} strokeWidth={5} />
          <path d="M50 88 L60 95 L70 88" stroke={light} strokeWidth={3} fill="none" />
        </>
      );
    case 'battle':
      return (
        <>
          {gi(dark)}
          <ellipse cx={28} cy={101} rx={12} ry={7} fill="#374151" />
          <ellipse cx={92} cy={101} rx={12} ry={7} fill="#374151" />
          <path d="M20 99 Q28 95 36 99 M84 99 Q92 95 100 99" stroke="#9CA3AF" strokeWidth={1.5} fill="none" />
        </>
      );
    case 'champion':
      return (
        <>
          {gi('#FFC94A')}
          <path d="M22 106 C30 96 40 92 48 90 M98 106 C90 96 80 92 72 90" stroke="#FFC94A" strokeWidth={2.5} fill="none" />
        </>
      );
    default:
      return gi(light);
  }
}

function Headgear({ id, hairColor }: { id: string; hairColor: string }) {
  switch (id) {
    case 'band':
      return (
        <>
          <path d="M37 44 C45 39 75 39 83 44 L83 49 C75 44 45 44 37 49 Z" fill="#E11D48" />
          <path d="M83 45 L95 40 L92 47 Z M83 47 L94 53 L88 55 Z" fill="#E11D48" />
        </>
      );
    case 'cap':
      return (
        <>
          <path d="M36 46 C36 26 84 26 84 46 Z" fill="#1F2937" />
          <path d="M60 44 C74 42 92 44 98 48 C88 51 70 49 60 47 Z" fill="#111827" />
          <circle cx={60} cy={29} r={2} fill="#FF4D94" />
        </>
      );
    case 'neko':
      return (
        <>
          <path d="M37 38 L39 16 L52 29 Z M83 38 L81 16 L68 29 Z" fill={hairColor} />
          <path d="M41 32 L42 22 L48 29 Z M79 32 L78 22 L72 29 Z" fill="#FF9EC0" />
        </>
      );
    case 'horns':
      return <path d="M43 33 C38 22 40 13 47 9 C45 17 47 24 51 30 Z M77 33 C82 22 80 13 73 9 C75 17 73 24 69 30 Z" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth={1} />;
    case 'crown':
      return <path d="M44 31 L46 18 L53 25 L60 13 L67 25 L74 18 L76 31 Z" fill="#FFC94A" stroke="#B45309" strokeWidth={1.2} />;
    default:
      return null;
  }
}

function Accessory({ id }: { id: string }) {
  switch (id) {
    case 'towel':
      return (
        <>
          <path d="M44 86 C50 94 70 94 76 86 L80 92 C70 102 50 102 40 92 Z" fill="#F1F5F9" />
          <path d="M44 93 L42 114 L51 114 L51 97 Z" fill="#E2E8F0" />
        </>
      );
    case 'scarf':
      return (
        <>
          <path d="M42 84 C50 94 70 94 78 84 L82 92 C70 104 50 104 38 92 Z" fill="#E11D48" />
          <path d="M70 96 L80 119 L89 113 L77 94 Z" fill="#BE123C" />
        </>
      );
    case 'headphones':
      return (
        <>
          <path d="M35 56 C33 22 87 22 85 56" stroke="#111827" strokeWidth={4} fill="none" />
          <rect x={30} y={50} width={9} height={15} rx={3.5} fill="#FF4D94" />
          <rect x={81} y={50} width={9} height={15} rx={3.5} fill="#FF4D94" />
        </>
      );
    case 'medal':
      return (
        <>
          <path d="M53 88 L60 102 L67 88" stroke="#38BDF8" strokeWidth={3.2} fill="none" />
          <circle cx={60} cy={107} r={6.5} fill="#FFC94A" stroke="#B45309" strokeWidth={1.3} />
          <path d="M60 103.5 L61.2 106 L63.8 106.3 L61.8 108 L62.4 110.6 L60 109.2 L57.6 110.6 L58.2 108 L56.2 106.3 L58.8 106 Z" fill="#FFF7D6" />
        </>
      );
    case 'dumbbell':
      return (
        <g transform="rotate(-28 93 92)">
          <rect x={80} y={90} width={26} height={3.5} rx={1.5} fill="#9CA3AF" />
          <rect x={77} y={84.5} width={5} height={14.5} rx={1.5} fill="#374151" />
          <rect x={104} y={84.5} width={5} height={14.5} rx={1.5} fill="#374151" />
        </g>
      );
    default:
      return null;
  }
}

function Aura({ id, gid }: { id: string; gid: string }) {
  if (id === 'none') return null;
  const glow = <circle cx={60} cy={64} r={58} fill={`url(#${gid})`} />;
  switch (id) {
    case 'ember':
      return (
        <>
          {glow}
          <path d="M14 120 C10 100 22 92 18 76 C30 88 32 102 30 120 Z M106 120 C110 100 98 92 102 76 C90 88 88 102 90 120 Z" fill="#FF7A1A" opacity={0.75} />
          <path d="M22 120 C20 108 26 102 25 94 C31 102 31 110 30 120 Z M98 120 C100 108 94 102 95 94 C89 102 89 110 90 120 Z" fill="#FFD84A" opacity={0.8} />
        </>
      );
    case 'frost':
      return (
        <>
          {glow}
          {[
            [20, 36],
            [101, 42],
            [14, 78],
            [107, 84],
          ].map(([x, y]) => (
            <path key={`${x}`} d={`M${x - 5} ${y} H${x + 5} M${x} ${y - 5} V${y + 5} M${x - 3.5} ${y - 3.5} L${x + 3.5} ${y + 3.5} M${x - 3.5} ${y + 3.5} L${x + 3.5} ${y - 3.5}`} stroke="#E0F2FE" strokeWidth={1.4} />
          ))}
        </>
      );
    case 'sakura':
      return (
        <>
          {glow}
          {[
            [18, 34, 30],
            [100, 30, -20],
            [12, 70, 60],
            [108, 66, 10],
            [24, 98, -40],
            [98, 100, 45],
          ].map(([x, y, r]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={4} ry={2} fill="#FBCFE8" transform={`rotate(${r} ${x} ${y})`} />
          ))}
        </>
      );
    case 'storm':
      return (
        <>
          {glow}
          <polyline points="20,26 29,42 22,44 33,62" stroke="#FFD84A" strokeWidth={2.6} fill="none" strokeLinejoin="round" />
          <polyline points="100,30 91,46 98,48 87,66" stroke="#FFD84A" strokeWidth={2.6} fill="none" strokeLinejoin="round" />
        </>
      );
    case 'void':
      return (
        <>
          {glow}
          <circle cx={60} cy={60} r={50} stroke="#8B5CF6" strokeWidth={2} fill="none" opacity={0.7} strokeDasharray="6 5" />
        </>
      );
    case 'solar':
      return (
        <>
          {glow}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={60 + Math.cos(a) * 40}
                y1={60 + Math.sin(a) * 40}
                x2={60 + Math.cos(a) * 58}
                y2={60 + Math.sin(a) * 58}
                stroke="#FFC94A"
                strokeWidth={2}
                opacity={0.55}
              />
            );
          })}
        </>
      );
    default:
      return glow;
  }
}

/**
 * The person's hero avatar — an original chibi bust built from layers.
 * Pure SVG (no images to download) and memoized, so it's cheap to show
 * in the top bar, chat and leaderboards.
 */
export const HeroAvatar = memo(function HeroAvatar({
  avatar,
  size = 96,
  ring,
  className,
  title,
}: {
  avatar: AvatarConfig;
  size?: number;
  /** Rank color for the frame ring. */
  ring?: string;
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const clipId = `hc${uid}`;
  const glowId = `hg${uid}`;
  const skin = colorOf('skin', avatar.skin);
  const skinShade = shade(skin, -0.18);
  const hair = colorOf('hairColor', avatar.hairColor);
  const eye = colorOf('eyes', avatar.eyes);
  const outfit = colorOf('outfitColor', avatar.outfitColor);
  const auraColor = avatar.aura === 'none' ? '#8B5CF6' : colorOf('aura', avatar.aura);

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <clipPath id={clipId}>
          <circle cx={60} cy={60} r={58} />
        </clipPath>
        <radialGradient id={glowId} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor={auraColor} stopOpacity={0.75} />
          <stop offset="70%" stopColor={auraColor} stopOpacity={0.12} />
          <stop offset="100%" stopColor={auraColor} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width={120} height={120} fill="#1B1633" />
        <circle cx={60} cy={60} r={58} fill="#241D45" />
        <Aura id={avatar.aura} gid={glowId} />
        <HairBack style={avatar.hair} color={hair} />
        <Outfit id={avatar.outfit} color={outfit} skin={skin} />
        <rect x={53} y={72} width={14} height={16} fill={skinShade} />
        <circle cx={38} cy={57} r={4.5} fill={skinShade} />
        <circle cx={82} cy={57} r={4.5} fill={skinShade} />
        <ellipse cx={60} cy={54} rx={22} ry={24} fill={skin} />
        {/* Face */}
        <ellipse cx={45} cy={65} rx={4} ry={2} fill="#FF7A9A" opacity={0.35} />
        <ellipse cx={75} cy={65} rx={4} ry={2} fill="#FF7A9A" opacity={0.35} />
        <path d="M45 50 Q51 47 56 49 M64 49 Q69 47 75 50" stroke={shade(hair, -0.2)} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {[51, 69].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={59} rx={3.6} ry={4.6} fill={eye} />
            <ellipse cx={cx} cy={59.6} rx={1.8} ry={2.6} fill={INK} />
            <circle cx={cx + 1.4} cy={57.2} r={1.3} fill="#fff" />
            <circle cx={cx - 1.2} cy={61} r={0.6} fill="#fff" opacity={0.7} />
            <path d={`M${cx - 6} 55 Q${cx} 51 ${cx + 6} 55`} stroke={INK} strokeWidth={2.2} fill="none" strokeLinecap="round" />
          </g>
        ))}
        <path d="M60 62 L59.2 65" stroke={skinShade} strokeWidth={1.2} strokeLinecap="round" />
        <path d="M56 69 Q60 72.5 64 69" stroke="#7A2E3A" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <HairFront style={avatar.hair} color={hair} />
        <Headgear id={avatar.headgear} hairColor={hair} />
        <Accessory id={avatar.accessory} />
      </g>
      {ring ? <circle cx={60} cy={60} r={57.5} fill="none" stroke={ring} strokeWidth={3} /> : null}
    </svg>
  );
});
