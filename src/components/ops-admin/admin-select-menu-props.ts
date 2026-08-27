import type { MenuProps } from '@mui/material/Menu';

/**
 * Shared MenuProps for admin `<Select>`s on mobile.
 *
 * Sticky section chrome (`zIndex: 1000`) and `overflow: hidden` panels can leave
 * the menu list clipped or stacked under the app bar when available-space math
 * goes wrong. Force a viewport-relative max height, pin below the anchor, and
 * keep the portal on `document.body` with a modal-tier z-index.
 */
export const ADMIN_SELECT_MENU_PROPS: Partial<MenuProps> = {
  disablePortal: false,
  keepMounted: false,
  anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  marginThreshold: 8,
  slotProps: {
    root: {
      sx: { zIndex: (theme) => theme.zIndex.modal + 2 },
    },
    paper: {
      sx: {
        maxHeight: 'min(50vh, 360px)',
        overflowY: 'auto',
      },
    },
  },
};
