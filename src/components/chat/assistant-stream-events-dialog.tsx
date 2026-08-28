'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ChatStreamEventLogEntry } from '@/store/chat-stream-slice';

function formatEventTime(at: number): string {
  try {
    return new Date(at).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '';
  }
}

function humanizeToolName(name: string): string {
  return name.replace(/_/g, ' ');
}

interface AssistantStreamEventsDialogProps {
  open: boolean;
  onClose: () => void;
  events: ChatStreamEventLogEntry[];
}

/**
 * Modal timeline of the full SSE progress capture for one assistant turn
 * (status / thinking / tool / error) — opened from the message ⋮ menu.
 */
export function AssistantStreamEventsDialog({
  open,
  onClose,
  events,
}: AssistantStreamEventsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Event stream</DialogTitle>
      <DialogContent dividers>
        {events.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No progress events were captured for this reply.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {events.map((event, index) => {
              const key = `${event.type}-${event.at}-${index}`;
              switch (event.type) {
                case 'status':
                  return (
                    <Box key={key}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25 }}>
                        <Chip size="small" label="status" color="default" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          {formatEventTime(event.at)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        {event.message}
                      </Typography>
                    </Box>
                  );
                case 'thinking':
                  return (
                    <Box key={key}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25 }}>
                        <Chip size="small" label="thinking" color="secondary" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          {formatEventTime(event.at)}
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        component="pre"
                        color="text.secondary"
                        sx={{
                          m: 0,
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit',
                          maxHeight: 160,
                          overflow: 'auto',
                        }}
                      >
                        {event.content}
                      </Typography>
                    </Box>
                  );
                case 'tool':
                  return (
                    <Box key={key}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25 }}>
                        <Chip
                          size="small"
                          label={`tool · ${event.phase}`}
                          color={event.phase === 'start' ? 'primary' : 'success'}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatEventTime(event.at)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2">
                        {humanizeToolName(event.name)}
                        {event.callId ? (
                          <Typography
                            component="span"
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            {event.callId}
                          </Typography>
                        ) : null}
                      </Typography>
                    </Box>
                  );
                case 'error':
                  return (
                    <Box key={key}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.25 }}>
                        <Chip size="small" label="error" color="error" variant="outlined" />
                        <Typography variant="caption" color="text.secondary">
                          {formatEventTime(event.at)}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="error.main">
                        {event.error}
                      </Typography>
                    </Box>
                  );
                default: {
                  const _exhaustive: never = event;
                  return _exhaustive;
                }
              }
            })}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
