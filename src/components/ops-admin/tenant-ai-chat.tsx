'use client';

/**
 * TenantAIChat — AI Chat conversation management scoped to a specific tenant.
 *
 * Wraps the ConversationManager functionality with tenant context awareness.
 */

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import ArchiveIcon from '@mui/icons-material/Archive';
import RefreshIcon from '@mui/icons-material/Refresh';
import UnarchiveIcon from '@mui/icons-material/Unarchive';

import {
  useListAdminConversationsQuery,
  useArchiveAdminConversationMutation,
} from '@/store/apis/admin-api';

interface TenantAIChatProps {
  tenantSlug: string;
  tenantName?: string;
  appId?: string | null;
}

export function TenantAIChat({ tenantSlug, tenantName, appId }: TenantAIChatProps) {
  const [showArchived, setShowArchived] = useState(false);
  const { data, isLoading, isError, refetch } = useListAdminConversationsQuery({
    limit: 100,
    archived: showArchived,
    tenantSlug,
    appId: appId ?? undefined,
  });
  const [archive, { isLoading: isArchiving }] = useArchiveAdminConversationMutation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <BrandedLoadingIndicator  />
      </Box>
    );
  }

  if (isError || !data?.success) {
    return <Alert severity="error">Failed to load conversations for tenant {tenantSlug}.</Alert>;
  }

  // Server already scopes by tenantSlug/appId (see admin/conversations route).
  // Existing conversations from before this column existed have tenant_slug
  // NULL and won't appear here until the live chat route stamps them.
  const tenantConversations = data.data.conversations ?? [];

  const handleArchive = async (id: number, archived: boolean) => {
    await archive({ id, archived, tenantSlug, appId: appId ?? undefined }).unwrap();
    refetch();
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, overflow: 'hidden' }}>
      <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            AI Chat Conversations — {tenantName || tenantSlug}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage AI assistant conversations for this tenant.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                size="small"
              />
            }
            label="Show Archived"
          />
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <TableContainer sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Messages</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tenantConversations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary">
                  {showArchived ? 'No archived conversations.' : 'No active conversations.'}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            tenantConversations.map((c) => (
              <TableRow key={c.id}>
                <TableCell sx={{ fontFamily: 'monospace' }}>#{c.id}</TableCell>
                <TableCell sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.owner_sub || 'Unknown'}</TableCell>
                <TableCell>{c.message_count ?? 0}</TableCell>
                <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  {c.archived ? (
                    <Chip label="Archived" size="small" color="default" variant="outlined" />
                  ) : (
                    <Chip label="Active" size="small" color="success" variant="outlined" />
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleArchive(c.id, !c.archived)}
                    disabled={isArchiving}
                  >
                    {c.archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      </TableContainer>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Showing {tenantConversations.length} conversation{tenantConversations.length !== 1 ? 's' : ''} 
        {showArchived ? ' (including archived)' : ''} for tenant {tenantSlug}
      </Typography>
    </Paper>
  );
}

export default TenantAIChat;
