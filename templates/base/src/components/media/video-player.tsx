'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  width?: number | string;
  height?: number | string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  width = '100%',
  height = 'auto',
  autoPlay = false,
  loop = false,
  muted = false,
  controls = true,
}: VideoPlayerProps) {
  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 1 }}>
      <Box
        component="video"
        src={src}
        poster={poster}
        width={width}
        height={height}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline
        sx={{ display: 'block', maxWidth: '100%', bgcolor: 'common.black' }}
      />
    </Paper>
  );
}
