'use client';

import { useCallback } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  DEFAULT_HERO_NAV_BUTTONS,
  emptyHeroSlide,
  getHeroFallbackTitle,
  isCarouselMode,
  type HeroNavButton,
  type HeroSlide,
} from '@/lib/hero-config';
import { CmsAiTextField } from '@/components/cms/cms-ai-text-field';
import { AiGenerateFieldButton } from '@/components/cms/ai-field-generate-button';
import { useCmsEditorContext } from '@/components/cms/cms-editor-context';
import { useEnsureHeroNavRoutesMutation } from '@/store/apis/admin-api';

function str(config: Record<string, unknown>, key: string): string {
  const v = config[key];
  return typeof v === 'string' ? v : '';
}

function setStr(config: Record<string, unknown>, key: string, value: string): Record<string, unknown> {
  return { ...config, [key]: value };
}

function navButtonsFromConfig(config: Record<string, unknown>): HeroNavButton[] {
  const raw = config.navButtons;
  if (!Array.isArray(raw)) return DEFAULT_HERO_NAV_BUTTONS.map((b) => ({ ...b }));
  const buttons = raw
    .filter((b): b is HeroNavButton => !!b && typeof b === 'object')
    .map((b) => ({
      label: typeof b.label === 'string' ? b.label : '',
      href: typeof b.href === 'string' ? b.href : '',
    }))
    .slice(0, 2);
  while (buttons.length < 2) buttons.push({ label: '', href: '' });
  return buttons;
}

function slideFromUnknown(raw: unknown): HeroSlide {
  if (!raw || typeof raw !== 'object') return emptyHeroSlide();
  const row = raw as Record<string, unknown>;
  const navButtons = Array.isArray(row.navButtons)
    ? row.navButtons
        .filter((b): b is HeroNavButton => !!b && typeof b === 'object')
        .map((b) => ({
          label: typeof b.label === 'string' ? b.label : '',
          href: typeof b.href === 'string' ? b.href : '',
        }))
        .slice(0, 2)
    : [{ label: '', href: '' }, { label: '', href: '' }];
  while (navButtons.length < 2) navButtons.push({ label: '', href: '' });

  return {
    headline: typeof row.headline === 'string' ? row.headline : '',
    accent: typeof row.accent === 'string' ? row.accent : '',
    subtitle: typeof row.subtitle === 'string' ? row.subtitle : '',
    navButtons,
    backgroundImage: typeof row.backgroundImage === 'string' ? row.backgroundImage : '',
    backgroundVideo: typeof row.backgroundVideo === 'string' ? row.backgroundVideo : '',
    videoAutoplay: row.videoAutoplay !== false,
  };
}

function slidesFromConfig(config: Record<string, unknown>): HeroSlide[] {
  if (!Array.isArray(config.slides) || config.slides.length === 0) {
    return [
      {
        headline: str(config, 'headline') || getHeroFallbackTitle(),
        accent: str(config, 'accent'),
        subtitle: str(config, 'subtitle'),
        navButtons: navButtonsFromConfig(config),
        backgroundImage: str(config, 'backgroundImage'),
        backgroundVideo: str(config, 'backgroundVideo'),
        videoAutoplay: config.videoAutoplay !== false,
      },
    ];
  }
  return config.slides.map(slideFromUnknown);
}


function SlideFields({
  slide,
  slideIndex,
  onChange,
  readOnly,
}: {
  slide: HeroSlide;
  slideIndex?: number;
  onChange: (slide: HeroSlide) => void;
  readOnly?: boolean;
}) {
  const cmsCtx = useCmsEditorContext();
  const [ensureHeroRoutes] = useEnsureHeroNavRoutesMutation();

  const ensureRoutes = useCallback(
    async (buttons: HeroNavButton[]) => {
      const navButtons = buttons.filter((b) => b.href.trim());
      if (navButtons.length === 0) return;
      try {
        await ensureHeroRoutes({
          navButtons,
          tenantSlug: cmsCtx?.tenantSlug,
          appId: cmsCtx?.appId,
        }).unwrap();
      } catch {
        // Routes are also provisioned on section save — do not block editing.
      }
    },
    [cmsCtx?.appId, cmsCtx?.tenantSlug, ensureHeroRoutes],
  );

  const path = (field: string) =>
    slideIndex !== undefined ? `slides.${slideIndex}.${field}` : field;

  const buttons = slide.navButtons ?? [{ label: '', href: '' }, { label: '', href: '' }];
  const paddedButtons = [...buttons];
  while (paddedButtons.length < 2) paddedButtons.push({ label: '', href: '' });

  return (
    <Stack spacing={1.5}>
      <CmsAiTextField
        label="headline"
        fieldKey="headline"
        fieldPath={path('headline')}
        size="small"
        fullWidth
        value={slide.headline ?? ''}
        onChange={(v) => onChange({ ...slide, headline: v })}
        helperText="Main title line"
        readOnly={readOnly}
      />
      <CmsAiTextField
        label="accent"
        fieldKey="accent"
        fieldPath={path('accent')}
        size="small"
        fullWidth
        value={slide.accent ?? ''}
        onChange={(v) => onChange({ ...slide, accent: v })}
        helperText="Second line in brand colour"
        readOnly={readOnly}
      />
      <CmsAiTextField
        label="subtitle"
        fieldKey="subtitle"
        fieldPath={path('subtitle')}
        fieldType="multiline"
        size="small"
        fullWidth
        multiline
        minRows={2}
        value={slide.subtitle ?? ''}
        onChange={(v) => onChange({ ...slide, subtitle: v })}
        readOnly={readOnly}
      />
      <Typography variant="caption" color="text.secondary">
        Navigation buttons (up to 2)
      </Typography>
      {!readOnly ? (
        <Stack direction="row" justifyContent="flex-end">
          <AiGenerateFieldButton
            fieldKey="navButtons"
            fieldPath={path('navButtons')}
            fieldType="nav_buttons"
            currentValue={slide.navButtons}
            onGenerated={(v) => {
              if (Array.isArray(v)) {
                const navButtons = v
                  .filter((b): b is HeroNavButton => !!b && typeof b === 'object')
                  .map((b) => ({
                    label: typeof b.label === 'string' ? b.label : '',
                    href: typeof b.href === 'string' ? b.href : '',
                  }))
                  .slice(0, 2);
                onChange({ ...slide, navButtons });
                void ensureRoutes(navButtons);
              }
            }}
          />
        </Stack>
      ) : null}
      {paddedButtons.map((btn, i) => (
        <Stack key={i} direction="row" spacing={1}>
          <TextField
            label={`Button ${i + 1} label`}
            size="small"
            fullWidth
            value={btn.label}
            onChange={(e) => {
              const next = [...paddedButtons];
              next[i] = { ...next[i], label: e.target.value };
              onChange({
                ...slide,
                navButtons: next.filter((b) => b.label.trim() || b.href.trim()),
              });
            }}
          />
          <TextField
            label="href"
            size="small"
            fullWidth
            value={btn.href}
            onChange={(e) => {
              const next = [...paddedButtons];
              next[i] = { ...next[i], href: e.target.value };
              onChange({
                ...slide,
                navButtons: next.filter((b) => b.label.trim() || b.href.trim()),
              });
            }}
            onBlur={() => void ensureRoutes(paddedButtons)}
          />
        </Stack>
      ))}
      <CmsAiTextField
        label="background image URL"
        fieldKey="backgroundImage"
        fieldPath={path('backgroundImage')}
        fieldType="url"
        size="small"
        fullWidth
        value={slide.backgroundImage ?? ''}
        onChange={(v) => onChange({ ...slide, backgroundImage: v })}
        helperText="Optional — shown behind hero text"
        readOnly={readOnly}
      />
      <CmsAiTextField
        label="background video URL"
        fieldKey="backgroundVideo"
        fieldPath={path('backgroundVideo')}
        fieldType="url"
        size="small"
        fullWidth
        value={slide.backgroundVideo ?? ''}
        onChange={(v) => onChange({ ...slide, backgroundVideo: v })}
        helperText="Optional — MP4/WebM; image is ignored when video is set"
        readOnly={readOnly}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={slide.videoAutoplay !== false}
            onChange={(e) => onChange({ ...slide, videoAutoplay: e.target.checked })}
            disabled={readOnly}
          />
        }
        label="Video autoplay (muted)"
      />
    </Stack>
  );
}

export interface HeroConfigEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function HeroConfigEditor({ config, onChange, readOnly = false }: HeroConfigEditorProps) {
  const carousel = isCarouselMode(config);
  const slides = slidesFromConfig(config);

  const enableCarousel = () => {
    const initialSlides = slidesFromConfig(config);
    onChange({
      ...config,
      slides: initialSlides.length > 0 ? initialSlides : [emptyHeroSlide()],
      carouselInterval: typeof config.carouselInterval === 'number' ? config.carouselInterval : 6,
    });
  };

  const disableCarousel = () => {
    const first = slides[0] ?? emptyHeroSlide();
    const { slides: _removedSlides, ...rest } = config;
    void _removedSlides;
    onChange({
      ...rest,
      headline: first.headline ?? '',
      accent: first.accent ?? '',
      subtitle: first.subtitle ?? '',
      navButtons: first.navButtons,
      backgroundImage: first.backgroundImage ?? '',
      backgroundVideo: first.backgroundVideo ?? '',
      videoAutoplay: first.videoAutoplay,
    });
  };

  const updateSlide = (index: number, slide: HeroSlide) => {
    const next = [...slides];
    next[index] = slide;
    onChange({ ...config, slides: next });
  };

  return (
    <Box component="fieldset" disabled={readOnly} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Stack spacing={1.5}>
        <CmsAiTextField
          label="badge"
          fieldKey="badge"
          size="small"
          fullWidth
          value={str(config, 'badge')}
          onChange={(v) => onChange(setStr(config, 'badge', v))}
          helperText="Optional chip above the headline"
          readOnly={readOnly}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={carousel}
              onChange={(e) => (e.target.checked ? enableCarousel() : disableCarousel())}
              disabled={readOnly}
            />
          }
          label="Carousel (multiple hero slides)"
        />

        {carousel ? (
          <>
            <TextField
              label="carousel interval (seconds)"
              size="small"
              type="number"
              fullWidth
              value={typeof config.carouselInterval === 'number' ? config.carouselInterval : 6}
              onChange={(e) =>
                onChange({
                  ...config,
                  carouselInterval: e.target.value ? Number(e.target.value) : 6,
                })
              }
              slotProps={{ htmlInput: { min: 2, max: 120 } }}
            />
            {slides.map((slide, index) => (
              <Accordion key={index} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="body2">
                    Slide {index + 1}
                    {slide.headline ? ` — ${slide.headline}` : ''}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    <SlideFields
                      slide={slide}
                      slideIndex={index}
                      onChange={(next) => updateSlide(index, next)}
                      readOnly={readOnly}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        disabled={slides.length <= 1}
                        onClick={() => {
                          const next = slides.filter((_, i) => i !== index);
                          onChange({ ...config, slides: next });
                        }}
                      >
                        Remove slide
                      </Button>
                    </Stack>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => onChange({ ...config, slides: [...slides, emptyHeroSlide()] })}
            >
              Add slide
            </Button>
          </>
        ) : (
          <SlideFields
            slide={slides[0] ?? emptyHeroSlide()}
            onChange={(next) =>
              onChange({
                ...config,
                headline: next.headline ?? '',
                accent: next.accent ?? '',
                subtitle: next.subtitle ?? '',
                navButtons: next.navButtons,
                backgroundImage: next.backgroundImage ?? '',
                backgroundVideo: next.backgroundVideo ?? '',
                videoAutoplay: next.videoAutoplay,
              })
            }
            readOnly={readOnly}
          />
        )}
      </Stack>
    </Box>
  );
}
