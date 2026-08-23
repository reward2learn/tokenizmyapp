import { z } from 'zod';
import { getClientTenantConfig } from '@shared/lib/config/tenant';

export const heroNavButtonSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const heroSlideSchema = z.object({
  headline: z.string().optional(),
  accent: z.string().optional(),
  subtitle: z.string().optional(),
  navButtons: z.array(heroNavButtonSchema).max(2).optional(),
  backgroundImage: z.string().optional(),
  backgroundVideo: z.string().optional(),
  videoAutoplay: z.boolean().optional(),
});

export const heroConfigSchema = z.object({
  headline: z.string().optional(),
  /** Second headline line, shown in the brand colour. */
  accent: z.string().optional(),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  navButtons: z.array(heroNavButtonSchema).max(2).optional(),
  backgroundImage: z.string().optional(),
  backgroundVideo: z.string().optional(),
  videoAutoplay: z.boolean().optional(),
  /** Seconds between carousel slides. Default 6. */
  carouselInterval: z.number().min(2).max(120).optional(),
  slides: z.array(heroSlideSchema).min(1).optional(),
  minTier: z.enum(['public', 'pin', 'google']).optional(),
});

export type HeroNavButton = z.infer<typeof heroNavButtonSchema>;
export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type HeroConfig = z.infer<typeof heroConfigSchema>;

export const DEFAULT_HERO_NAV_BUTTONS: HeroNavButton[] = [
  { label: 'Executive Summary', href: '/summary' },
  { label: 'Full Business Review', href: '/review/part-a' },
];

export const DEFAULT_HERO_FALLBACK_ACCENT = 'Business Operations';

export function getHeroFallbackTitle(): string {
  return getClientTenantConfig().displayName;
}

export function parseHeroConfig(config: Record<string, unknown>): HeroConfig {
  return heroConfigSchema.parse(config);
}

/** Slides to render — explicit carousel or a single slide from top-level fields. */
export function getHeroSlides(config: HeroConfig): HeroSlide[] {
  if (config.slides && config.slides.length > 0) {
    return config.slides;
  }
  return [
    {
      headline: config.headline,
      accent: config.accent,
      subtitle: config.subtitle,
      navButtons: config.navButtons,
      backgroundImage: config.backgroundImage,
      backgroundVideo: config.backgroundVideo,
      videoAutoplay: config.videoAutoplay,
    },
  ];
}

export interface ResolvedHeroSlide {
  headline: string;
  accent: string | null;
  subtitle: string | null;
  navButtons: HeroNavButton[];
  backgroundImage: string | null;
  backgroundVideo: string | null;
  videoAutoplay: boolean;
}

export function resolveHeroSlide(
  slide: HeroSlide,
  fallbackTitle = getHeroFallbackTitle(),
): ResolvedHeroSlide {
  const headline = slide.headline?.trim() || fallbackTitle;
  const configuredAccent = slide.accent?.trim() || null;
  const accent = configuredAccent ?? (slide.headline?.trim() ? null : DEFAULT_HERO_FALLBACK_ACCENT);
  const navButtons =
    slide.navButtons && slide.navButtons.length > 0
      ? slide.navButtons.slice(0, 2)
      : DEFAULT_HERO_NAV_BUTTONS;

  return {
    headline,
    accent,
    subtitle: slide.subtitle?.trim() || null,
    navButtons,
    backgroundImage: slide.backgroundImage?.trim() || null,
    backgroundVideo: slide.backgroundVideo?.trim() || null,
    videoAutoplay: slide.videoAutoplay ?? true,
  };
}

function navButtonsMissing(config: Record<string, unknown>): boolean {
  return !Array.isArray(config.navButtons) || config.navButtons.length === 0;
}

function singleHeroFieldsEmpty(config: Record<string, unknown>): boolean {
  return (
    typeof config.headline !== 'string' &&
    typeof config.accent !== 'string' &&
    typeof config.subtitle !== 'string' &&
    !Array.isArray(config.slides)
  );
}

/**
 * When opening block settings, copy rendered fallbacks into editable fields so
 * the form matches what users see on the page.
 */
export function hydrateHeroConfigForEdit(config: Record<string, unknown>): Record<string, unknown> {
  if (!singleHeroFieldsEmpty(config)) {
    if (navButtonsMissing(config) && !Array.isArray(config.slides)) {
      return { ...config, navButtons: DEFAULT_HERO_NAV_BUTTONS };
    }
    return config;
  }

  return {
    ...config,
    headline: getHeroFallbackTitle(),
    accent: DEFAULT_HERO_FALLBACK_ACCENT,
    navButtons: DEFAULT_HERO_NAV_BUTTONS,
  };
}

export function emptyHeroSlide(): HeroSlide {
  return {
    headline: '',
    accent: '',
    subtitle: '',
    navButtons: [{ label: '', href: '' }, { label: '', href: '' }],
    backgroundImage: '',
    backgroundVideo: '',
    videoAutoplay: true,
  };
}

export function isCarouselMode(config: Record<string, unknown>): boolean {
  return Array.isArray(config.slides) && config.slides.length > 0;
}
