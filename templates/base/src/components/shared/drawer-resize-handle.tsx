'use client';

import Box from '@mui/material/Box';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { DrawerAnchor } from '@/hooks/use-resizable-drawer-width';

interface DrawerResizeHandleProps {
  anchor: DrawerAnchor;
  onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
}

export function DrawerResizeHandle({ anchor, onPointerDown }: DrawerResizeHandleProps) {
  return (
    <Box
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize drawer"
      onPointerDown={onPointerDown}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        ...(anchor === 'right' ? { left: 0 } : { right: 0 }),
        width: 8,
        cursor: 'col-resize',
        zIndex: 2,
        transform: anchor === 'right' ? 'translateX(-50%)' : 'translateX(50%)',
        touchAction: 'none',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 2,
          height: 40,
          borderRadius: 1,
          bgcolor: 'divider',
          transition: 'background-color 150ms',
        },
        '&:hover::before, &:active::before': {
          bgcolor: 'primary.main',
        },
      }}
    />
  );
}
