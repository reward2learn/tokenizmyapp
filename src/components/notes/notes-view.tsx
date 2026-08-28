'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ShareIcon from '@mui/icons-material/Share';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import { MarkdownBody } from '@/components/blocks/markdown-body';
import {
  useCreateNoteMutation,
  useDeleteInboxNotesMutation,
  useDeleteNotesMutation,
  useGetNotesQuery,
  useShareNoteMutation,
  useUnshareNoteMutation,
  useUpdateNoteMutation,
  type AppNote,
  type NoteShareRecipient,
  type NoteSource,
  type NoteTeamMember,
  type SharedNote,
} from '@/store/apis/chat-api';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function sourceLabel(source: NoteSource): string {
  switch (source) {
    case 'manual':
      return 'Manual';
    case 'assistant':
      return 'From chat';
    case 'conversation':
      return 'Conversation';
    default: {
      const _exhaustive: never = source;
      return _exhaustive;
    }
  }
}

function memberLabel(member: NoteTeamMember): string {
  return member.name?.trim() || member.email?.trim() || member.sub;
}

function senderLabel(note: SharedNote): string {
  return note.sharedFrom.name?.trim() || note.sharedFrom.email?.trim() || 'Teammate';
}

function shareRecipientLabel(share: NoteShareRecipient): string {
  return share.name?.trim() || share.email?.trim() || share.sub;
}

function sharedInboxDate(note: SharedNote): string {
  if (note.updatedAt && note.updatedAt > note.sharedFrom.sharedAt) {
    return `Updated ${formatDate(note.updatedAt)}`;
  }
  return `Shared ${formatDate(note.sharedFrom.sharedAt)}`;
}

interface SharedRecipientsPanelProps {
  note: AppNote;
  onStatus: (message: string) => void;
}

function SharedRecipientsPanel({ note, onStatus }: SharedRecipientsPanelProps) {
  const [unshareNote, { isLoading }] = useUnshareNoteMutation();
  const shares = note.shares ?? [];

  const handleRevoke = useCallback(async (recipientSub: string) => {
    try {
      const result = await unshareNote({ noteId: note.id, recipientSub }).unwrap();
      const label = result.data?.recipients?.[0]?.label ?? 'teammate';
      onStatus(`Stopped sharing with ${label}.`);
    } catch {
      onStatus('Could not revoke share.');
    }
  }, [note.id, onStatus, unshareNote]);

  const handleRevokeAll = useCallback(async () => {
    try {
      const result = await unshareNote({ noteId: note.id, revokeAll: true }).unwrap();
      const count = result.data?.removedFromInboxes ?? 0;
      onStatus(`Revoked sharing for ${count} teammate${count === 1 ? '' : 's'}.`);
    } catch {
      onStatus('Could not revoke shares.');
    }
  }, [note.id, onStatus, unshareNote]);

  if (shares.length === 0) return null;

  return (
    <Paper
      variant="outlined"
      sx={{ mt: 1.5, p: 1.5, bgcolor: 'action.hover' }}
    >
      <Stack spacing={1}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Shared with {shares.length} teammate{shares.length === 1 ? '' : 's'} · edits sync automatically
          </Typography>
          <Button
            size="small"
            color="warning"
            startIcon={<LinkOffIcon />}
            disabled={isLoading}
            onClick={() => void handleRevokeAll()}
          >
            Revoke all
          </Button>
        </Stack>
        {shares.map((share) => (
          <Stack
            key={share.sub}
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography variant="body2">
              {shareRecipientLabel(share)}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                since {formatDate(share.sharedAt)}
              </Typography>
            </Typography>
            <Button
              size="small"
              color="warning"
              disabled={isLoading}
              onClick={() => void handleRevoke(share.sub)}
            >
              Revoke
            </Button>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

interface ShareDialogProps {
  open: boolean;
  note: AppNote | null;
  teamMembers: NoteTeamMember[];
  onClose: () => void;
  onShared: (message: string) => void;
}

function ShareNoteDialog({ open, note, teamMembers, onClose, onShared }: ShareDialogProps) {
  const [shareNote, { isLoading }] = useShareNoteMutation();
  const [mode, setMode] = useState<'one' | 'all'>('one');
  const [recipientSub, setRecipientSub] = useState('');

  const handleClose = useCallback(() => {
    setMode('one');
    setRecipientSub('');
    onClose();
  }, [onClose]);

  const handleShare = useCallback(async () => {
    if (!note) return;
    try {
      const result = await shareNote({
        noteId: note.id,
        ...(mode === 'all'
          ? { shareWithAll: true }
          : { recipientSub }),
      }).unwrap();
      const count = result.data?.delivered ?? 0;
      onShared(count > 0 ? `Shared with ${count} teammate${count === 1 ? '' : 's'}.` : 'Note shared.');
      handleClose();
    } catch {
      onShared('Could not share note.');
    }
  }, [handleClose, mode, note, onShared, recipientSub, shareNote]);

  const canShare = mode === 'all' || Boolean(recipientSub);

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Share note</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Notes stay private until you share them. Choose one teammate or everyone on your team.
          </Typography>
          {note ? (
            <Typography variant="subtitle2">{note.title}</Typography>
          ) : null}
          <FormControl>
            <RadioGroup
              value={mode}
              onChange={(e) => setMode(e.target.value as 'one' | 'all')}
            >
              <FormControlLabel value="one" control={<Radio size="small" />} label="One teammate" />
              <FormControlLabel value="all" control={<Radio size="small" />} label="Everyone on the team" />
            </RadioGroup>
          </FormControl>
          {mode === 'one' ? (
            <FormControl fullWidth size="small">
              <InputLabel id="share-recipient-label">Teammate</InputLabel>
              <Select
                labelId="share-recipient-label"
                label="Teammate"
                value={recipientSub}
                onChange={(e) => setRecipientSub(e.target.value)}
              >
                {teamMembers.map((member) => (
                  <MenuItem key={member.sub} value={member.sub}>
                    {memberLabel(member)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
          {teamMembers.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No other team members found yet. Invite teammates in Ops Admin first.
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          disabled={!note || !canShare || isLoading || teamMembers.length === 0}
          onClick={() => void handleShare()}
        >
          {isLoading ? 'Sharing…' : 'Share'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface EditDialogProps {
  open: boolean;
  note: AppNote | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function EditNoteDialog({ open, note, onClose, onSaved }: EditDialogProps) {
  const [updateNote, { isLoading }] = useUpdateNoteMutation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!open || !note) return;
    setTitle(note.title);
    setContent(note.content);
  }, [note, open]);

  const handleSave = useCallback(async () => {
    if (!note) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    try {
      const result = await updateNote({
        id: note.id,
        title: title.trim() || note.title,
        content: trimmed,
      }).unwrap();
      const syncedTo = result.data?.syncedTo ?? 0;
      if (syncedTo > 0) {
        onSaved(`Note updated and synced to ${syncedTo} inbox${syncedTo === 1 ? '' : 'es'}.`);
      } else {
        onSaved('Note updated.');
      }
      onClose();
    } catch {
      onSaved('Could not update note.');
    }
  }, [content, note, onClose, onSaved, title, updateNote]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit note</DialogTitle>
      <DialogContent>
        <Stack spacing={1.5} sx={{ pt: 0.5 }}>
          {(note?.shares?.length ?? 0) > 0 ? (
            <Typography variant="body2" color="text.secondary">
              This note is shared — your edits will sync to teammates&apos; inboxes.
            </Typography>
          ) : null}
          <TextField
            size="small"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            size="small"
            label="Note"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            minRows={4}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!note || isLoading || !content.trim()}
          onClick={() => void handleSave()}
        >
          {isLoading ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function NotesView() {
  const { data, isLoading } = useGetNotesQuery();
  const [createNote, { isLoading: creating }] = useCreateNoteMutation();
  const [deleteNotes, { isLoading: deletingPersonal }] = useDeleteNotesMutation();
  const [deleteInboxNotes, { isLoading: deletingInbox }] = useDeleteInboxNotesMutation();

  const mine = useMemo((): AppNote[] => {
    return data?.data?.mine ?? data?.data?.notes ?? [];
  }, [data]);

  const sharedWithMe = useMemo((): SharedNote[] => {
    return data?.data?.sharedWithMe ?? [];
  }, [data]);

  const teamMembers = useMemo((): NoteTeamMember[] => {
    return data?.data?.teamMembers ?? [];
  }, [data]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [shareTarget, setShareTarget] = useState<AppNote | null>(null);
  const [editTarget, setEditTarget] = useState<AppNote | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCreate = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setStatus(null);
    try {
      await createNote({
        content: trimmed,
        title: title.trim() || undefined,
        source: 'manual',
      }).unwrap();
      setTitle('');
      setContent('');
      setStatus('Note saved.');
    } catch {
      setStatus('Could not save note.');
    }
  }, [content, createNote, title]);

  const handleDeletePersonal = useCallback(async (id: string) => {
    try {
      await deleteNotes([id]).unwrap();
    } catch {
      setStatus('Could not delete note.');
    }
  }, [deleteNotes]);

  const handleRemoveInbox = useCallback(async (id: string) => {
    try {
      await deleteInboxNotes([id]).unwrap();
    } catch {
      setStatus('Could not remove shared note.');
    }
  }, [deleteInboxNotes]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <BrandedLoadingIndicator size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 880, mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1">
          Notes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your notes are private by default. Share them with one teammate or the whole team when you are ready.
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">New note</Typography>
          <TextField
            size="small"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            size="small"
            label="Note"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            placeholder="Write a note…"
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
            {status ? (
              <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
                {status}
              </Typography>
            ) : null}
            <Button
              variant="contained"
              startIcon={<NoteAddIcon />}
              onClick={() => void handleCreate()}
              disabled={creating || !content.trim()}
            >
              {creating ? 'Saving…' : 'Add note'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {sharedWithMe.length > 0 ? (
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          <Typography variant="subtitle1">Shared with me</Typography>
          <Stack spacing={1}>
            {sharedWithMe.map((note) => (
              <Accordion
                key={note.id}
                expanded={expandedIds.has(note.id)}
                onChange={() => toggleExpand(note.id)}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexWrap: 'wrap', width: '100%', pr: 1, gap: 0.5 }}
                  >
                    <Typography variant="subtitle2" sx={{ flex: 1, minWidth: 0 }}>
                      {note.title}
                    </Typography>
                    <Chip size="small" label={`From ${senderLabel(note)}`} color="info" variant="outlined" />
                    <Chip size="small" label={sourceLabel(note.source)} variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                      {sharedInboxDate(note)}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <MarkdownBody markdown={note.content} />
                  <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      disabled={deletingInbox}
                      onClick={() => void handleRemoveInbox(note.id)}
                    >
                      Remove from inbox
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
          <Divider />
        </Stack>
      ) : null}

      <Stack spacing={1.5}>
        <Typography variant="subtitle1">My notes</Typography>
        {mine.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
            No notes yet. Add one above, or use “Add to Notes” on an assistant message in AI Chat.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {mine.map((note) => (
              <Accordion
                key={note.id}
                expanded={expandedIds.has(note.id)}
                onChange={() => toggleExpand(note.id)}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexWrap: 'wrap', width: '100%', pr: 1, gap: 0.5 }}
                  >
                    <Typography variant="subtitle2" sx={{ flex: 1, minWidth: 0 }}>
                      {note.title}
                    </Typography>
                    <Chip size="small" label={sourceLabel(note.source)} variant="outlined" />
                    {(note.shares?.length ?? 0) > 0 ? (
                      <Chip
                        size="small"
                        label={`Shared · ${note.shares?.length}`}
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip size="small" label="Private" variant="outlined" />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(note.updatedAt ?? note.createdAt)}
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <MarkdownBody markdown={note.content} />
                  <SharedRecipientsPanel note={note} onStatus={setStatus} />
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mt: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      startIcon={<ShareIcon />}
                      disabled={teamMembers.length === 0}
                      onClick={() => setShareTarget(note)}
                    >
                      Share
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => setEditTarget(note)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      disabled={deletingPersonal}
                      onClick={() => void handleDeletePersonal(note.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Stack>

      <ShareNoteDialog
        open={shareTarget != null}
        note={shareTarget}
        teamMembers={teamMembers}
        onClose={() => setShareTarget(null)}
        onShared={setStatus}
      />
      <EditNoteDialog
        open={editTarget != null}
        note={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={setStatus}
      />
    </Box>
  );
}
