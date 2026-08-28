'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import ChecklistIcon from '@mui/icons-material/Checklist';
import CloseIcon from '@mui/icons-material/Close';
import { useSavedConversations } from '@/hooks/use-saved-conversations';

const MIN_RENAME_TITLE_LENGTH = 20;

export interface ChatHistoryPanelProps {
  /** Called after a conversation is loaded into the active chat thread. */
  onConversationLoaded?: () => void;
}

function isValidRenameTitle(title: string): boolean {
  return title.trim().length >= MIN_RENAME_TITLE_LENGTH;
}

function formatCreatedAt(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ChatHistoryPanel({ onConversationLoaded }: ChatHistoryPanelProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const {
    conversations,
    conversationsLoading,
    isLoadingConversation,
    isMutating,
    load,
    rename,
    setArchived,
    remove,
  } = useSavedConversations({ archived: showArchived, limit: 50 });

  const handleArchiveToggle = (checked: boolean) => {
    setShowArchived(checked);
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const selectedList = useMemo(() => Array.from(selectedIds), [selectedIds]);
  const allSelected = conversations.length > 0 && selectedList.length === conversations.length;
  const busy = conversationsLoading || isLoadingConversation || isMutating;

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(conversations.map((c) => c.id)));
  };

  const handleOpen = async (id: number) => {
    if (selectMode) {
      toggleSelected(id);
      return;
    }
    await load(id);
    onConversationLoaded?.();
  };

  const handleArchiveSelected = async () => {
    if (!selectedList.length) return;
    await setArchived(selectedList, !showArchived);
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const handleDeleteSelected = async () => {
    if (!selectedList.length) return;
    await remove(selectedList);
    setDeleteConfirmOpen(false);
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const openRename = () => {
    if (selectedList.length !== 1) return;
    const target = conversations.find((c) => c.id === selectedList[0]);
    setRenameValue(target?.title ?? '');
    setRenameOpen(true);
  };

  const handleRename = async () => {
    if (selectedList.length !== 1) return;
    const nextTitle = renameValue.trim();
    if (!isValidRenameTitle(nextTitle)) return;
    await rename(selectedList[0]!, nextTitle);
    setRenameOpen(false);
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const renameTitleValid = isValidRenameTitle(renameValue);
  const renameHelperText = renameTitleValid
    ? undefined
    : `Title must be at least ${MIN_RENAME_TITLE_LENGTH} characters (${renameValue.trim().length}/${MIN_RENAME_TITLE_LENGTH})`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 1.5,
          py: 1,
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1, minWidth: 0 }}>
          {showArchived ? 'Archived' : 'Saved chats'}
          {selectMode && selectedList.length > 0 ? ` · ${selectedList.length}` : ''}
        </Typography>

        {(conversationsLoading || isLoadingConversation) && conversations.length > 0 ? (
          <CircularProgress size={14} sx={{ mr: 0.5 }} />
        ) : null}

        <FormControlLabel
          sx={{ mr: 0.5, ml: 0, '& .MuiFormControlLabel-label': { fontSize: 12 } }}
          control={
            <Switch
              size="small"
              checked={showArchived}
              onChange={(event) => handleArchiveToggle(event.target.checked)}
              disabled={busy}
            />
          }
          label="Archive"
        />

        <Tooltip title={selectMode ? 'Exit selection' : 'Select conversations'}>
          <IconButton
            size="small"
            aria-label={selectMode ? 'Exit selection mode' : 'Enter selection mode'}
            aria-pressed={selectMode}
            onClick={() => {
              setSelectMode((prev) => !prev);
              setSelectedIds(new Set());
            }}
            disabled={busy || conversations.length === 0}
            color={selectMode ? 'primary' : 'default'}
          >
            {selectMode ? <CloseIcon fontSize="small" /> : <ChecklistIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {selectMode ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.75,
            flexShrink: 0,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Button size="small" onClick={handleSelectAll} disabled={busy || conversations.length === 0}>
            {allSelected ? 'Clear' : 'Select all'}
          </Button>
          <Box sx={{ flex: 1 }} />
          <Tooltip title={showArchived ? 'Restore to saved' : 'Archive selected'}>
            <span>
              <IconButton
                size="small"
                aria-label={showArchived ? 'Restore selected conversations' : 'Archive selected conversations'}
                onClick={() => void handleArchiveSelected()}
                disabled={busy || selectedList.length === 0}
              >
                {showArchived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rename (one selected)">
            <span>
              <IconButton
                size="small"
                aria-label="Rename selected conversation"
                onClick={openRename}
                disabled={busy || selectedList.length !== 1}
              >
                <DriveFileRenameOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete selected">
            <span>
              <IconButton
                size="small"
                aria-label="Delete selected conversations"
                color="error"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={busy || selectedList.length === 0}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ) : null}

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {conversationsLoading && conversations.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : conversations.length === 0 ? (
          <Box sx={{ px: 2, py: 4 }}>
            <Typography variant="body2" color="text.secondary" align="center">
              {showArchived
                ? 'No archived conversations yet.'
                : 'No saved conversations yet. Save a chat from the tools panel to see it here.'}
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {conversations.map((conversation) => {
              const selected = selectedIds.has(conversation.id);
              const title = conversation.title?.trim() || `Conversation ${conversation.id}`;
              const secondary = [
                `${conversation.message_count ?? 0} messages`,
                formatCreatedAt(conversation.created_at),
              ].filter(Boolean).join(' · ');

              return (
                <ListItem
                  key={conversation.id}
                  disablePadding
                  secondaryAction={
                    selectMode ? undefined : (
                      <Tooltip title={showArchived ? 'Restore' : 'Archive'}>
                        <IconButton
                          edge="end"
                          size="small"
                          aria-label={showArchived ? 'Restore conversation' : 'Archive conversation'}
                          disabled={busy}
                          onClick={() => void setArchived([conversation.id], !showArchived)}
                        >
                          {showArchived
                            ? <UnarchiveIcon fontSize="small" />
                            : <ArchiveIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <ListItemButton
                    selected={selected}
                    disabled={busy && !selectMode}
                    onClick={() => void handleOpen(conversation.id)}
                    sx={{ pr: selectMode ? 1 : 6 }}
                  >
                    {selectMode ? (
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          size="small"
                          checked={selected}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                    ) : null}
                    <ListItemText
                      primary={title}
                      secondary={secondary}
                      slotProps={{
                        primary: {
                          variant: 'body2',
                          noWrap: true,
                          sx: { fontWeight: 600 },
                        },
                        secondary: {
                          variant: 'caption',
                          noWrap: true,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Rename conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={renameValue}
            error={!renameTitleValid}
            helperText={renameHelperText}
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleRename();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void handleRename()}
            disabled={busy || !renameTitleValid}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Delete conversations?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Permanently delete {selectedList.length} conversation
            {selectedList.length === 1 ? '' : 's'}? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDeleteSelected()}
            disabled={busy}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
