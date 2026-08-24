'use client';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { AuthGate } from '@/components/auth/auth-gate';
import { SignInPanelGate } from '@/components/auth/sign-in-panel';
import { SettingsGate } from '@/components/settings/settings-gate';
import { SettingsLogoutButton } from '@/components/settings/settings-panel';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettingsDialogOpen } from '@/store/ui-slice';
import { RADIUS } from '@/theme/design-tokens';

/**
 * Settings as a modal, over whatever page the user is on.
 *
 * Same content as `/settings` — deliberately the same `SettingsGate`, not a
 * parallel copy — because the two are one surface reached two ways. The route
 * stays linkable; the dialog is what the drawer's cog and the header billing
 * controls open, so changing a plan or topping up never loses the page the
 * user was working on.
 *
 * Nothing is mounted while it is closed: MUI's Modal renders null, so the
 * organization and credits queries inside only fire once it is actually
 * opened rather than on every page in the app.
 */
export function SettingsDialog() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((s) => s.ui.settingsDialogOpen);
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'), { defaultMatches: false });
  const close = () => dispatch(setSettingsDialogOpen(false));

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      fullScreen={isCompact}
      maxWidth="lg"
      aria-labelledby="settings-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: isCompact ? 0 : `${RADIUS.card}px`,
            maxHeight: isCompact ? '100%' : '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <DialogTitle
        id="settings-dialog-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1, flexShrink: 0 }}
      >
        Settings
        <IconButton aria-label="Close settings" onClick={close} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: { xs: 1.5, md: 2 },
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <AuthGate requiredTier="google" fallback={<SignInPanelGate requiredTier="google" />}>
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <SettingsGate variant="dialog" />
          </Box>
        </AuthGate>
      </DialogContent>
      <DialogActions
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'flex-start',
        }}
      >
        <SettingsLogoutButton />
      </DialogActions>
    </Dialog>
  );
}
