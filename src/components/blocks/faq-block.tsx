'use client';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MarkdownBody } from '@/components/blocks/markdown-body';

/**
 * FAQ accordion.
 *
 * Placed after the capability and proof sections on purpose (roadmap §1.12):
 * these are objections, and an objection answered before it is felt reads as a
 * warning. Answers render as markdown so a numbered how-it-works list stays a
 * list instead of one run-on paragraph.
 *
 * Emits FAQPage JSON-LD alongside the visible accordion — this is the one
 * section on the page search engines and AI assistants quote directly, and the
 * structured data is what makes them quote it correctly.
 */

export interface FaqItem {
  question: string;
  /** Markdown. Keep to a short paragraph or a numbered list. */
  answer: string;
}

export function FaqBlock({ config }: { config: Record<string, unknown> }) {
  const heading =
    typeof config.heading === 'string' ? config.heading : 'Frequently asked questions';

  const items: FaqItem[] = Array.isArray(config.items)
    ? (config.items as unknown[]).flatMap((entry) => {
        if (typeof entry !== 'object' || entry === null) return [];
        const e = entry as Record<string, unknown>;
        if (typeof e.question !== 'string' || typeof e.answer !== 'string') return [];
        return [{ question: e.question, answer: e.answer }];
      })
    : [];

  if (items.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 }, px: 3 }}>
      <script
        type="application/ld+json"
        // Serialized from data we constructed, never from user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Typography variant="h3" sx={{ textAlign: 'center', mb: 4 }}>
        {heading}
      </Typography>
      <Box sx={{ maxWidth: 780, mx: 'auto' }}>
        {items.map((item) => (
          <Accordion
            key={item.question}
            disableGutters
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              '&:not(:last-child)': { borderBottom: 0 },
              '&::before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: 600 }}>{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <MarkdownBody markdown={item.answer} />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
