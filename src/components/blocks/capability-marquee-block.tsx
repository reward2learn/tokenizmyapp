'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

/**
 * "Everything you need is built-in" — scrolling rows of platform capabilities.
 *
 * The argument this section makes is breadth: a buyer evaluating an app builder
 * is really asking "what will I still have to buy separately?". A long list
 * answers that faster than prose, and motion keeps a long list from reading as
 * a wall.
 *
 * Rows scroll in alternating directions so the eye does not lock onto one line,
 * and the whole thing stops under `prefers-reduced-motion` — continuously
 * moving text is an accessibility problem, not a flourish. Same treatment as
 * the testimonial wall, deliberately: two marquees on one page that behaved
 * differently would read as a bug.
 */

export interface CapabilityMarqueeProps {
  heading: string;
  subheading?: string;
  /** Each entry becomes one scrolling row. */
  rows: string[][];
}

function MarqueeRow({
  items,
  durationSec,
  reverse,
}: {
  items: string[];
  durationSec: number;
  reverse: boolean;
}) {
  if (items.length === 0) return null;
  // Rendered twice and translated by exactly -50%, so the loop point lands on
  // an identical frame and reads as continuous rather than snapping.
  const doubled = [...items, ...items];

  return (
    <Box sx={{ overflow: 'hidden', width: '100%', py: 0.75 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          width: 'max-content',
          animation: `cap-${reverse ? 'rev' : 'fwd'} ${durationSec}s linear infinite`,
          '&:hover': { animationPlayState: 'paused' },
          '@keyframes cap-fwd': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(-50%)' },
          },
          '@keyframes cap-rev': {
            from: { transform: 'translateX(-50%)' },
            to: { transform: 'translateX(0)' },
          },
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            width: '100%',
            overflowX: 'auto',
          },
        }}
      >
        {doubled.map((label, i) => (
          <Chip
            key={`${label}-${i}`}
            label={label}
            sx={{ fontWeight: 500, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
          />
        ))}
      </Box>
    </Box>
  );
}

export function CapabilityMarqueeBlock({ config }: { config: Record<string, unknown> }) {
  const heading =
    typeof config.heading === 'string' ? config.heading : 'Everything you need is built-in';
  const subheading = typeof config.subheading === 'string' ? config.subheading : undefined;

  const rows: string[][] = Array.isArray(config.rows)
    ? (config.rows as unknown[]).flatMap((row) => {
        if (!Array.isArray(row)) return [];
        const items = row.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
        return items.length > 0 ? [items] : [];
      })
    : [];

  if (rows.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: 'center', px: 3, mb: 4 }}>
        <Typography variant="h3">{heading}</Typography>
        {subheading && (
          <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 640, mx: 'auto' }}>
            {subheading}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          maskImage: 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)',
        }}
      >
        {rows.map((items, i) => (
          <MarqueeRow
            key={i}
            items={items}
            // Staggered so rows never align into a visible column.
            durationSec={45 + i * 9}
            reverse={i % 2 === 1}
          />
        ))}
      </Box>
    </Box>
  );
}
