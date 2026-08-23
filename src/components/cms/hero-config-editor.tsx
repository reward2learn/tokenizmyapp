'use client';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
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

function updateNavButton(
  config: Record<string, unknown>,
  index: number,
  field: 'label' | 'href',
  value: string,
  onChange: (config: Record<string, unknown>) => void,
) {
  const buttons = navButtonsFromConfig(config);
  buttons[index] = { ...buttons[index], [field]: value };
  onChange({
    ...config,
    navButtons: buttons.filter((b) => b.label.trim() || b.href.trim()),
  });
}

function SlideFields({
  slide,
  onChange,
  readOnly,
}: {
  slide: HeroSlide;
  onChange: (slide: HeroSlide) => void;
  readOnly?: boolean;
}) {
  const buttons = slide.navButtons ?? [{ label: '', href: '' }, { label: '', href: '' }];
  const paddedButtons = [...buttons];
  while (paddedButtons.length < 2) paddedButtons.push({ label: '', href: '' });

  return (
    <Stack spacing={1.5}>
      <TextField
        label="headline"
        size="small"
        fullWidth
        value={slide.headline ?? ''}
        onChange={(e) => onChange({ ...slide, headline: e.target.value })}
        helperText="Main title line"
      />
      <TextField
        label="accent"
        size="small"
        fullWidth
        value={slide.accent ?? ''}
        onChange={(e) => onChange({ ...slide, accent: e.target.value })}
        helperText="Second line in brand colour"
      />
      <TextField
        label="subtitle"
        size="small"
        fullWidth
        multiline
        minRows={2}
        value={slide.subtitle ?? ''}
        onChange={(e) => onChange({ ...slide, subtitle: e.target.value })}
      />
      <Typography variant="caption" color="text.secondary">
        Navigation buttons (up to 2)
      </Typography>
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
          />
        </Stack>
      ))}
      <TextField
        label="background image URL"
        size="small"
        fullWidth
        value={slide.backgroundImage ?? ''}
        onChange={(e) => onChange({ ...slide, backgroundImage: e.target.value })}
        helperText="Optional — shown behind hero text"
      />
      <TextField
        label="background video URL"
        size="small"
        fullWidth
        value={slide.backgroundVideo ?? ''}
        onChange={(e) => onChange({ ...slide, backgroundVideo: e.target.value })}
        helperText="Optional — MP4/WebM; image is ignored when video is set"
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
    const { slides: _removed, ...rest } = config;
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
        <TextField
          label="badge"
          size="small"
          fullWidth
          value={str(config, 'badge')}
          onChange={(e) => onChange(setStr(config, 'badge', e.target.value))}
          helperText="Optional chip above the headline"
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
          <>
            <TextField
              label="headline"
              size="small"
              fullWidth
              value={str(config, 'headline')}
              onChange={(e) => onChange(setStr(config, 'headline', e.target.value))}
            />
            <TextField
              label="accent"
              size="small"
              fullWidth
              value={str(config, 'accent')}
              onChange={(e) => onChange(setStr(config, 'accent', e.target.value))}
              helperText="Second line in brand colour"
            />
            <TextField
              label="subtitle"
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={str(config, 'subtitle')}
              onChange={(e) => onChange(setStr(config, 'subtitle', e.target.value))}
            />
            <Typography variant="caption" color="text.secondary">
              Navigation buttons (up to 2)
            </Typography>
            {navButtonsFromConfig(config).map((btn, i) => (
              <Stack key={i} direction="row" spacing={1}>
                <TextField
                  label={`Button ${i + 1} label`}
                  size="small"
                  fullWidth
                  value={btn.label}
                  onChange={(e) => updateNavButton(config, i, 'label', e.target.value, onChange)}
                />
                <TextField
                  label="href"
                  size="small"
                  fullWidth
                  value={btn.href}
                  onChange={(e) => updateNavButton(config, i, 'href', e.target.value, onChange)}
                />
              </Stack>
            ))}
            <TextField
              label="background image URL"
              size="small"
              fullWidth
              value={str(config, 'backgroundImage')}
              onChange={(e) => onChange(setStr(config, 'backgroundImage', e.target.value))}
            />
            <TextField
              label="background video URL"
              size="small"
              fullWidth
              value={str(config, 'backgroundVideo')}
              onChange={(e) => onChange(setStr(config, 'backgroundVideo', e.target.value))}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={config.videoAutoplay !== false}
                  onChange={(e) => onChange({ ...config, videoAutoplay: e.target.checked })}
                  disabled={readOnly}
                />
              }
              label="Video autoplay (muted)"
            />
          </>
        )}
      </Stack>
    </Box>
  );
}
