'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { RADIUS, SHADOWS } from '@/theme/design-tokens';
import { BlockAnimateRoot } from '@/components/blocks/block-scroll-animate';

export interface Testimonial {
  id: string;
  /** The quote itself, without surrounding quote marks — the card adds them. */
  quote: string;
  /** Attribution name. Omit for anonymous entries. */
  name?: string;
  /** "Founder, Acme" — role and company on one line. */
  role?: string;
  /** Avatar image URL. Falls back to initials. */
  avatarUrl?: string;
  /** 0–5, halves allowed. Defaults to 5. */
  rating?: number;
}

/**
 * Reference-format placeholder content.
 *
 * These are NOT customer testimonials and must not be shipped as though they
 * were. They exist so the layout can be reviewed with realistic text lengths
 * before real quotes are collected. Deliberately unattributed — inventing a
 * named person or company endorsing the product would be a fabricated review,
 * and those have a habit of surviving into production.
 *
 * Replace with real, permissioned quotes and delete this export.
 */
export const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  { id: 'p1', quote: 'Placeholder — replace with a real customer quote. Two sentences is the length that reads best in this card.', role: 'Role, Company' },
  { id: 'p2', quote: 'Placeholder — the strongest quotes lead with a number: time saved, cost avoided, revenue added.', role: 'Role, Company' },
  { id: 'p3', quote: 'Placeholder — keep it to one concrete outcome. Lists of adjectives do not persuade anyone.', role: 'Role, Company' },
  { id: 'p4', quote: 'Placeholder — a quote that names the alternative considered is worth more than a generic compliment.', role: 'Role, Company' },
  { id: 'p5', quote: 'Placeholder — short quotes sit next to long ones without breaking the grid.', role: 'Role, Company' },
  { id: 'p6', quote: 'Placeholder — collect these with written permission and store the consent alongside the quote.', role: 'Role, Company' },
];

function initials(name?: string): string {
  if (!name) return '';
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: 280, sm: 330 },
        flexShrink: 0,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRadius: `${RADIUS.card}px`,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: SHADOWS.card,
        bgcolor: 'background.paper',
      }}
    >
      <Rating
        value={item.rating ?? 5}
        precision={0.5}
        readOnly
        size="small"
        icon={<StarRoundedIcon fontSize="inherit" />}
        emptyIcon={<StarRoundedIcon fontSize="inherit" />}
        sx={{ color: '#F5B301', '& .MuiRating-iconEmpty': { color: 'action.disabledBackground' } }}
      />

      <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '0.9375rem', lineHeight: 1.6 }}>
        &ldquo;{item.quote}&rdquo;
      </Typography>

      {(item.name || item.role) && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar src={item.avatarUrl} sx={{ width: 40, height: 40, fontSize: '0.875rem' }}>
            {initials(item.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            {item.name && (
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                {item.name}
              </Typography>
            )}
            {item.role && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {item.role}
              </Typography>
            )}
          </Box>
        </Stack>
      )}
    </Paper>
  );
}

/**
 * One marquee row. The list is rendered twice back-to-back and translated by
 * exactly -50%, so the loop point lands on an identical frame and reads as
 * continuous. Halted entirely under prefers-reduced-motion — an endlessly
 * moving wall of text is a genuine accessibility problem, not a nicety.
 */
function MarqueeRow({
  items,
  durationSec,
  reverse = false,
}: {
  items: Testimonial[];
  durationSec: number;
  reverse?: boolean;
}) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <Box sx={{ overflow: 'hidden', width: '100%', py: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          gap: 2.5,
          width: 'max-content',
          animation: `marquee-${reverse ? 'rev' : 'fwd'} ${durationSec}s linear infinite`,
          '&:hover': { animationPlayState: 'paused' },
          '@keyframes marquee-fwd': {
            from: { transform: 'translateX(0)' },
            to: { transform: 'translateX(-50%)' },
          },
          '@keyframes marquee-rev': {
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
        {doubled.map((t, i) => (
          <TestimonialCard key={`${t.id}-${i}`} item={t} />
        ))}
      </Box>
    </Box>
  );
}

export interface TestimonialsBlockProps {
  /** Section heading. Keep it short — this is a claim, not a sentence. */
  heading?: string;
  /** One line under the heading. Optional; omit rather than padding it out. */
  subheading?: string;
  items?: Testimonial[];
}

/**
 * Testimonial wall — two counter-scrolling rows of quote cards.
 *
 * Splits `items` in half so the two rows never show the same card at the same
 * horizontal position, which is what stops the wall reading as a repeat.
 */
export function TestimonialsBlock({
  heading = 'What customers say',
  subheading,
  items = [],
}: TestimonialsBlockProps) {
  if (items.length === 0) {
    return (
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 1 }}>{heading}</Typography>
        <Typography color="text.secondary">
          No testimonials yet. Add real, permissioned quotes to show this section.
        </Typography>
      </Box>
    );
  }

  const mid = Math.ceil(items.length / 2);
  const rowA = items.slice(0, mid);
  const rowB = items.slice(mid).length > 0 ? items.slice(mid) : rowA;

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <BlockAnimateRoot>
        <Box sx={{ textAlign: 'center', px: 3, mb: 4 }}>
          <Typography variant="h3">{heading}</Typography>
          {subheading && (
            <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 560, mx: 'auto' }}>
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
          <MarqueeRow items={rowA} durationSec={60} />
          <MarqueeRow items={rowB} durationSec={75} reverse />
        </Box>
      </BlockAnimateRoot>
    </Box>
  );
}

/**
 * Registry adapter — the block system passes an untyped config object.
 *
 * Quotes come from `config.items` so they live in page data, not in code.
 * With none supplied the block renders its empty state rather than inventing
 * social proof.
 */
export function TestimonialsBlockAdapter({ config }: { config: Record<string, unknown> }) {
  const raw = Array.isArray(config.items) ? (config.items as unknown[]) : [];
  const items: Testimonial[] = raw.flatMap((entry, i) => {
    if (typeof entry !== 'object' || entry === null) return [];
    const e = entry as Record<string, unknown>;
    if (typeof e.quote !== 'string' || e.quote.trim() === '') return [];
    return [{
      id: typeof e.id === 'string' ? e.id : `t${i}`,
      quote: e.quote,
      name: typeof e.name === 'string' ? e.name : undefined,
      role: typeof e.role === 'string' ? e.role : undefined,
      avatarUrl: typeof e.avatarUrl === 'string' ? e.avatarUrl : undefined,
      rating: typeof e.rating === 'number' ? e.rating : undefined,
    }];
  });

  return (
    <TestimonialsBlock
      heading={typeof config.heading === 'string' ? config.heading : undefined}
      subheading={typeof config.subheading === 'string' ? config.subheading : undefined}
      items={items}
    />
  );
}
