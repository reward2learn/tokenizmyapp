'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import SuccessIcon from '@mui/icons-material/CheckCircleOutlined';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorIcon from '@mui/icons-material/ErrorOutlineOutlined';
import AiTaskIcon from '@mui/icons-material/SmartToyOutlined';
import type { Notification } from '@/store/apis/notification-api';
import {
  useMarkReadMutation,
  useDismissNotificationMutation,
} from '@/store/apis/notification-api';

const TYPE_COLORS: Record<string, string> = {
  info: 'info.main',
  success: 'success.main',
  warning: 'warning.main',
  error: 'error.main',
  'ai-task': 'secondary.main',
};

function getTypeIcon(type: string) {
  switch (type) {
    case 'success':
      return <SuccessIcon fontSize="small" />;
    case 'warning':
      return <WarningIcon fontSize="small" />;
    case 'error':
      return <ErrorIcon fontSize="small" />;
    case 'ai-task':
      return <AiTaskIcon fontSize="small" />;
    default:
      return <InfoIcon fontSize="small" />;
  }
}

function formatTimestamp(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diff = now - d.getTime();
  const min = 60_000;
  const hour = 60 * min;
  const day = 24 * hour;
  if (diff < min) return 'just now';
  if (diff < hour) return `${Math.floor(diff / min)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return d.toLocaleDateString();
}

interface NotificationItemProps {
  notification: Notification;
}

/**
 * Individual notification row with read/unread styling, a type icon,
 * timestamp, and mark-read / dismiss actions. Clicking the row navigates
 * to the notification's linkUrl when present (and marks it as read).
 */
export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const [markRead, { isLoading: markingRead }] = useMarkReadMutation();
  const [dismiss, { isLoading: dismissing }] = useDismissNotificationMutation();

  const color = TYPE_COLORS[notification.type] ?? TYPE_COLORS.info;
  const timestamp = useMemo(() => formatTimestamp(notification.createdAt), [notification.createdAt]);

  const handleClick = async () => {
    if (!notification.isRead) {
      try {
        await markRead(notification.id).unwrap();
      } catch (err) {
        console.error('[notification-item] mark read failed:', err);
      }
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  };

  const handleMarkRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markRead(notification.id).unwrap();
    } catch (err) {
      console.error('[notification-item] mark read failed:', err);
    }
  };

  const handleDismiss = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dismiss(notification.id).unwrap();
    } catch (err) {
      console.error('[notification-item] dismiss failed:', err);
    }
  };

  const isBusy = markingRead || dismissing;

  return (
    <ListItem
      divider
      onClick={handleClick}
      sx={{
        py: 1.5,
        px: 2,
        cursor: notification.linkUrl ? 'pointer' : 'default',
        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
        '&:hover': { bgcolor: 'action.selected' },
        transition: 'background-color 120ms',
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.5, width: '100%' }}>
        <Box sx={{ color, mt: 0.25, flexShrink: 0 }}>{getTypeIcon(notification.type)}</Box>
        <ListItemText
          primary={
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ fontWeight: notification.isRead ? 400 : 600, flex: 1 }}
              >
                {notification.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {timestamp}
              </Typography>
            </Stack>
          }
          secondary={
            <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
              {notification.body}
            </Typography>
          }
          sx={{ my: 0 }}
        />
        <Stack direction="row" sx={{ flexShrink: 0, gap: 0.5 }}>
          {!notification.isRead ? (
            <Tooltip title="Mark as read">
              <IconButton
                size="small"
                onClick={handleMarkRead}
                disabled={isBusy}
                aria-label="Mark as read"
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          <Tooltip title="Dismiss">
            <IconButton
              size="small"
              onClick={handleDismiss}
              disabled={isBusy}
              aria-label="Dismiss"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </ListItem>
  );
}
