'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import type { ChatStreamProgressStep } from '@/store/chat-stream-slice';

function humanizeToolName(name: string): string {
  return name.replace(/_/g, ' ');
}

interface AssistantStreamProgressProps {
  steps: ChatStreamProgressStep[];
  /** When true, show a spinner next to the active status / running tool. */
  isStreaming: boolean;
  /** Assistant has started emitting reply text. */
  hasContent: boolean;
}

/**
 * In-card status strip for the streaming assistant message.
 * Driven by SSE `status` / `thinking` / `tool` events — not the Tools & Options tray.
 */
export function AssistantStreamProgress({
  steps,
  isStreaming,
  hasContent,
}: AssistantStreamProgressProps) {
  const status = steps.find((step) => step.kind === 'status');
  const thinking = steps.find((step) => step.kind === 'thinking');
  const tools = steps.filter((step) => step.kind === 'tool');
  const hasActiveTool = tools.some((step) => step.kind === 'tool' && step.phase === 'start');
  const showSpinner = isStreaming && (!hasContent || hasActiveTool || Boolean(status));

  if (!isStreaming && steps.length === 0) return null;
  if (!status && !thinking && tools.length === 0 && !showSpinner) return null;

  return (
    <Stack spacing={0.75} sx={{ mb: hasContent ? 1 : 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minHeight: 22 }}>
        {showSpinner ? (
          <CircularProgress size={16} thickness={5} color="primary" aria-label="Assistant working" />
        ) : null}
        {status?.kind === 'status' ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {status.message}
          </Typography>
        ) : showSpinner && !hasContent ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Thinking…
          </Typography>
        ) : null}
      </Stack>

      {thinking?.kind === 'thinking' && thinking.content ? (
        <Box
          sx={{
            pl: 1,
            borderLeft: '2px solid',
            borderColor: 'divider',
            maxHeight: 96,
            overflow: 'auto',
          }}
        >
          <Typography variant="caption" color="text.secondary" component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
            {thinking.content}
          </Typography>
        </Box>
      ) : null}

      {tools.length > 0 ? (
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {tools.map((step) => {
            if (step.kind !== 'tool') return null;
            const running = step.phase === 'start';
            return (
              <Chip
                key={step.id}
                size="small"
                variant="outlined"
                color={running ? 'primary' : 'default'}
                icon={running ? <BuildCircleOutlinedIcon /> : <CheckCircleOutlineOutlinedIcon />}
                label={running ? `Using ${humanizeToolName(step.name)}…` : humanizeToolName(step.name)}
                sx={{ height: 24, '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' } }}
              />
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
}
