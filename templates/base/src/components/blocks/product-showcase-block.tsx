'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WidgetsIcon from '@mui/icons-material/Widgets';
import { RADIUS, SHADOWS } from '@/theme/design-tokens';
import { BlockAnimateContainer, BlockAnimateRoot } from '@/components/blocks/block-scroll-animate';

/**
 * "From idea to published app in minutes" — the capability argument.
 *
 * Ordered to answer objections in the sequence a buyer raises them (roadmap
 * §1.12): can it build the thing, is anything missing, can I ship it, will it
 * hold up, and can I let my team near it. Reordering these breaks the argument
 * even though each card still reads fine on its own.
 *
 * Claims here must stay things the platform actually does. Every card below
 * maps to shipped capability — chat-driven generation, the built-in auth /
 * database / AI layer, Vercel deploys with custom domains, serverless scaling,
 * and the security-groups RBAC work.
 */

const ICONS = {
  chat: ChatBubbleOutlineIcon,
  builtin: WidgetsIcon,
  publish: RocketLaunchIcon,
  scale: TrendingUpIcon,
  govern: VerifiedUserIcon,
} as const;

type IconKey = keyof typeof ICONS;

interface ShowcaseItem {
  icon: IconKey;
  title: string;
  body: string;
}

function isIconKey(value: unknown): value is IconKey {
  return typeof value === 'string' && value in ICONS;
}

export function ProductShowcaseBlock({ config }: { config: Record<string, unknown> }) {
  const heading =
    typeof config.heading === 'string'
      ? config.heading
      : 'From idea to published app in minutes';
  const subheading = typeof config.subheading === 'string' ? config.subheading : undefined;

  const items: ShowcaseItem[] = Array.isArray(config.items)
    ? (config.items as unknown[]).flatMap((entry) => {
        if (typeof entry !== 'object' || entry === null) return [];
        const e = entry as Record<string, unknown>;
        if (typeof e.title !== 'string' || typeof e.body !== 'string') return [];
        return [{
          icon: isIconKey(e.icon) ? e.icon : 'builtin',
          title: e.title,
          body: e.body,
        }];
      })
    : [];

  if (items.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 }, px: 3 }}>
      <BlockAnimateRoot>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h3">{heading}</Typography>
          {subheading && (
            <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 640, mx: 'auto' }}>
              {subheading}
            </Typography>
          )}
        </Box>

        <Grid container spacing={3} sx={{ maxWidth: 1100, mx: 'auto' }}>
          {items.map((item, index) => {
            const Icon = ICONS[item.icon];
            return (
              <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
                <BlockAnimateContainer index={1 + index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      borderRadius: `${RADIUS.card}px`,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: SHADOWS.card,
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: `${RADIUS.card}px`,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'action.hover',
                        }}
                      >
                        <Icon color="primary" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                        {item.body}
                      </Typography>
                    </Stack>
                  </Paper>
                </BlockAnimateContainer>
              </Grid>
            );
          })}
        </Grid>
      </BlockAnimateRoot>
    </Box>
  );
}
