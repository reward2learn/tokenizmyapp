'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { RADIUS, SHADOWS } from '@/theme/design-tokens';

/**
 * Customer case-study cards — industry pill plus two hard metrics.
 *
 * The format is deliberate (roadmap §1.11): an industry a reader recognises as
 * theirs, then two numbers. Adjectives do not move anyone; "€250k saved" and
 * "46 apps built" do.
 *
 * ## Nothing ships here by default, and that is the point
 *
 * Case studies are claims about named third parties. Populating this from a
 * competitor's customer list — the same businesses, the same metrics, a
 * different product name over the top — would be fabricated proof about real
 * people who never said it. The block renders nothing until `items` holds
 * customers of *this* platform who agreed to appear.
 *
 * Every field below should come from something in writing: the metric, the
 * permission to publish it, and the permission to use the business name.
 */

export interface CustomerProofItem {
  /** Industry label — the reader is scanning for their own. */
  industry: string;
  /** Business name, used with permission. */
  name: string;
  /** Two metrics. More dilutes; one looks cherry-picked. */
  metrics: { value: string; label: string }[];
  /** Optional link to the full case study on our own site. */
  href?: string;
}

function ProofCard({ item }: { item: CustomerProofItem }) {
  const card = (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: `${RADIUS.card}px`,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: SHADOWS.card,
        transition: 'border-color 120ms',
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Stack spacing={2}>
        <Chip label={item.industry} size="small" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {item.name}
        </Typography>
        <Stack direction="row" spacing={3}>
          {item.metrics.slice(0, 2).map((metric) => (
            <Box key={metric.label}>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                {metric.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {metric.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );

  if (!item.href) return card;
  return (
    <Link href={item.href as never} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      {card}
    </Link>
  );
}

export function CustomerProofBlock({ config }: { config: Record<string, unknown> }) {
  const heading = typeof config.heading === 'string' ? config.heading : 'Customer results';

  const items: CustomerProofItem[] = Array.isArray(config.items)
    ? (config.items as unknown[]).flatMap((entry) => {
        if (typeof entry !== 'object' || entry === null) return [];
        const e = entry as Record<string, unknown>;
        if (typeof e.industry !== 'string' || typeof e.name !== 'string') return [];
        const metrics = Array.isArray(e.metrics)
          ? (e.metrics as unknown[]).flatMap((m) => {
              if (typeof m !== 'object' || m === null) return [];
              const mm = m as Record<string, unknown>;
              if (typeof mm.value !== 'string' || typeof mm.label !== 'string') return [];
              return [{ value: mm.value, label: mm.label }];
            })
          : [];
        if (metrics.length === 0) return [];
        return [{
          industry: e.industry,
          name: e.name,
          metrics,
          href: typeof e.href === 'string' ? e.href : undefined,
        }];
      })
    : [];

  // Renders nothing rather than a placeholder. An empty "Trusted by" strip is
  // worse than no strip, and invented logos are worse than either.
  if (items.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 }, px: 3 }}>
      <Typography variant="h3" sx={{ textAlign: 'center', mb: 4 }}>
        {heading}
      </Typography>
      <Grid container spacing={3} sx={{ maxWidth: 1100, mx: 'auto' }}>
        {items.map((item) => (
          <Grid key={item.name} size={{ xs: 12, sm: 6, md: 4 }}>
            <ProofCard item={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
