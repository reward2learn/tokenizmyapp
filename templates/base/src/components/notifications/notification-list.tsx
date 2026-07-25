'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import type { Notification } from '@/store/apis/notification-api';
import { NotificationItem } from '@/components/notifications/notification-item';

interface NotificationListProps {
  notifications: Notification[];
  /** Called when the user requests a manual refresh. */
  onRefresh?: () => void;
}

/**
 * Scrollable list of notification items with read/dismiss actions.
 * Renders an empty-state message when there are no notifications.
 */
export function NotificationList({ notifications, onRefresh }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          You&apos;re all caught up.
        </Typography>
        {onRefresh ? (
          <Button size="small" variant="text" onClick={onRefresh} sx={{ mt: 1 }}>
            Refresh
          </Button>
        ) : null}
      </Box>
    );
  }

  return (
    <List disablePadding>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
      {onRefresh ? (
        <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
          <Button size="small" variant="text" onClick={onRefresh}>
            Refresh
          </Button>
        </Box>
      ) : null}
    </List>
  );
}
