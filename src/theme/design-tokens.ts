/**
 * Design tokens.
 *
 * Values here were measured off a live reference implementation (computed
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

export type ThemeMode = 'light' | 'dark';

/**
 * Default surface mode for the app shell.
 *
 * Single switch on purpose — flipping this reverts the whole console between
 * the light reference look and the original dark one, because every surface
 * below is resolved from the ramp rather than hardcoded at the call site.
 */
export const DEFAULT_MODE: ThemeMode = 'light';

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
