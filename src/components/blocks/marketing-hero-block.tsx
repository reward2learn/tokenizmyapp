'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { RADIUS } from '@/theme/design-tokens';

/**
 * Prompt-first landing hero (roadmap §7.1).
 *
 * The order matters: describe → build → *then* sign in. A signup wall in front
 * of the first useful action is the single biggest drop-off in this funnel, and
 * the platform can already turn a natural-language brief into an app, so the
 * capability the wall was protecting is the thing worth showing first.
 *
 * The quick-start pills prefill the box rather than navigating. Someone who
 * cannot think of an idea in the first five seconds leaves; handing them a
 * starting sentence they can edit costs nothing and keeps them in the flow.
 */

export interface MarketingHeroProps {
  headline: string;
  subheadline: string;
  /** Audience categories, shown as plain chips under the subheadline. */
  audiences: string[];
  /** Quick-start ideas. Clicking one prefills the prompt box. */
  quickStarts: string[];
  placeholder: string;
  ctaLabel: string;
  /** Where the prompt is submitted. The prompt travels as ?prompt=. */
  ctaHref: string;
}

export function MarketingHeroBlock({ config }: { config: Record<string, unknown> }) {
  const props = readConfig(config);
  const router = useRouter();
  const [prompt, setPrompt] = useState('');

  const submit = () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    // Prompt in the query string so the destination can pick it up without a
    // store round-trip — the user may not have a session yet.
    router.push(`${props.ctaHref}?prompt=${encodeURIComponent(trimmed)}` as never);
  };

  return (
    <Box
      component="section"
      sx={{
        textAlign: 'center',
        px: 3,
        pt: { xs: 8, md: 12 },
        pb: { xs: 6, md: 9 },
        background: (theme) =>
          `radial-gradient(ellipse 80% 60% at 50% 30%, rgba(235, 61, 40, 0.10) 0%, transparent 70%), ${theme.palette.background.default}`,
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        sx={{ fontWeight: 700, maxWidth: 820, mx: 'auto', lineHeight: 1.12 }}
      >
        {props.headline}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mt: 2.5, maxWidth: 620, mx: 'auto', fontSize: { xs: '1rem', md: '1.125rem' } }}
      >
        {props.subheadline}
      </Typography>

      {props.audiences.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 3, justifyContent: 'center', flexWrap: 'wrap', rowGap: 1 }}
        >
          {props.audiences.map((audience) => (
            <Chip key={audience} label={audience} size="small" variant="outlined" />
          ))}
        </Stack>
      )}

      <Box sx={{ mt: 4, maxWidth: 680, mx: 'auto' }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          maxRows={6}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={props.placeholder}
          onKeyDown={(e) => {
            // Enter submits; Shift+Enter keeps the newline. Matches the chat
            // composer, which is the same gesture in the same product.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <AutoAwesomeIcon fontSize="small" color="primary" />
                </InputAdornment>
              ),
              sx: { borderRadius: `${RADIUS.card}px`, alignItems: 'flex-start', py: 1.5 },
            },
          }}
        />

        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={submit}
          disabled={!prompt.trim()}
          sx={{ mt: 2, px: 4 }}
        >
          {props.ctaLabel}
        </Button>
      </Box>

      {props.quickStarts.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 3, justifyContent: 'center', flexWrap: 'wrap', rowGap: 1 }}
        >
          {props.quickStarts.map((idea) => (
            <Chip
              key={idea}
              label={idea}
              size="small"
              onClick={() => setPrompt(`Build ${article(idea)} ${asPhrase(idea)} for my business`)}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

/**
 * Fold a quick-start label into running prose.
 *
 * Acronyms keep their case — "Build a crm for my business" reads as a typo,
 * which is not the first impression this box should make. Everything else
 * drops its leading capital so it sits inside the sentence.
 */
function asPhrase(label: string): string {
  if (label === label.toUpperCase()) return label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

/** "an ERP", "a CRM" — read from the first spoken sound, not the letter. */
function article(label: string): string {
  const first = asPhrase(label).charAt(0).toUpperCase();
  // Letters whose name begins with a vowel sound, for the acronym case.
  const soundsVowel = label === label.toUpperCase()
    ? 'AEFHILMNORSX'.includes(first)
    : 'AEIOU'.includes(first);
  return soundsVowel ? 'an' : 'a';
}

function readStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
}

function readConfig(config: Record<string, unknown>): MarketingHeroProps {
  return {
    headline:
      typeof config.headline === 'string' ? config.headline : 'Build software for your business',
    subheadline:
      typeof config.subheadline === 'string'
        ? config.subheadline
        : 'Describe what you need and get a working app.',
    audiences: readStrings(config.audiences),
    quickStarts: readStrings(config.quickStarts),
    placeholder:
      typeof config.placeholder === 'string'
        ? config.placeholder
        : 'Describe the app you want to build…',
    ctaLabel: typeof config.ctaLabel === 'string' ? config.ctaLabel : 'Try it',
    ctaHref: typeof config.ctaHref === 'string' ? config.ctaHref : '/admin',
  };
}
