'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface StudioWarmBannerProps {
  model: string;
}

/** Shown in the conversation panel while Mac Studio loads model weights. */
export function StudioWarmBanner({ model }: StudioWarmBannerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        mb: 1.5,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
          maxWidth: '82%',
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <CircularProgress size={16} thickness={5} aria-label="Loading model" />
          <Typography variant="body2" color="text.secondary">
            Mac Studio is loading {model} — first reply may take a minute. You can switch
            models in the picker above if this takes too long.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
