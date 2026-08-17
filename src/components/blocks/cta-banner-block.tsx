'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/**
 * Closing call to action.
 *
 * The "No credit card required" line is load-bearing and must stay true: it is
 * only honest while the paywall is skippable (roadmap §7.4, §1.12). If the
 * funnel ever hard-gates before first value, this line comes out — a promise
 * the product breaks costs more than the conversion it buys.
 */
export function CtaBannerBlock({ config }: { config: Record<string, unknown> }) {
  const heading = typeof config.heading === 'string' ? config.heading : 'Start building for free';
  const subheading = typeof config.subheading === 'string' ? config.subheading : undefined;
  const ctaLabel = typeof config.ctaLabel === 'string' ? config.ctaLabel : 'Start building';
  const ctaHref = typeof config.ctaHref === 'string' ? config.ctaHref : '/admin';

  return (
    <Box
      component="section"
      sx={{
        textAlign: 'center',
        py: { xs: 8, md: 12 },
        px: 3,
        background: (theme) =>
          `radial-gradient(ellipse 70% 100% at 50% 100%, rgba(235, 61, 40, 0.10) 0%, transparent 70%), ${theme.palette.background.default}`,
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 700 }}>
        {heading}
      </Typography>
      {subheading && (
        <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 560, mx: 'auto' }}>
          {subheading}
        </Typography>
      )}
      <Button
        component={Link}
        href={ctaHref as never}
        variant="contained"
        size="large"
        endIcon={<ArrowForwardIcon />}
        sx={{ mt: 4, px: 5 }}
      >
        {ctaLabel}
      </Button>
    </Box>
  );
}
