'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { BrandedLoadingIndicator } from '@/components/branding/branded-loading-indicator';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import {
  configApi,
  useGetChatSettingsQuery,
  useUpdateChatSettingsMutation,
} from '@/store/apis/config-api';
import { useAppDispatch } from '@/store/hooks';

export function ChatSettingsForm() {
  const dispatch = useAppDispatch();
  const { data, isLoading, isError } = useGetChatSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateChatSettingsMutation();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derive from RTK Query cache — no useEffect mirror.
  const webSearchEnabled = data?.data?.webSearchEnabled ?? false;

  const handleToggle = async (checked: boolean) => {
    setStatus(null);
    setError(null);
    // Optimistic SoT write into the cache (undo on failure).
    const patch = dispatch(
      configApi.util.updateQueryData('getChatSettings', undefined, (draft) => {
        if (draft.data) {
          draft.data.webSearchEnabled = checked;
        }
      }),
    );
    try {
      await updateSettings({ webSearchEnabled: checked }).unwrap();
      setStatus(checked
        ? 'Web search enabled for the assistant.'
        : 'Web search disabled for the assistant.');
    } catch (err) {
      patch.undo();
      setError(err instanceof Error ? err.message : 'Could not update chat settings.');
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Chat assistant
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Control whether the ops chat assistant can search the web for current information.
          </Typography>
        </Box>

        {isLoading ? (
          <BrandedLoadingIndicator size={24} />
        ) : (
          <FormControlLabel
            control={(
              <Switch
                checked={webSearchEnabled}
                onChange={(event) => void handleToggle(event.target.checked)}
                disabled={isSaving}
              />
            )}
            label="Enable web search"
          />
        )}

        <Typography variant="caption" color="text.secondary">
          When enabled, the assistant can use OpenAI web search for live data, news, and current facts.
        </Typography>

        {isError ? (
          <Alert severity="error">Could not load chat settings.</Alert>
        ) : null}
        {error ? <Alert severity="error">{error}</Alert> : null}
        {status ? <Alert severity="success">{status}</Alert> : null}
      </Stack>
    </Paper>
  );
}
