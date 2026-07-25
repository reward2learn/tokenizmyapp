'use client';

import { useState } from 'react';
import { type SxProps, type Theme } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import BellIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {
  useGetUnreadCountQuery,
  useListNotificationsQuery,
  useMarkAllReadMutation,
} from '@/store/apis/notification-api';
import { NotificationList } from '@/components/notifications/notification-list';

interface NotificationBellProps {
  /** Optional override for the icon button sx. */
  sx?: SxProps<Theme>;
}

/**
 * Notification bell — badge with unread count, opens a popover with the
 * notification list. Polls unread count while mounted; fetches the full
 * list lazily when the popover is opened.
 */
export function NotificationBell({ sx }: NotificationBellProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data: countData, isLoading: countLoading } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30_000,
  });
  const {
    data: listData,
    isLoading: listLoading,
    isError,
    refetch,
  } = useListNotificationsQuery(undefined, {
    skip: !open,
  });
  const [markAllRead, { isLoading: markingAll }] = useMarkAllReadMutation();

  const unreadCount = countData?.success ? countData.data.count : 0;
  const notifications = listData?.success ? listData.data.notifications : [];

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch (err) {
      console.error('[notification-bell] mark all read failed:', err);
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          aria-label="Notifications"
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={sx}
        >
          {countLoading && unreadCount === 0 ? (
            <BellIcon />
          ) : (
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <BellIcon />
            </Badge>
          )}
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 320, sm: 380 },
              maxHeight: 480,
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, px: 2, py: 1.5 }}>
          <BellIcon fontSize="small" color="action" />
          <Typography variant="subtitle2" sx={{ flex: 1 }}>
            Notifications
          </Typography>
          {unreadCount > 0 ? (
            <Tooltip title="Mark all as read">
              <IconButton
                size="small"
                onClick={() => void handleMarkAllRead()}
                disabled={markingAll}
                aria-label="Mark all as read"
              >
                {markingAll ? <CircularProgress size={16} /> : <DoneAllIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
        <Divider />
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {listLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : isError ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Failed to load notifications.
            </Typography>
          ) : (
            <NotificationList notifications={notifications} onRefresh={refetch} />
          )}
        </Box>
      </Popover>
    </>
  );
}
