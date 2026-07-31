import { useTheme } from 'styled-components';

/**
 * Hand-rolled SVG illustrations, drawn from theme colours so they always match
 * the rest of the page. They exist so that "nothing here yet" and "that didn't
 * work" feel like part of the product rather than a failure screen.
 */

interface IllustrationProps {
  readonly size?: number;
}

/** An open book with a small sprout — used wherever a list is empty. */
export function EmptyShelfIllustration({ size = 148 }: IllustrationProps): JSX.Element {
  const theme = useTheme();
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 200 156" role="img" aria-label="An open book with a small sprout growing from it">
      <ellipse cx="100" cy="140" rx="72" ry="10" fill={theme.colors.surfaceSunken} />
      <path d="M18 52 Q100 34 182 52 L182 122 Q100 106 18 122 Z" fill={theme.colors.surface} stroke={theme.colors.borderStrong} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 41 L100 113" stroke={theme.colors.borderStrong} strokeWidth="3" strokeLinecap="round" />
      <path d="M34 68 Q66 60 88 66" stroke={theme.colors.surfaceSunken} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M34 84 Q62 77 80 82" stroke={theme.colors.surfaceSunken} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M112 66 Q136 60 166 68" stroke={theme.colors.surfaceSunken} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M120 82 Q142 77 160 84" stroke={theme.colors.surfaceSunken} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M100 41 L100 18" stroke={theme.colors.secondary} strokeWidth="4" strokeLinecap="round" />
      <path d="M100 28 Q84 24 80 10 Q98 8 100 28 Z" fill={theme.colors.secondarySoft} stroke={theme.colors.secondary} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M100 34 Q118 30 124 16 Q104 14 100 34 Z" fill={theme.colors.primarySoft} stroke={theme.colors.primary} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

/** A magnifying glass over a blank card — used when a search returns nothing. */
export function NoResultsIllustration({ size = 148 }: IllustrationProps): JSX.Element {
  const theme = useTheme();
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 200 156" role="img" aria-label="A magnifying glass over an empty card">
      <ellipse cx="100" cy="142" rx="66" ry="9" fill={theme.colors.surfaceSunken} />
      <rect x="40" y="26" width="106" height="94" rx="14" fill={theme.colors.surface} stroke={theme.colors.borderStrong} strokeWidth="3" />
      <rect x="58" y="46" width="52" height="7" rx="3.5" fill={theme.colors.surfaceSunken} />
      <rect x="58" y="62" width="70" height="7" rx="3.5" fill={theme.colors.surfaceSunken} />
      <rect x="58" y="78" width="40" height="7" rx="3.5" fill={theme.colors.surfaceSunken} />
      <circle cx="128" cy="94" r="30" fill={theme.colors.accentSoft} fillOpacity="0.85" stroke={theme.colors.accent} strokeWidth="4" />
      <path d="M150 116 L172 138" stroke={theme.colors.accent} strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

/** A tipped-over mug — used for error states. Apologetic, not alarming. */
export function SpilledMugIllustration({ size = 148 }: IllustrationProps): JSX.Element {
  const theme = useTheme();
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 200 156" role="img" aria-label="A tipped-over mug with a small spill">
      <path d="M36 132 Q74 118 118 128 Q150 135 168 130 Q150 146 100 146 Q54 146 36 132 Z" fill={theme.colors.primarySoft} />
      <g transform="rotate(-24 96 92)">
        <path d="M60 60 L136 60 L128 118 Q126 128 116 128 L80 128 Q70 128 68 118 Z" fill={theme.colors.surface} stroke={theme.colors.borderStrong} strokeWidth="3" strokeLinejoin="round" />
        <path d="M62 72 L134 72" stroke={theme.colors.primarySoft} strokeWidth="10" strokeLinecap="round" />
        <path d="M136 74 Q160 76 158 96 Q156 112 134 110" fill="none" stroke={theme.colors.borderStrong} strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="150" cy="40" r="5" fill={theme.colors.accent} opacity="0.6" />
      <circle cx="164" cy="58" r="3.5" fill={theme.colors.secondary} opacity="0.5" />
      <circle cx="40" cy="44" r="4" fill={theme.colors.secondary} opacity="0.4" />
    </svg>
  );
}

/** A padlock with a friendly face — used when a route is gated. */
export function LockedDoorIllustration({ size = 148 }: IllustrationProps): JSX.Element {
  const theme = useTheme();
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 200 156" role="img" aria-label="A padlock">
      <ellipse cx="100" cy="140" rx="56" ry="9" fill={theme.colors.surfaceSunken} />
      <path d="M74 62 L74 46 Q74 20 100 20 Q126 20 126 46 L126 62" fill="none" stroke={theme.colors.borderStrong} strokeWidth="11" strokeLinecap="round" />
      <rect x="52" y="60" width="96" height="76" rx="18" fill={theme.colors.primarySoft} stroke={theme.colors.primary} strokeWidth="3" />
      <circle cx="100" cy="92" r="11" fill={theme.colors.primary} />
      <path d="M100 100 L100 114" stroke={theme.colors.primary} strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

/** A simple checkmark badge — used for confirmations. */
export function CelebrationIllustration({ size = 120 }: IllustrationProps): JSX.Element {
  const theme = useTheme();
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 200 156" role="img" aria-label="A celebratory checkmark">
      <circle cx="100" cy="80" r="48" fill={theme.colors.successSoft} stroke={theme.colors.success} strokeWidth="3" />
      <path d="M78 82 L94 98 L124 62" fill="none" stroke={theme.colors.success} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M44 34 L52 42 M156 34 L148 42 M36 100 L26 104 M164 100 L174 104" stroke={theme.colors.accent} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
