'use client';

import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { parseBlockConfig } from '@/lib/schemas/block-config';
import { useGetDashboardDataQuery } from '@/store/apis/dashboard-api';

export function ActionChecklistBlock({ config }: { config: Record<string, unknown> }) {
  const { heading, subheading } = parseBlockConfig('action_checklist', config);
  const { data, isLoading } = useGetDashboardDataQuery();
  const [expanded, setExpanded] = useState<string | false>('P1');

  const phases = !isLoading && data?.data?.actionPhases?.length
    ? data.data.actionPhases
    : null;

  if (isLoading) return null;

  if (!phases?.length) {
    return (
      <Box component="section" sx={{ mx: 'auto', px: 3, py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No action plan has been loaded yet. Add tasks in Admin or generate content from your financial data.
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="section" sx={{ mx: 'auto', px: 3, py: 4 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, textAlign: 'center', mb: 1 }}>
        {heading ?? 'Step-by-Step Action Plan'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3, maxWidth: 520, mx: 'auto' }}>
        {subheading ??
          'Three phases from survival to sustainable profitability. Click each phase to expand.'}
      </Typography>
      {phases.map((phase) => (
        <Accordion
          key={phase.id}
          expanded={expanded === phase.id}
          onChange={(_, isExpanded) => setExpanded(isExpanded ? phase.id : false)}
          elevation={0}
          sx={{
            mb: 1.5,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {phase.title}{' '}
                <Typography component="span" variant="body2" color="text.secondary">
                  — {phase.period}
                </Typography>
              </Typography>
              <Typography
                variant="caption"
                color="primary"
                sx={{ display: 'block', mt: 0.25, fontWeight: 500, lineHeight: 1.3, wordBreak: 'break-word' }}
              >
                {phase.impact}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {phase.actions.map((action) => (
              <Typography key={action} variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
                • {action}
              </Typography>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
