'use client';

import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import type { Route } from 'next';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { AuthGate } from '@/components/auth/auth-gate';
import {
  getHeroSlides,
  parseHeroConfig,
  resolveHeroSlide,
  type ResolvedHeroSlide,
} from '@/lib/hero-config';
import { BlockAnimateRoot } from '@/components/blocks/block-scroll-animate';

export function HeroBlock({ config }: { config: Record<string, unknown> }) {
  const parsed = parseHeroConfig(config);
  const slides = getHeroSlides(parsed).map((slide) => resolveHeroSlide(slide));
  const intervalSec = parsed.carouselInterval ?? 6;
  const isCarousel = slides.length > 1;

  if (isCarousel) {
    return (
      <HeroCarousel
        badge={parsed.badge}
        slides={slides}
        intervalSec={intervalSec}
      />
    );
  }

  return <HeroSlideView badge={parsed.badge} slide={slides[0]} />;
}

function HeroCarousel({
  badge,
  slides,
  intervalSec,
}: {
  badge?: string;
  slides: ResolvedHeroSlide[];
  intervalSec: number;
}) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      setIndex((next + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalSec * 1000);
    return () => window.clearInterval(timer);
  }, [slides.length, intervalSec]);

  return (
    <Box sx={{ position: 'relative' }}>
      <HeroSlideView badge={badge} slide={slides[index]} />
      <StackDots count={slides.length} active={index} onSelect={goTo} />
    </Box>
  );
}

function StackDots({
  count,
  active,
  onSelect,
}: {
  count: number;
  active: number;
  onSelect: (index: number) => void;
}) {
  if (count <= 1) return null;
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 0.5,
        pb: 2,
        mt: -2,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <IconButton
          key={i}
          size="small"
          aria-label={`Go to slide ${i + 1}`}
          onClick={() => onSelect(i)}
          sx={{ color: i === active ? 'primary.main' : 'text.disabled', p: 0.5 }}
        >
          <FiberManualRecordIcon sx={{ fontSize: i === active ? 12 : 8 }} />
        </IconButton>
      ))}
    </Box>
  );
}

function HeroSlideView({ badge, slide }: { badge?: string; slide: ResolvedHeroSlide }) {
  const hasMedia = Boolean(slide.backgroundVideo || slide.backgroundImage);

  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        textAlign: 'center',
        py: { xs: 7, md: 9 },
        px: 3,
        overflow: 'hidden',
        background: (theme) =>
          hasMedia
            ? theme.palette.background.default
            : `radial-gradient(ellipse 80% 60% at 50% 40%, rgba(235, 61, 40, 0.08) 0%, transparent 70%), ${theme.palette.background.default}`,
      }}
    >
      {slide.backgroundVideo ? (
        <Box
          component="video"
          src={slide.backgroundVideo}
          autoPlay={slide.videoAutoplay}
          muted
          loop
          playsInline
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
      ) : slide.backgroundImage ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${slide.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          }}
        />
      ) : null}
      {hasMedia ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.55)',
            zIndex: 1,
          }}
        />
      ) : null}

      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <BlockAnimateRoot>
          {badge ? (
            <Chip
              label={badge}
              size="small"
              sx={{
                mb: 2.5,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontSize: '10px',
                fontWeight: 600,
                color: 'text.primary',
                bgcolor: hasMedia ? 'rgba(255,255,255,0.12)' : 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
              }}
            />
          ) : null}
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.2rem', md: '3.4rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: hasMedia ? 'common.white' : 'text.primary',
            }}
          >
            {slide.headline}
            {slide.accent ? (
              <>
                <br />
                <Box component="span" sx={{ color: 'primary.main' }}>
                  {slide.accent}
                </Box>
              </>
            ) : null}
          </Typography>
          {slide.subtitle ? (
            <Typography
              variant="body1"
              sx={{
                mt: 1.75,
                color: hasMedia ? 'grey.300' : 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              {slide.subtitle}
            </Typography>
          ) : null}
          <AuthGate requiredTier="pin" fallback={null}>
            <Grid container spacing={2} sx={{ mt: 6, maxWidth: 560, mx: 'auto' }}>
              {slide.navButtons.map((btn) => (
                <Grid key={`${btn.href}-${btn.label}`} size={{ xs: 12, sm: 6 }}>
                  <ReportCard href={btn.href} title={btn.label} onDark={hasMedia} />
                </Grid>
              ))}
            </Grid>
          </AuthGate>
        </BlockAnimateRoot>
      </Box>
    </Box>
  );
}

function ReportCard({
  href,
  title,
  onDark,
}: {
  href: string;
  title: string;
  onDark?: boolean;
}) {
  return (
    <Paper
      component={Link}
      href={href as Route}
      elevation={0}
      sx={{
        display: 'block',
        p: 3,
        textDecoration: 'none',
        color: 'inherit',
        bgcolor: onDark ? 'rgba(255,255,255,0.08)' : 'action.hover',
        border: '1px solid',
        borderColor: onDark ? 'rgba(255,255,255,0.2)' : 'divider',
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:focus-visible': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(-1px)',
        },
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: onDark ? 'rgba(235, 61, 40, 0.25)' : 'rgba(187, 187, 187, 0.06)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Paper>
  );
}
