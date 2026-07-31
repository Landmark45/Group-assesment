/**
 * The single source of truth for how EduConnect looks.
 *
 * Nothing in the application hard-codes a colour, a radius or a shadow — every
 * styled component reaches for a token from here through the ThemeProvider.
 * Change a value in this file and the whole platform follows.
 *
 * The direction is "warm editorial": a cream page rather than a clinical white,
 * terracotta as the voice of the product, muted teal for the quieter supporting
 * moments, and shadows that are warm-tinted rather than grey so nothing on the
 * page feels cold.
 */

const colorTokens = {
  /* Page and surface — cream, not white. */
  pageBackground: '#FBF7F0',
  pageBackgroundElevated: '#FFFDF9',
  surface: '#FFFFFF',
  surfaceMuted: '#F5EFE5',
  surfaceSunken: '#F0E8DA',

  /* Primary: terracotta. Used for the main action on any screen — exactly one per view. */
  primary: '#C25A3C',
  primaryHover: '#A94A2E',
  primaryActive: '#8F3D26',
  primarySoft: '#F7E4DC',
  primaryOnSoft: '#8F3D26',

  /* Secondary: muted teal. Supporting actions, category accents, quiet emphasis. */
  secondary: '#3E7C76',
  secondaryHover: '#33665F',
  secondarySoft: '#DFEDEB',
  secondaryOnSoft: '#2C5A55',

  /* Accent: mustard. Reserved for ratings, price badges and small delights. */
  accent: '#D9A441',
  accentSoft: '#FAF0D9',
  accentOnSoft: '#8A6216',

  /* Text — warm charcoal rather than pure black. */
  textPrimary: '#2E2A26',
  textSecondary: '#6B6259',
  textMuted: '#948A7E',
  textOnPrimary: '#FFFDF9',
  textOnDark: '#FBF7F0',

  /* Lines and edges. */
  border: '#E7DDCD',
  borderStrong: '#D6C8B3',
  focusRing: '#C25A3C',

  /* Status. */
  success: '#4A7C59',
  successSoft: '#E2F0E5',
  danger: '#B4453A',
  dangerSoft: '#FAE3E0',
  warning: '#B57C1F',
  warningSoft: '#FAF0D9',
} as const;

/** A 4px-based scale. Every margin and padding in the app is one of these. */
const spacingScale = {
  none: '0',
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '72px',
} as const;

/** Generously rounded — the single biggest contributor to the friendly feel. */
const radiusScale = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  pill: '999px',
  circle: '50%',
} as const;

/**
 * Layered, warm-tinted shadows. `raised` is the resting state of a card and
 * `lifted` is where it travels on hover — the pair is what produces the
 * "picks itself up off the page" motion.
 */
const shadowScale = {
  none: 'none',
  subtle: '0 1px 2px rgba(70, 52, 38, 0.04), 0 2px 6px rgba(70, 52, 38, 0.04)',
  raised: '0 2px 4px rgba(70, 52, 38, 0.05), 0 6px 16px rgba(70, 52, 38, 0.07)',
  lifted: '0 6px 12px rgba(70, 52, 38, 0.08), 0 16px 32px rgba(70, 52, 38, 0.12)',
  overlay: '0 12px 24px rgba(70, 52, 38, 0.10), 0 32px 64px rgba(70, 52, 38, 0.16)',
  focus: `0 0 0 3px ${colorTokens.primarySoft}`,
} as const;

const typographyTokens = {
  fontFamilyBody: "'Nunito', 'Segoe UI', system-ui, -apple-system, sans-serif",
  fontFamilyDisplay: "'Fraunces', 'Iowan Old Style', Georgia, serif",

  /* Base is 17px rather than the usual 16px — a small nudge that makes long
     course descriptions noticeably easier to read. */
  fontSize: {
    xs: '0.8125rem',
    sm: '0.9375rem',
    base: '1.0625rem',
    lg: '1.1875rem',
    xl: '1.4375rem',
    xxl: '1.875rem',
    display: '2.5rem',
    hero: '3.25rem',
  },
  fontWeight: {
    regular: 400,
    medium: 600,
    bold: 700,
    heavy: 800,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.35,
    normal: 1.65,
    relaxed: 1.8,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.04em',
  },
} as const;

const layoutTokens = {
  contentMaxWidth: '1180px',
  narrowMaxWidth: '620px',
  readingMaxWidth: '68ch',
  navigationHeight: '72px',
} as const;

const motionTokens = {
  fast: '140ms',
  normal: '220ms',
  slow: '380ms',
  easeOut: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

const breakpointTokens = {
  small: '540px',
  medium: '820px',
  large: '1100px',
} as const;

/** Each course category gets its own quiet colour so the catalog reads at a glance. */
const categoryColorTokens = {
  Programming: { background: '#DFEDEB', foreground: '#2C5A55' },
  Design: { background: '#F7E4DC', foreground: '#8F3D26' },
  Marketing: { background: '#FAF0D9', foreground: '#8A6216' },
  Business: { background: '#E8E4F2', foreground: '#4C3F73' },
  Data: { background: '#E2F0E5', foreground: '#35603F' },
} as const;

export const educonnectTheme = {
  colors: colorTokens,
  spacing: spacingScale,
  radii: radiusScale,
  shadows: shadowScale,
  typography: typographyTokens,
  layout: layoutTokens,
  motion: motionTokens,
  breakpoints: breakpointTokens,
  categoryColors: categoryColorTokens,
} as const;

export type EduConnectTheme = typeof educonnectTheme;

/** Helper so category pills can fall back gracefully if a new category appears. */
export function resolveCategoryColors(
  theme: EduConnectTheme,
  category: string
): { background: string; foreground: string } {
  const knownCategory = theme.categoryColors[category as keyof typeof theme.categoryColors];
  return knownCategory ?? { background: theme.colors.surfaceMuted, foreground: theme.colors.textSecondary };
}
