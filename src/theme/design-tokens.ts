import { createTheme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;

export interface BrandColors {
  primary: string;
  secondary: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastText(bgHex: string): string {
  return luminance(bgHex) > 0.5 ? '#09090B' : '#FAFAFA';
}

function alpha(hex: string, a: number): string {
  const rgb = hexToRgb(hex);
  return rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},${a})` : hex;
}

/**

/**
 * Default surface mode for the app shell.
 *
 * Single switch on purpose — flipping this reverts the whole console between
 * the light reference look and the original dark one, because every surface
 * below is resolved from the ramp rather than hardcoded at the call site.
 */
export const DEFAULT_MODE: ThemeMode = 'system';

/**
 * Neutral ramp — surface colours keyed by theme mode.
 *
 * Values were measured off a live reference implementation (computed
 * styles, not eyeballed) and converted from oklch to hex. The reference is a
 * stock shadcn/ui zinc ramp; its recognisable qualities are not the colours
 * but three structural choices:
 *
 *   1. Headings sit at weight 600 with -0.025em tracking — tight, not bold.
 *   2. Radius is a *scale*, not one value: controls 8, cards 16, hero 24, pills full.
 *   3. Shadows are near-invisible and wide: 0 20px 25px -5px at 2-4% alpha.
 *
 * Those three are mode-independent, which is why they are defined once and the
 * palettes are defined twice.
 *
 * Colour is deliberately NOT fully fixed here: `primary`/`secondary` come from
 * the tenant's brand config at runtime (see theme-registry). Everything in the
 * `neutral` ramp below is chrome — surfaces, borders, muted text — and stays
 * constant so tenant branding changes the accent without restyling the shell.
 */

export interface NeutralRamp {
  /** Page background — the widest surface. */
  background: string;
  /** Raised surface: cards, dialogs, menus. */
  surface: string;
  /** Nav rail / drawer background — a half-step off `background`. */
  rail: string;
  /** Hover + selected state on rail items. */
  railAccent: string;
  /** Primary body text. */
  text: string;
  /** Secondary text: captions, helper text, disabled labels. */
  textMuted: string;
  /** Filled-but-quiet surface: chips, inactive tabs, code blocks. */
  muted: string;
  /** Hairlines. The reference uses one border colour everywhere. */
  border: string;
  /** Focus ring. */
  ring: string;
  /** Error / destructive. */
  danger: string;
}

export const NEUTRALS: Record<ThemeMode, NeutralRamp> = {
  light: {
    background: '#FDFDFC',
    surface: '#FFFFFF',
    rail: '#FAF9F8',
    railAccent: '#EEEAE7',
    text: '#09090B',
    textMuted: '#71717B',
    muted: '#F4F4F5',
    border: '#E4E4E7',
    ring: '#AAAAF3',
    danger: '#E7000B',
  },
  dark: {
    background: '#09090B',
    surface: '#18181B',
    rail: '#111113',
    railAccent: '#27272A',
    text: '#FAFAFA',
    textMuted: '#A1A1AA',
    muted: '#1F1F23',
    border: '#27272A',
    ring: '#6366F1',
    danger: '#FF5C5C',
  },
  system: {
    background: 'var(--background)',
    surface: 'var(--surface)',
    rail: 'var(--rail)',
    railAccent: 'var(--rail-accent)',
    text: 'var(--text)',
    textMuted: 'var(--text-muted)',
    muted: 'var(--muted)',
    border: 'var(--border)',
    ring: 'var(--ring)',
    danger: 'var(--danger)',
  },
};

/**
 * Radius scale. MUI's `shape.borderRadius` is a single number, so component
 * overrides in the theme map each component onto the right step.
 */
export const RADIUS = {
  /** Buttons, inputs, small controls. */
  control: 8,
  /** Default — menus, popovers, alerts. */
  base: 10,
  /** Cards, dialogs, panels. */
  card: 16,
  /** Hero / feature panels. */
  hero: 24,
  /** Chips, avatars, badges. */
  pill: 9999,
} as const;

/**
 * Shadow scale. Wide, soft and low-alpha — a card should read as lifted
 * without a visible grey edge. In dark mode shadows do almost nothing
 * (there is no light to occlude), so the ramp leans on `border` instead
 * and these stay subtle rather than being scaled up.
 */
export const SHADOWS = {
  /** Resting state for buttons. */
  control: '0 1px 2px 0 rgba(0,0,0,0.05)',
  /** Raised control / hovered chip. */
  raised: '0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10)',
  /** Cards. Deliberately 4% — any darker and the grid looks striped. */
  card: '0 20px 25px -5px rgba(0,0,0,0.04), 0 8px 10px -6px rgba(0,0,0,0.04)',
  /** Dialogs and menus. */
  overlay: '0 24px 48px -12px rgba(0,0,0,0.18)',
} as const;

/**
 * Type scale, measured from the reference.
 *
 * The tracking values are the signature: -0.025em at every display size.
 * Body text is left at normal tracking — tightening it hurts readability at
 * 16px, and the reference does not do it either.
 */
export const TYPE = {
  /** Applied via next/font in the root layout; this is the CSS var it exposes. */
  fontFamily:
    "var(--font-geist), ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  fontFamilyMono:
    "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  display: { weight: 600, tracking: '-0.025em' },
  body: { size: 16, lineHeight: 1.5 },
  /** Controls read at 14px/500 — one step down from body, never bold. */
  control: { size: 14, weight: 500 },
} as const;

/**
 * Build the app theme from the tenant's brand colours and a surface mode.
 *
 * Structure comes from the design tokens; only the accent is tenant-specific.
 * Exported so tests and Storybook-style previews can build a theme without
 * mounting the provider (which fetches brand config over the network).
 */
export function createAppTheme(brand: BrandColors, mode: ResolvedThemeMode = 'light') {
  const n = NEUTRALS[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: brand.primary, contrastText: contrastText(brand.primary) },
      secondary: { main: brand.secondary, contrastText: contrastText(brand.secondary) },
      error: { main: n.danger },
      background: { default: n.background, paper: n.surface },
      text: { primary: n.text, secondary: n.textMuted },
      divider: n.border,
      action: {
        hover: alpha(brand.primary, 0.06),
        selected: alpha(brand.primary, 0.1),
      },
    },
    shape: { borderRadius: RADIUS.base },
    typography: {
      fontFamily: TYPE.fontFamily,
      fontSize: TYPE.body.size,
      // Display sizes share one tracking value — that consistency is what makes
      // the scale read as a system rather than a set of one-off sizes.
      h1: { fontSize: '3rem', lineHeight: 1.1, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      h2: { fontSize: '2.25rem', lineHeight: 1.11, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      h3: { fontSize: '1.875rem', lineHeight: 1.2, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      h4: { fontSize: '1.5rem', lineHeight: 1.25, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      h5: { fontSize: '1.25rem', lineHeight: 1.3, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      h6: { fontSize: '1rem', lineHeight: 1.4, fontWeight: TYPE.display.weight, letterSpacing: TYPE.display.tracking },
      body1: { fontSize: '1rem', lineHeight: TYPE.body.lineHeight },
      body2: { fontSize: '0.875rem', lineHeight: 1.45 },
      button: { fontWeight: TYPE.control.weight, textTransform: 'none', letterSpacing: 0 },
      caption: { fontSize: '0.8125rem', lineHeight: 1.4 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: n.background, color: n.text },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: RADIUS.card,
          },
          // `elevation={0}` is used across the app for bordered panels — keep it flat.
          elevation0: { boxShadow: 'none' },
          elevation1: { boxShadow: SHADOWS.card },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.card,
            border: `1px solid ${n.border}`,
            boxShadow: SHADOWS.card,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: RADIUS.card, boxShadow: SHADOWS.overlay },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: { borderRadius: RADIUS.base, border: `1px solid ${n.border}`, boxShadow: SHADOWS.overlay },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(n.background, 0.85),
            backdropFilter: 'blur(8px)',
            borderBottom: `1px solid ${n.border}`,
            boxShadow: 'none',
            backgroundImage: 'none',
            color: n.text,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: n.rail,
            borderColor: n.border,
            backgroundImage: 'none',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: RADIUS.control,
            '&.Mui-selected': {
              backgroundColor: n.railAccent,
              '&:hover': { backgroundColor: n.railAccent },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: RADIUS.pill, fontWeight: TYPE.control.weight },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { borderRadius: RADIUS.control, fontSize: '0.8125rem' },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: RADIUS.control },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: TYPE.control.weight, letterSpacing: 0 },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: RADIUS.control },
          contained: { boxShadow: SHADOWS.control, '&:hover': { boxShadow: SHADOWS.raised } },
          // Mobile touch target — every small button still clears 48px.
          sizeSmall: { minHeight: 48 },
        },
      },
      // ── Mobile touch target overrides ─────────────────────────
      // Ensure all small variants meet minimum 48×48px tap target.
      MuiIconButton: {
        styleOverrides: {
          sizeSmall: {
            width: 48,
            height: 48,
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          sizeSmall: {
            width: 70,
            height: 48,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          // Reference spec (see DevTools target markup):
          //   .MuiSwitch-root (sizeMedium): padding 9px; width 70px
          //   .MuiSwitch-switchBase:         padding 14px (checked AND unchecked)
          //   .MuiSwitch-track:              border-radius 15px
          // Scoped to sizeMedium — size="small" switches keep their
          // compact geometry. Touch target is met via the 70px-wide root
          // + MuiFormControlLabel minHeight 48 below.
          root: ({ ownerState }) => ownerState.size === 'medium' ? {
            width: 70,
            padding: 9,
          } : {},
          switchBase: ({ ownerState }) => ownerState.size === 'medium' ? {
            padding: 14,
            '&.Mui-checked, &.MuiSwitch-checked': {
              padding: 14, // keep identical when checked so the thumb doesn't jump
            },
          } : {},
          track: ({ ownerState }) => ownerState.size === 'medium' ? {
            borderRadius: 15,
            padding: 15,
          } : {},
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            minHeight: 48,
          },
        },
      },
    },
  });
}
