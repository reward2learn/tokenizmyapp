'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearTemplateDraft } from '@/store/chat-stream-slice';
import { useSaveCustomTemplateDraftMutation } from '@/store/apis/template-api';

/**
 * Confirmation card for a template the assistant designed but has not saved.
 *
 * The build tool used to generate and store in one step, so a chat turn added
 * platform configuration the administrator had never seen, and rejecting a bad
 * design meant deleting it afterwards. This is the review step: the design is
 * shown, and nothing is written until "Save & Create Template" is pressed.
 *
 * Saving posts the draft back rather than regenerating — generation costs
 * credits and is non-deterministic, so a second run would both charge again and
 * risk storing something other than what was approved.
 */
export function TemplateDraftCard() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.chatStream.templateDraft);
  const [saveDraft, { isLoading }] = useSaveCustomTemplateDraftMutation();
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!draft) return null;

  const handleSave = async () => {
    setError(null);
    try {
      const result = await saveDraft({ draft }).unwrap();
      setSaved(result.data?.template?.label ?? draft.label);
    } catch (err) {
      const message =
        (err as { data?: { error?: string } })?.data?.error ?? 'Could not save the template.';
      setError(message);
    }
  };

  if (saved) {
    return (
      <Alert
        severity="success"
        icon={<CheckCircleIcon fontSize="inherit" />}
        onClose={() => dispatch(clearTemplateDraft())}
        sx={{ mb: 1 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {saved} added to the template library
        </Typography>
        <Typography variant="caption" color="text.secondary">
          It is now selectable in the Create New App wizard for any tenant.
        </Typography>
      </Alert>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1, borderColor: 'primary.main' }}>
      <Stack spacing={1}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {draft.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {draft.description}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {draft.pageTitles.map((title) => (
            <Chip key={title} label={title} size="small" variant="outlined" />
          ))}
        </Box>

        <Typography variant="caption" color="text.secondary">
          {draft.walletSummary}
        </Typography>

        {draft.rationale ? (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {draft.rationale}
          </Typography>
        ) : null}

        {error ? (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving…' : 'Save & Create Template'}
          </Button>
          <Button
            size="small"
            color="inherit"
            onClick={() => dispatch(clearTemplateDraft())}
            disabled={isLoading}
          >
            Discard
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Not saved yet. Ask for changes in the chat to redesign it.
        </Typography>
      </Stack>
    </Paper>
  );
}
