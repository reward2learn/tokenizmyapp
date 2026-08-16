'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import GroupWorkOutlinedIcon from '@mui/icons-material/GroupWorkOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import type { SvgIconComponent } from '@mui/icons-material';
import { RADIUS } from '@/theme/design-tokens';

export interface FeatureItem {
  icon: SvgIconComponent;
  title: string;
  body: string;
}

/**
 * Default capability set.
 *
 * Copy rule for this block: one claim per card, stated as a fact rather than a
 * promise, and no sentence that survives deletion. Anything that could be said
 * about any SaaS product ("powerful", "seamless", "enterprise-grade") is noise
 * and belongs nowhere on the page.
 */
export const DEFAULT_FEATURES: FeatureItem[] = [
  {
    icon: LockOutlinedIcon,
    title: 'Private AI',
    body: 'Reporting, planning and analytics run against your tenant only. Your figures are never used to train a shared model.',
  },
  {
    icon: InsightsOutlinedIcon,
    title: 'Budgets and forecasts',
    body: 'Track budget against actuals and forecast forward. Variance shows up the day it appears, not at month end.',
  },
  {
    icon: AccountTreeOutlinedIcon,
    title: 'Umbrella reporting',
    body: 'Every department app rolls up into one view, so insight is read across the business rather than per silo.',
  },
  {
    icon: TaskAltOutlinedIcon,
    title: 'Daily tasks',
    body: 'Turn any finding into an assigned task with an owner and a due date. Nothing stops at the analysis.',
  },
  {
    icon: TuneOutlinedIcon,
    title: 'No code, fully customisable',
    body: 'Describe the app you need. Change any page, field or rule afterwards without waiting on an engineer.',
  },
  {
    icon: WidgetsOutlinedIcon,
    title: 'App packs per department',
    body: 'Generate a dedicated app for finance, ops, sales or HR. Each gets its own deployment on shared tenant data.',
  },
  {
    icon: GroupWorkOutlinedIcon,
    title: 'Data security groups',
    body: 'Scope records to a security group. Users see their group and nothing else, enforced server-side.',
  },
  {
    icon: VerifiedUserOutlinedIcon,
    title: 'Role-based privacy',
    body: 'Roles decide who reads, edits and exports. Every access is attributable to a named account.',
  },
];

function FeatureCard({ item }: { item: FeatureItem }) {
  const Icon = item.icon;
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        borderRadius: `${RADIUS.card}px`,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'grid',
          placeItems: 'center',
          borderRadius: `${RADIUS.control}px`,
          bgcolor: 'action.hover',
          color: 'primary.main',
        }}
      >
        <Icon fontSize="small" />
      </Box>
      <Typography variant="h6" sx={{ fontSize: '1rem' }}>
        {item.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {item.body}
      </Typography>
    </Paper>
  );
}

export interface FeatureGridBlockProps {
  heading?: string;
  subheading?: string;
  items?: FeatureItem[];
}

/** Capability grid — the "what you actually get" section. */
export function FeatureGrid({
  heading = 'Everything the business runs on, in one tenant',
  subheading = 'Private AI for planning and analysis, department apps generated on demand, and access controlled down to the record.',
  items = DEFAULT_FEATURES,
}: FeatureGridBlockProps) {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 }, px: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 5, maxWidth: 680, mx: 'auto' }}>
        <Typography variant="h3">{heading}</Typography>
        {subheading && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            {subheading}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          maxWidth: 1120,
          mx: 'auto',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        {items.map((item) => (
          <FeatureCard key={item.title} item={item} />
        ))}
      </Box>
    </Box>
  );
}

/** Registry adapter — the block system passes an untyped config object. */
export function FeatureGridBlock({ config }: { config: Record<string, unknown> }) {
  return (
    <FeatureGrid
      heading={typeof config.heading === 'string' ? config.heading : undefined}
      subheading={typeof config.subheading === 'string' ? config.subheading : undefined}
    />
  );
}
